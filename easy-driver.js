'use strict';

const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromePath = require('chromedriver').path;
const fs = require('fs-extra');

// TODO: https://www.npmjs.com/package/css-selector-parser
// TODO: https://www.npmjs.com/package/firefox-profile
// TODO: https://www.npmjs.com/package/webdriver-sizzle-promised
// TODO: https://www.npmjs.com/package/html-dnd
// TODO: https://www.npmjs.com/package/selenium-query
// TODO: https://github.com/mcherryleigh/webdriver-marker/blob/master/index.js

class EasyDriver {
  /**
   * @param {string} [locale=en] - The locale of WebDriver
  */
  constructor(locale = 'en') {
    // WebDriver
    this.By = webdriver.By;
    this.Key = webdriver.Key;
    this.until = webdriver.until;

    this.TIMEOUT = 30000;

    // Chrome Driver
    const options = new chrome.Options();
    options.addArguments(`--lang=${locale}`);

    const service = new chrome.ServiceBuilder(chromePath).build();

    this.wd = new chrome.Driver(options, service);
  }

  /*--- ***************** ---*/
  /*--- WebDriver Methods ---*/
  /*--- ***************** ---*/

  /**
   * Create a new action sequence
   * @return {ActionSequence} - A new action sequence.
   */
  actions() {
    return this.wd.actions();
  }

  /**
   * Close the current window
   * @return {Thenable<undefined>}
   */
  close() {
    return this.wd.close();
  }

  /**
   * Find Element
   * @param {string} locator - Element locator.
   * @param {bool} [isDisplayed=false] Wait until WebElement is displayed.
   * @return {WebElementPromise} - A WebElement that can be used to issue commands against the located element.
   */
  findElement(locator, isDisplayed = false) {
    if (locator instanceof webdriver.WebElement) {
      if (isDisplayed) this.wait(this.until.elementIsVisible(locator));
      return locator;
    }

    // Add ':eq()' support to css selector
    const re = /:eq\((\d+)\)/;
    const found = locator.match(re);

    if(!found) {
      const byLocator = this.locateElementBy(locator);

      this.wait(this.until.elementsLocated(byLocator));

      const element = this.wd.findElement(byLocator);

      if (isDisplayed) this.wait(this.until.elementIsVisible(element));

      return element;
    }

    const query = locator.substring(0, found['index']);
    const nth = found[1];
    const self = this;

    return self.findElements(query)
    .then(function (elements) {
      if (nth > elements.length) {
        console.error('Maximum index for ${locator} is ${elements.length}.');
        return elements;
      }

      const element = elements[nth];
      if (isDisplayed) self.wait(self.until.elementIsVisible(element));
      return element;
    });
  }

  /**
   * Find Elements
   * @param {string} locator - Element locator.
   * @return {Thenable<Array<WebElement>>} - A promise that will resolve to an array of WebElements.
   */
  findElements(locator) {
    const byLocator = this.locateElementBy(locator);

    this.wait(this.until.elementsLocated(byLocator));

    return this.wd.findElements(byLocator);
  }

  /**
   * Get title
   * @return {Thenable<string>} - A promise that will be resolved with the current page's title.
   */
  getTitle() {
    return this.wd.getTitle();
  }

  /**
   * Locate element 'By' strategies
   * @param {string} locator - Element locator with: strategy=search_string.
   * @return {By} A new By locator.
   */
  locateElementBy(locator) {
    locator = parseLocator(locator);

    if (locator.type === 'css') { return this.By.css(locator.string); }
    if (locator.type === 'xpath') { return this.By.xpath(locator.string); }
    if (locator.type === 'class') { return this.By.className(locator.string); }
    if (locator.type === 'id') { return this.By.id(locator.string); }
    if (locator.type === 'name') { return this.By.name(locator.string); }
    if (locator.type === 'implicit') {
      if (locator.string.startsWith('//') || locator.string.startsWith('(')) {
        return this.By.xpath(locator.string);
      }
      if (locator.string.startsWith('.') || locator.string.startsWith('[') || locator.string.startsWith('#')) {
        return this.By.css(locator.string);
      }
      console.error(`Can not locate an element with '${locator.string}'.`);
    } else {
      console.error(`Can not locate an element by type '${locator.type}'.`);
    }

    console.log(`Supported locator types are: css=, xpath=, class=, id=, name=.`);
    process.exit(1);
  }

  /**
   * Maximize the window
   * @return {Thenable<undefined>}
   */
  maximizeWindow() {
    return this.wd.manage().window().maximize();
  }

  /**
   * Maximize the window to the screen size
   */
  maximizeToScreenSize() {
    const self = this;
    self.wd.executeScript(`
      return {width: window.screen.width, height: window.screen.height};
    `).then (function (size) {
      self.wd.manage().window().setPosition(0, 0);
      self.wd.manage().window().setSize(size.width, size.height);
    });
  }

  /**
   * Open URL
   * @param {string} url - A fully qualified URL to open.
   * @return {Thenable<undefined>}
   */
  open(url) {
    return this.wd.get(url);
  }

  /**
   * Terminates the browser session
   * @return {Thenable<undefined>}
   */
  quit() {
    return this.wd.quit();
  }

  /**
   * Run script
   * @param {(string|Function)} script - The script to execute.
   * @param {Function} fn - A callback function aftrer the script is executed.
   */
  runScript(script, fn) {
    this.wd.executeScript(script)
    .then(function (retval) {
      // * For a HTML element, the value will resolve to a WebElement
      // * Null and undefined return values will resolve to null
      // * Booleans, numbers, and strings will resolve as is
      // * Functions will resolve to their string representation
      // * For arrays and objects, each member item will be converted according to the rules above
      fn(retval);
    })
    .catch(function (err) {
      fn(err);
    });
  }

  /**
   * Set the default timeout for 'Wait'
   * @param {number} timeout - Default timeout in milliseconds.
   */
  setTimeout(timeout) {
    this.TIMEOUT = parseInt(timeout) || this.TIMEOUT;
  }

  /**
   * Sleep
   * @param {number} ms - The amount of time, in milliseconds, to sleep.
   * @return {Thenable<undefined>}
   */
  sleep(ms) {
    ms = parseInt(ms) || 0;
    return this.wd.sleep(ms);
  }

  /**
   * Switch to frame
   * @param {(number|string|WebElement)} locator - The frame locator.
   * @return {Thenable<undefined>}
   */
  switchToFrame(locator) {
    const self = this;
    const element = (isNaN(locator)) ? self.findElement(locator) : locator;

    return self.wd.switchTo().defaultContent().then(function () {
      return self.wd.switchTo().frame(element);
    });
  }

  /**
   * Switch to window
   * @param {string} nameOrHandle - The name or window handle of the window to switch focus to.
   * @return {Thenable<undefined>}
   */
  switchToWindow(nameOrHandle) {
    return this.wd.switchTo().window(nameOrHandle);
  }

  /**
   * Take a screenshot
   * @param {string} filename - File name (.png) of the screenshot.
   */
  takeScreenshot(filename) {
    if (!filename.endsWith('.png')) filename += '.png';

    this.sleep(500);

    this.wd.takeScreenshot().then(function (data) {
      const base64Data = data.replace(/^data:image\/png;base64,/, "");
      fs.writeFile(filename, base64Data, 'base64', function (err) {
        if(err) console.error(err);
      });
    });
  }

  /**
   * Wait
   * @param {Function} condition - A function to evaluate as a condition.
   * @param {number} [timeout] - Wait timeout.
   * @return {Thenable}
   */
  wait(condition, timeout) {
    timeout = parseInt(timeout) || this.TIMEOUT;
    return this.wd.wait(condition, timeout);
  }

  /*--- ****************** ---*/
  /*--- WebElement Methods ---*/
  /*--- ****************** ---*/

  /**
   * Remove focus from an element
   * @param {(string|WebElement)} locator - Element locator.
   */
  blur(locator) {
    const element = this.findElement(locator);
    this.wd.executeScript(`
      var element = arguments[0];
      element.blur();
    `, element);
  }

  /**
   * Clear the value of an element
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<undefined>}
   */
  clear(locator) {
    return this.findElement(locator).clear();
  }

  /**
   * Click an element
   * @param {(string|WebElement)} locator - Element locator.
   * @param {number} ms - Sleep in milliseconds after clicking the element.
   */
  click(locator, ms) {
    this.findElement(locator, true).click();
    this.sleep(ms);
  }

  /**
   * Click an element with an offset
   * @param {(string|WebElement)} locator - Element locator.
   * @param {{x: number, y: number}} [offset={x: 0, y: 0}] - An offset within the element.
   */
  clickAt(locator, offset = {x: 0, y: 0}) {
    const self = this;
    self.findElement(locator, true).then(function (element) {
      self.actions().mouseMove(element, offset).click().perform();
    });
  }

  /**
   * Give focus to an element
   * @param {(string|WebElement)} locator - Element locator.
   */
  focus(locator) {
    const element = this.findElement(locator);
    this.wd.executeScript(`
      var element = arguments[0];
      element.focus();
    `, element);
  }

  /**
   * Get attribute value of an element
   * @param {(string|WebElement)} locator - Element locator.
   * @param {string} attributeName - The name of the attribute to query.
   * @return {Thenable<(string|null)>}
   */
  getAttribute(locator, attributeName) {
    return this.findElement(locator).getAttribute(attributeName);
  }

  /**
   * Get Position and Size of an element
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<{x: number, y: number, width: number, height: number}>}
   */
  getRect(locator) {
    const element = this.findElement(locator);

    // return new Promise(function (resolve, reject) {
    //   element.getLocation().then(function (position) {
    //     element.getSize().then(function (size) {
    //       resolve({x: position.x, y: position.y, width: size.width, height: size.height});
    //     });
    //   });
    // });

    return webdriver.promise.consume(function* () {
      return element.getLocation().then(function (position) {
        return element.getSize().then(function (size) {
          return ({x: position.x, y: position.y, width: size.width, height: size.height});
        });
      });
    });
  }

  /**
   * Get Get tag name of an element
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<string>}
   */
  getTagName(locator) {
    return this.findElement(locator).getTagName();
  }

  /**
   * Get Get the visible innerText of an element
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<string>}
   */
  getText(locator) {
    return this.findElement(locator).getText();
  }


  // TODO: Need to think how to implement isEnabled/isDisplayed/isSelected
  /**
   * If an element is displayed
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<boolean>}
   */
  isDisplayed(locator) {
    return this.findElement(locator).isDisplayed();
  }

  // TODO: Need to think how to implement isEnabled/isDisplayed/isSelected
  /**
   * If an element is enabled
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<boolean>}
   */
  isEnabled(locator) {
    return this.findElement(locator).isEnabled();
  }

  // TODO: Need to think how to implement isEnabled/isDisplayed/isSelected
  /**
   * If an element is selected
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable<boolean>}
   */
  isSelected(locator) {
    return this.findElement(locator).isSelected();
  }

  /**
   * Move to an element by offset
   * @param {(string|WebElement)} locator - Element locator.
   * @param {{x: number, y: number}} [offset={x: 0, y: 0}] - An offset within the element.
   * @return {Thenable}
   */
  mouseMove(locator, offset = {x: 0, y: 0}) {
    return this.actions().mouseMove(this.findElement(locator, true), offset).perform();
  }

  /**
   * Scroll an element into view
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable(T|null)}
   */
  scrollIntoView(locator) {
    return this.wd.executeScript(`arguments[0].scrollIntoView(true);`, this.findElement(locator));
  }

  /**
   * Select an option in a drop-down menu
   * @param {(string|WebElement)} select_locator - <select> element locator.
   * @param {string} option_locator - <option> element locator.
   * @return {Thenable<undefined>}
   */
  select(select_locator, option_locator) {
    const select = this.findElement(select_locator, true);

    return select.findElement(this.locateElementBy(option_locator)).then(function (option) {
      return option.click();
    });
  }

  /**
   * Send keys to an element
   * @param {(string|WebElement)} locator - Element locator.
   * @param {string} keys - Keys to send.
   * @return {Thenable<undefined>}
   */
  sendKeys(locator, keys) {
    return this.findElement(locator).sendKeys(keys);
  }

  /**
   * Set attribute value for an element
   * @param {(string|WebElement)} select_locator - <select> element locator.
   * @param {string} attribute - attribute name
   * @param {string} value - attribute value
   */
  setAttribute(locator, attribute, value) {
    const element = this.findElement(locator);

    this.wd.executeScript(`
      var element = arguments[0];
      var attribute = arguments[1];
      var value = arguments[2];

      element.setAttribute(attribute, value);
    `, element, attribute, value);
  }

  /**
   * Wait till an element is disabled
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForDisabled(locator) {
    return this.wait(this.until.elementIsDisabled(this.findElement(locator)));
  }

  /**
   * Wait till an element is enabled
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForEnabled(locator) {
    return this.wait(this.until.elementIsEnabled(this.findElement(locator)));
  }

  /**
   * Wait till an element is not presented
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForNotPresent(locator) {
    return this.wait(this.until.stalenessOf(this.findElement(locator)));
  }

  /**
   * Wait till an element is not selected
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForNotSelected(locator) {
    return this.wait(this.until.elementIsNotSelected(this.findElement(locator)));
  }

  /**
   * Wait till an element is not visible
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForNotVisible(locator) {
    return this.wait(this.until.elementIsNotVisible(this.findElement(locator)));
  }

  /**
   * Wait till an element is present
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForPresent(locator) {
    return this.wait(this.until.elementsLocated(this.locateElementBy(locator)));
  }

  /**
   * Wait till an element is selected
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForSelected(locator) {
    return this.wait(this.until.elementIsSelected(this.findElement(locator)));
  }

  /**
   * Wait till an element's text contains substring
   * @param {(string|WebElement)} locator - Element locator.
   * @param {string} substr - The substring to search for.
   * @return {Thenable}
   */
  waitForTextContains(locator, substr) {
    return this.wait(this.until.elementTextContains(this.findElement(locator), substr));
  }

  /**
   * Wait till an element's innerText is text
   * @param {(string|WebElement)} locator - Element locator.
   * @param {string} text - The expected text.
   * @return {Thenable}
   */
  waitForTextIs(locator, text) {
    return this.wait(this.until.elementTextIs(this.findElement(locator), text));
  }

  /**
   * Wait till an element is visible
   * @param {(string|WebElement)} locator - Element locator.
   * @return {Thenable}
   */
  waitForVisible(locator) {
    return this.wait(this.until.elementIsVisible(this.findElement(locator)));
  }

  /*--- ************** ---*/
  /*--- Custom Methods ---*/
  /*--- ************** ---*/

  /**
   * Create directories
   * @param {string} dirtree - Directories to create.
   */
  createDirectories(dirtree) {
    if (! fs.existsSync(dirtree)){ fs.mkdirsSync(dirtree); }
  }

  /**
   * Clear all elements created by EasyDriver
   * @return {Thenable<(T|null)>}
   */
  clearEasyDriverElements() {
    return this.wd.executeScript(`
      var elements = window.document.body.querySelectorAll('[id*="easydriver_"]');
      for (var i = 0; i < elements.length; i++) {
        elements[i].remove();
      }
      window.easydriverTPSymbol = 9311;
      window.easydriverTPLastPos = {x: 0, y: 0};
    `);
  }

  /**
   * Draw an arrow between 2 element
   * @param {(string|WebElement)} from_locator - Element locator.
   * @param {(string|WebElement)} to_locator - Element locator.
   * @return {WebElementPromise}
   */
  drawArrow(from_locator, to_locator) {
    const self = this;
    const from = self.findElement(from_locator);
    const to = self.findElement(to_locator);
    const cId = getId();

    self.wd.executeScript(`
      var element1 = arguments[0];
      var element2 = arguments[1];

      var rect1 = element1.getBoundingClientRect();
      var rect2 = element2.getBoundingClientRect();

      var from = {y: rect1.top};
      var to = {y: rect2.top};

      if (rect1.left > rect2.left) { from.x = rect1.left; to.x = rect2.right; }
      else if (rect1.left < rect2.left) { from.x = rect1.right; to.x = rect2.left; }
      else { from.x = rect1.left; to.x = rect2.left; }

      // create canvas
      var canvas = document.createElement('canvas');
      canvas.id = "${cId}";
      canvas.style.left = "0px";
      canvas.style.top = "0px";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.zIndex = '100000';
      canvas.style.position = "absolute";
      document.body.appendChild(canvas);

      var headlen = 10;
      var angle = Math.atan2(to.y - from.y, to.x - from.x);
      var ctx = canvas.getContext("2d");

      // line
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineWidth  = 3;
      ctx.strokeStyle = '#ff0000';
      ctx.stroke();

      // arrow
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI/7), to.y - headlen * Math.sin(angle - Math.PI/7));
      ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI/7), to.y - headlen * Math.sin(angle + Math.PI/7));
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI/7), to.y - headlen * Math.sin(angle - Math.PI/7));
      ctx.lineWidth  = 3;
      ctx.strokeStyle = '#ff0000';
      ctx.stroke();

      return;
    `, from, to)
    .then(function () {
      return self.findElement(`[id="${cId}"]`);
    });
  }

  /**
   * Draw flyover for an element
   * @param {(string|WebElement)} locator - Element locator.
   * @param {{attribute: string, offsetX: number, offsetY: number, fromLastPos: boolean, drawSymbol: boolean}}
            [settings={attribute: 'title', offsetX: 5, offsetY: 15, fromLastPos: false, drawSymbol: false}]
            - attribute: draw flyover on element's attribute,
              offsetX: offset X from the element,
              offsetY: offset Y from the element,
              fromLastPos: draw from last Flyover position,
              drawSymbol: draw symbol on the flyover.
   * @return {WebElementPromise}
   */
  drawFlyover(locator, settings = {attribute: 'title', offsetX: 5, offsetY: 15, fromLastPos: false, drawSymbol: false}) {
    const self = this;
    const element = self.findElement(locator, true);
    const attribute = settings.attribute || 'title';
    const offsetX = settings.offsetX || 5;
    const offsetY = settings.offsetY || 15;
    const fromLastPos = settings.fromLastPos || false;
    const drawSymbol = settings.drawSymbol || false;
    const sId = getId();
    const tpId = getId();

    self.waitForVisible(element);

    return self.wd.executeScript(`
      var element = arguments[0];
      var offsetX = arguments[1];
      var offsetY = arguments[2];
      var fromLastPos = arguments[3];
      var drawSymbol = arguments[4];

      if (! window.easydriverTPSymbol) window.easydriverTPSymbol = 9311;
      if (! window.easydriverTPLastPos) window.easydriverTPLastPos = {x: 0, y: 0};

      var rect = element.getBoundingClientRect();

      var title = element.getAttribute("${attribute}") || 'N/A';

      var left = rect.left;
      var top = rect.top;

      if (drawSymbol) {
        window.easydriverTPSymbol++;
        var symbol = document.createElement('div');
        symbol.id = "${sId}";
        symbol.textContent = String.fromCharCode(easydriverTPSymbol);
        symbol.style.position = 'absolute';
        symbol.style.color = '#ff0000';
        symbol.style.fontSize = '12px';
        symbol.style.zIndex = '99999';
        symbol.style.display = 'block';
        symbol.style.top = top + 'px';
      	symbol.style.left = (left - 12) + 'px';
        document.body.appendChild(symbol);
      }

      var tooltip = document.createElement('div');
    	tooltip.id = "${tpId}";
    	tooltip.textContent = (drawSymbol) ? String.fromCharCode(easydriverTPSymbol) + " " + title : title;
    	tooltip.style.position = 'absolute';
    	tooltip.style.color = '#000';
    	tooltip.style.backgroundColor = '#F5FCDE';
    	tooltip.style.border = '3px solid #ff0000';
    	tooltip.style.fontSize = '12px';
    	tooltip.style.zIndex = '99999';
    	tooltip.style.display = 'block';
    	tooltip.style.height = '16px';
    	tooltip.style.padding = '2px';
    	tooltip.style.verticalAlign = 'middle';
    	tooltip.style.top = ((fromLastPos) ? window.easydriverTPLastPos.y : (top + offsetY)) + 'px';
    	tooltip.style.left = ((fromLastPos) ? window.easydriverTPLastPos.x : (left + offsetX)) + 'px';
    	document.body.appendChild(tooltip);
    	if (tooltip.scrollHeight > tooltip.offsetHeight) {
    		tooltip.style.height = (tooltip.scrollHeight + 3) + 'px';
    	}

      var lastPos = tooltip.getBoundingClientRect();
      window.easydriverTPLastPos = {x: lastPos.left, y: lastPos.bottom};

      return;
    `, element, offsetX, offsetY, fromLastPos, drawSymbol)
    .then(function () {
      return self.findElement(`[id="${tpId}"]`);
    });
  }

  /**
   * Draw red-mark around an element
   * @param {(string|WebElement)} locator - Element locator.
   * @param {{top: number, left: number, bottom: number, right: number}} [padding={top: 0, left: 0, bottom: 0, right: 0}] - Remark padding.
   * @return {WebElementPromise}
   */
  drawRedMark(locator, padding = {top: 0, left: 0, bottom: 0, right: 0}) {
    const self = this;
    const element = this.findElement(locator, true);
    const id = getId();

    return element.getLocation().then(function (location) {
      return element.getSize().then(function (size) {
        return self.wd.executeScript(`
          var redmark = window.document.createElement('div');
        	redmark.id = '${id}';
        	redmark.style.position = 'absolute';
        	redmark.style.border = '3px solid red';
        	redmark.style.zIndex = '99999';
        	redmark.style.display = 'block';
        	redmark.style.padding = '0px';
        	redmark.style.margin = '0px';
        	redmark.style.left = (${location.x} - 4 - ${padding.left}) + 'px';
        	redmark.style.top = (${location.y} - 4 - ${padding.top}) + 'px';
        	redmark.style.width = (${size.width} + 8 + ${padding.right}) + 'px';
        	redmark.style.height = (${size.height} + 8 + ${padding.bottom}) + 'px';

        	window.document.body.appendChild(redmark);

          return;
        `)
        .then(function () {
          return self.findElement(`[id="${id}"]`);
        });
      });
    });
  }

  /**
   * Draw drop-down menu for <select> element
   * @param {(string|WebElement)} locator - Element locator.
   * @param {{x: number, y: number}} [offset={x: 5, y: 15}] - Tooltip offset from the element
   * @return {WebElementPromise}
   */
  drawSelect(locator, offset = {x: 0, y: 0}) {
    const self = this;
    const element = self.findElement(locator, true);
    const sId = getId();

    self.getTagName(element).then(function (tagname) {
      if (tagname !== 'select') console.error('Element is not a select element: ${tagname}.');
    });

    self.waitForVisible(element);

    return self.wd.executeScript(`
      var element = arguments[0];
      var offsetX = arguments[1];
      var offsetY = arguments[2];

      var rect = element.getBoundingClientRect();
    	var x = rect.left;
    	var y = rect.bottom;
    	var width = element.offsetWidth;

      function escape(str) {
      	return str.replace(/[\\x26\\x0A<>'"]/g, function(r){ return "&#" + r.charCodeAt(0) + ";"; });
      }

    	var content = "";
    	for (var i = 0; i < element.length; i++) {
    		if (!element.options[i].disabled) content += escape(element.options[i].text) + "<br/>";
    	}

    	var dropdown = document.createElement('div');
    	dropdown.id = "${sId}";
      dropdown.innerHTML = content;
    	dropdown.style.position = 'absolute';
    	dropdown.style.color = '#000';
    	dropdown.style.backgroundColor = '#fff';
    	dropdown.style.border = '1px solid #000';
    	dropdown.style.padding = '2px';
    	dropdown.style.fontSize = '12px';
    	dropdown.style.zIndex = '99999';
    	dropdown.style.display = 'block';
    	dropdown.style.height = '1px';
    	dropdown.style.width = width + 'px';

    	document.body.appendChild(dropdown);
    	dropdown.style.height = (dropdown.scrollHeight + 8) + 'px';
    	if (dropdown.scrollWidth > width) {
    		dropdown.style.width = (dropdown.scrollWidth + 8) + 'px';
    	}
    	dropdown.style.left = (x + offsetX) + "px";
    	dropdown.style.top = (y + offsetY) + "px";

      return;
    `, element, offset.x, offset.y)
    .then(function () {
      return self.findElement(`[id="${sId}"]`);
    });
  }

}

// --- Internal Functions --- //

function getId() {
  return 'easydriver_' + Math.random().toString(32).slice(2);
}

function parseLocator (locator) {
  const result = locator.match(/^([A-Za-z]+)=.+/);
  if (result) {
    const type = result[1].toLowerCase();
    const actualLocator = locator.substring(type.length + 1);
    return { type: type, string: actualLocator };
  }
  return { type: 'implicit', string: locator };
};

module.exports = EasyDriver;
