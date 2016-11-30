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
    this.promise = webdriver.promise;

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
   * @return {ActionSequence} A new action sequence.
   */
  actions() {
    return this.wd.actions();
  }

  /**
   * Close the current window
   * @return {Thenable<undefined>}
   */
  close() {
    this.log(`  [-] close()`);
    return this.wd.close();
  }

  /**
   * Find Element
   * @param {string} locator Element locator
   * @param {bool} [isVisible=false] Wait until WebElement is visible
   * @return {WebElementPromise} A WebElement that can be used to issue commands against the located element.
   */
  findElement(locator, isVisible = false) {
    this.log(`      Locating: ${locator}`);

    if (locator instanceof webdriver.WebElement) {
      if (isVisible) this.wait(this.until.elementIsVisible(locator));
      return locator;
    }

    // Add ':eq()' support to css selector
    const re = /:eq\((\d+)\)/;
    const found = locator.match(re);

    if(!found) {
      const byLocator = this.locateElementBy(locator);

      this.wait(this.until.elementsLocated(byLocator));

      const element = this.wd.findElement(byLocator);

      if (isVisible) this.wait(this.until.elementIsVisible(element));

      return element;
    }

    const query = locator.substring(0, found.index);
    const nth = found[1];
    const self = this;

    return self.findElements(query)
    .then(function (elements) {
      if (nth > elements.length) {
        console.error('Maximum index for ${locator} is ${elements.length}.');
        return elements;
      }

      const element = elements[nth];
      if (isVisible) self.wait(self.until.elementIsVisible(element));
      return element;
    });
  }

  /**
   * Find Elements
   * @param {string} locator Element locator
   * @return {Thenable<Array<WebElement>>} A promise that will resolve to an array of WebElements.
   */
  findElements(locator) {
    this.log(`      Locating: ${locator}`);

    const byLocator = this.locateElementBy(locator);

    this.wait(this.until.elementsLocated(byLocator));

    return this.wd.findElements(byLocator);
  }

  /**
   * Get title
   * @return {Thenable<string>} A promise that will be resolved with the current page's title.
   */
  getTitle() {
    return this.wd.getTitle();
  }

  /**
   * Locate element 'By' strategies
   * @param {string} locator Element locator with: strategy=search_string
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
      if (locator.string.startsWith('.') || locator.string.startsWith('#') || locator.string.startsWith('[')) {
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
   * Log messages
   * @param {string} msg Messages to log
   */
  log(msg) {
    const defer = this.promise.defer();
    defer.fulfill(msg);
    defer.promise.then(function (message) {
      console.log(message);
    });
  }

  /**
   * Maximize the window
   * @return {Thenable<undefined>}
   */
  maximizeWindow() {
    this.log(`  [-] maximizeWindow()`);
    return this.wd.manage().window().maximize();
  }

  /**
   * Maximize the window to the screen size
   */
  maximizeToScreenSize() {
    this.log(`  [-] maximizeToScreenSize()`);

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
   * @param {string} url A fully qualified URL to open
   * @return {Thenable<undefined>}
   */
  open(url) {
    this.log(`  [-] open(${url})`);
    return this.wd.get(url);
  }

  /**
   * Terminates the browser session
   * @return {Thenable<undefined>}
   */
  quit() {
    this.log(`  [-] quit()`);
    return this.wd.quit();
  }

  /**
   * Run script
   * @param {(string|Function)} script The script to execute
   * @param {Function} fn A callback function aftrer the script is executed
   */
  runScript(script, fn) {
    this.log(`  [-] runScript()`);

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
   * @param {number} timeout Default timeout in milliseconds
   */
  setTimeout(timeout) {
    this.log(`  [-] setTimeout(${timeout})`);
    this.TIMEOUT = parseInt(timeout) || this.TIMEOUT;
  }

  /**
   * Set window's position
   * @param {number} x The desired horizontal position, relative to the left side of the screen
   * @param {number} y The desired vertical position, relative to the top of the of the screen
   * @return {Thenable<undefined>}
   */
  setWindowPosition(x, y) {
    this.log(`  [-] setWindowPosition(${x}, ${y})`);
    return this.wd.manage().window().setPosition(x, y);
  }

  /**
   * Set window's size
   * @param {number} width The desired window width
   * @param {number} height The desired window height
   * @return {Thenable<undefined>}
   */
  setWindowSize(width, height) {
    this.log(`  [-] setWindowSize(${width}, ${height})`);
    return this.wd.manage().window().setSize(width, height);
  }

  /**
   * Sleep
   * @param {number} ms The amount of time, in milliseconds, to sleep
   * @return {Thenable<undefined>}
   */
  sleep(ms) {
    ms = parseInt(ms) || 0;
    return this.wd.sleep(ms);
  }

  /**
   * Switch to the default content
   * @return {Thenable<undefined>}
   */
  switchToDefaultContent() {
    this.log(`  [-] switchToDefaultContent()`);
    return this.wd.switchTo().defaultContent();
  }

  /**
   * Switch to frame
   * @param {(number|string|WebElement)} locator The frame locator
   * @return {Thenable<undefined>}
   */
  switchToFrame(locator) {
    this.log(`  [-] switchToFrame()`);

    const element = (isNaN(locator)) ? this.findElement(locator) : locator;
    return this.wd.switchTo().frame(element);
  }

  /**
   * Switch to window
   * @param {string} nameOrHandle The name or window handle of the window to switch focus to
   * @return {Thenable<undefined>}
   */
  switchToWindow(nameOrHandle) {
    this.log(`  [-] switchToWindow(${nameOrHandle})`);
    return this.wd.switchTo().window(nameOrHandle);
  }

  /**
   * Take a screenshot
   * @param {string} filename File name (.png) of the screenshot
   */
  takeScreenshot(filename) {
    this.log(`  [-] takeScreenshot(${filename})`);

    if (!filename.endsWith('.png')) filename += '.png';

    this.sleep(500);

    this.wd.takeScreenshot().then(function (data) {
      fs.writeFile(filename, data, 'base64', function (err) {
        if(err) console.error(err);
      });
    });
  }

  /**
   * Wait
   * @param {Function} condition A function to evaluate as a condition
   * @param {number} [timeout] Wait timeout
   * @return {Thenable}
   */
  wait(condition, timeout) {
    timeout = parseInt(timeout) || this.TIMEOUT;
    return this.wd.wait(condition, timeout);
  }

  /**
   * Wait till Title contains substr
   * @param {string} substr The substring that should be present in the page title
   * @return {Thenable}
   */
  waitForTitleContains(substr) {
    this.log(`  [-] waitForTitleContains()`);
    return this.wait(this.until.titleContains(substr));
  }

  /**
   * Wait till Title is title
   * @param {string} title The expected page title
   * @return {Thenable}
   */
  waitForTitleIs(title) {
    this.log(`  [-] waitForTitleIs()`);
    return this.wait(this.until.titleIs(title));
  }

  /**
   * Wait till Title matches regex
   * @param {RegExp} regex The regular expression to test against
   * @return {Thenable}
   */
  waitForTitleMatches(regex) {
    this.log(`  [-] waitForTitleMatches()`);
    return this.wait(this.until.titleMatches(regex));
  }

  /**
   * Wait till URL contains substrUrl
   * @param {string} substrUrl The substring that should be present in the current URL
   * @return {Thenable}
   */
  waitForUrlContains(substrUrl) {
    this.log(`  [-] waitForUrlContains()`);
    return this.wait(this.until.urlContains(substrUrl));
  }

  /**
   * Wait till URL is url
   * @param {string} url The expected page url
   * @return {Thenable}
   */
  waitForUrlIs(url) {
    this.log(`  [-] waitForUrlIs()`);
    return this.wait(this.until.urlIs(url));
  }

  /**
   * Wait till URL matches regex
   * @param {RegExp} regex The regular expression to test against
   * @return {Thenable}
   */
  waitForUrlMatches(regex) {
    this.log(`  [-] waitForUrlMatches()`);
    return this.wait(this.until.urlMatches(regex));
  }

  /*--- ****************** ---*/
  /*--- WebElement Methods ---*/
  /*--- ****************** ---*/

  /**
   * Remove focus from an element
   * @param {(string|WebElement)} locator Element locator
   */
  blur(locator) {
    this.log(`  [-] blur()`);

    const element = this.findElement(locator);
    this.wd.executeScript(`
      var element = arguments[0];
      element.blur();
    `, element);
  }

  /**
   * Check all checkboxes under an element
   * @param {(string|WebElement)} locator Element locator
   */
  checkAll(locator) {
    this.log(`  [-] checkAll()`);

    const element = this.findElement(locator);

    element.findElements(this.locateElementBy('css=input[type="checkbox"]'))
    .then(function (checkboxes) {
      checkboxes.forEach(function (checkbox) {
        checkbox.isSelected().then(function (isChecked) {
          if (!isChecked) checkbox.click();
        });
      });
    });
  }

  /**
   * Clear the value of an element
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<undefined>}
   */
  clear(locator) {
    this.log(`  [-] clear()`);
    return this.findElement(locator).clear();
  }

  /**
   * Click an element
   * @param {(string|WebElement)} locator Element locator
   * @param {number} ms Sleep in milliseconds after clicking the element
   */
  click(locator, ms) {
    this.log(`  [-] click()`);

    this.findElement(locator, true).then(function (el) { el.click(); });
    this.sleep(ms);
  }

  /**
   * Click an element with an offset
   * @param {(string|WebElement)} locator Element locator
   * @param {{x: number, y: number}} [offset={x: 0, y: 0}] An offset within the element
   */
  clickAt(locator, offset = {x: 0, y: 0}) {
    this.log(`  [-] clickAt()`);

    const self = this;
    self.findElement(locator, true).then(function (element) {
      self.actions().mouseMove(element, offset).click().perform();
    });
  }

  /**
   * Double-click an element
   * @param {(string|WebElement)} locator Element locator
   * @param {number} ms Sleep in milliseconds after clicking the element
   */
  doubleClick(locator, ms) {
    this.log(`  [-] doubleClick()`);

    const element = this.findElement(locator, true);
    this.actions().mouseMove(element).doubleClick().perform();
    this.sleep(ms);
  }

  /**
   * Give focus to an element
   * @param {(string|WebElement)} locator Element locator
   */
  focus(locator) {
    this.log(`  [-] focus()`);

    const element = this.findElement(locator);
    this.wd.executeScript(`
      var element = arguments[0];
      element.focus();
    `, element);
  }

  /**
   * Get attribute value of an element
   * @param {(string|WebElement)} locator Element locator
   * @param {string} attributeName The name of the attribute to query
   * @return {Thenable<(string|null)>}
   */
  getAttribute(locator, attributeName) {
    this.log(`  [-] getAttribute()`);
    return this.findElement(locator).getAttribute(attributeName);
  }

  /**
   * Get Position and Size of an element
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<{x: number, y: number, width: number, height: number}>}
   */
  getRect(locator) {
    this.log(`  [-] getRect()`);

    const element = this.findElement(locator);

    // return new Promise(function (resolve, reject) {
    //   element.getLocation().then(function (position) {
    //     element.getSize().then(function (size) {
    //       resolve({x: position.x, y: position.y, width: size.width, height: size.height});
    //     });
    //   });
    // });

    return this.promise.consume(function* () {
      return yield element.getLocation().then(function (position) {
        return element.getSize().then(function (size) {
          return ({x: position.x, y: position.y, width: size.width, height: size.height});
        });
      });
    });
  }

  /**
   * Get Get tag name of an element
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<string>}
   */
  getTagName(locator) {
    this.log(`  [-] getTagName()`);
    return this.findElement(locator).getTagName();
  }

  /**
   * Get Get the visible innerText of an element
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<string>}
   */
  getText(locator) {
    this.log(`  [-] getText()`);
    return this.findElement(locator).getText();
  }


  // TODO: Need to think how to implement isEnabled/isDisplayed/isSelected
  /**
   * If an element is displayed
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<boolean>}
   */
  isDisplayed(locator) {
    this.log(`  [-] isDisplayed()`);
    return this.findElement(locator).isDisplayed();
  }

  // TODO: Need to think how to implement isEnabled/isDisplayed/isSelected
  /**
   * If an element is enabled
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<boolean>}
   */
  isEnabled(locator) {
    this.log(`  [-] isEnabled()`);
    return this.findElement(locator).isEnabled();
  }

  // TODO: Need to think how to implement isEnabled/isDisplayed/isSelected
  /**
   * If an element is selected
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<boolean>}
   */
  isSelected(locator) {
    this.log(`  [-] isSelected()`);
    return this.findElement(locator).isSelected();
  }

  /**
   * Move to an element by offset
   * @param {(string|WebElement)} locator Element locator
   * @param {{x: number, y: number}} [offset={x: 0, y: 0}] An offset within the element.
   * @return {Thenable}
   */
  mouseMove(locator, offset = {x: 0, y: 0}) {
    this.log(`  [-] mouseMove()`);
    return this.actions().mouseMove(this.findElement(locator, true), offset).perform();
  }

  /**
   * Scroll an element into view
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<(T|null)>}
   */
  scrollIntoView(locator) {
    this.log(`  [-] scrollIntoView()`);
    return this.wd.executeScript(`arguments[0].scrollIntoView(true);`, this.findElement(locator));
  }

  /**
   * Select an option in a drop-down menu
   * @param {(string|WebElement)} select_locator SELECT element locator
   * @param {string} option_locator OPTION element locator
   * @return {Thenable<undefined>}
   */
  select(select_locator, option_locator) {
    this.log(`  [-] select()`);

    const select = this.findElement(select_locator, true);

    return select.findElement(this.locateElementBy(option_locator)).then(function (option) {
      return option.click();
    });
  }

  /**
   * Send keys to an element
   * @param {(string|WebElement)} locator Element locator
   * @param {string} keys Keys to send
   * @return {Thenable<undefined>}
   */
  sendKeys(locator, keys) {
    this.log(`  [-] sendKeys()`);
    return this.findElement(locator).sendKeys(keys);
  }

  /**
   * Set attribute value for an element
   * @param {(string|WebElement)} select_locator SELECT element locator
   * @param {string} attribute attribute name
   * @param {string} value attribute value
   */
  setAttribute(locator, attribute, value) {
    this.log(`  [-] setAttribute()`);

    const element = this.findElement(locator);

    this.wd.executeScript(`
      var element = arguments[0];
      var attribute = arguments[1];
      var value = arguments[2];

      element.setAttribute(attribute, value);
    `, element, attribute, value);
  }

  /**
   * Submit the form containing the element
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable<undefined>}
   */
  submit(locator) {
    this.log(`  [-] submit()`);
    return this.findElement(locator).submit();
  }

  /**
   * Uncheck all checkboxes under an element
   * @param {(string|WebElement)} locator Element locator
   */
  unCheckAll(locator) {
    this.log(`  [-] unCheckAll()`);

    const element = this.findElement(locator);

    element.findElements(this.locateElementBy('css=input[type="checkbox"]'))
    .then(function (checkboxes) {
      checkboxes.forEach(function (checkbox) {
        checkbox.isSelected().then(function (isChecked) {
          if (isChecked) checkbox.click();
        });
      });
    });
  }

  /**
   * Wait till an alert is presented
   * @return {Thenable<Alert>}
   */
  waitForAlertIsPresent() {
    this.log(`  [-] waitForAlertIsPresent()`);
    return this.wait(this.until.alertIsPresent());
  }

  /**
   * Wait till an element is disabled
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForDisabled(locator) {
    this.log(`  [-] waitForDisabled()`);
    return this.wait(this.until.elementIsDisabled(this.findElement(locator)));
  }

  /**
   * Wait till an element is enabled
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForEnabled(locator) {
    this.log(`  [-] waitForEnabled()`);
    return this.wait(this.until.elementIsEnabled(this.findElement(locator)));
  }

  /**
   * Wait till an element is not presented
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForNotPresent(locator) {
    this.log(`  [-] waitForNotPresent()`);
    return this.wait(this.until.stalenessOf(this.findElement(locator)));
  }

  /**
   * Wait till an element is not selected
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForNotSelected(locator) {
    this.log(`  [-] waitForNotSelected()`);
    return this.wait(this.until.elementIsNotSelected(this.findElement(locator)));
  }

  /**
   * Wait till an element is not visible
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForNotVisible(locator) {
    this.log(`  [-] waitForNotVisible()`);
    return this.wait(this.until.elementIsNotVisible(this.findElement(locator)));
  }

  /**
   * Wait till an element is present
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForPresent(locator) {
    this.log(`  [-] waitForPresent()`);
    return this.wait(this.until.elementsLocated(this.locateElementBy(locator)));
  }

  /**
   * Wait till an element is selected
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForSelected(locator) {
    this.log(`  [-] waitForSelected()`);
    return this.wait(this.until.elementIsSelected(this.findElement(locator)));
  }

  /**
   * Wait till switching to a frame
   * @param {(number|string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForSwitchToFrame(locator) {
    this.log(`  [-] waitForSwitchToFrame()`);
    const frame = (isNaN(locator)) ? this.findElement(locator) : locator;
    return this.wait(this.until.ableToSwitchToFrame(frame));
  }

  /**
   * Wait till an element's text contains substring
   * @param {(string|WebElement)} locator Element locator
   * @param {string} substr The substring to search for
   * @return {Thenable}
   */
  waitForTextContains(locator, substr) {
    this.log(`  [-] waitForTextContains()`);
    return this.wait(this.until.elementTextContains(this.findElement(locator), substr));
  }

  /**
   * Wait till an element's innerText is text
   * @param {(string|WebElement)} locator Element locator
   * @param {string} text The expected text
   * @return {Thenable}
   */
  waitForTextIs(locator, text) {
    this.log(`  [-] waitForTextIs()`);
    return this.wait(this.until.elementTextIs(this.findElement(locator), text));
  }

  /**
   * Wait till an element's innerText matches regex
   * @param {(string|WebElement)} locator Element locator
   * @param {RegExp} regex The regular expression to test against
   * @return {Thenable}
   */
  waitForTextMatches(locator, regex) {
    this.log(`  [-] waitForTextMatches()`);
    return this.wait(this.until.elementTextMatches(this.findElement(locator), regex));
  }

  /**
   * Wait till an element is visible
   * @param {(string|WebElement)} locator Element locator
   * @return {Thenable}
   */
  waitForVisible(locator) {
    this.log(`  [-] waitForVisible()`);
    return this.wait(this.until.elementIsVisible(this.findElement(locator)));
  }

  /*--- ************** ---*/
  /*--- Custom Methods ---*/
  /*--- ************** ---*/

  /**
   * Clear all elements created by EasyDriver
   * @return {Thenable<(T|null)>}
   */
  clearAllDrawings() {
    this.log(`  [-] clearAllDrawings()`);

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
   * Create directories
   * @param {string} dirtree Directories to create
   */
  createDirectories(dirtree) {
    this.log(`  [-] createDirectories(${dirtree})`);

    if (! fs.existsSync(dirtree)){ fs.mkdirsSync(dirtree); }
  }

  /**
   * Draw an arrow between 2 element
   * @param {(string|WebElement)} from_locator Element locator
   * @param {(string|WebElement)} to_locator Element locator
   * @return {WebElementPromise}
   */
  drawArrow(from_locator, to_locator) {
    this.log(`  [-] drawArrow()`);

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
   * @param {(string|WebElement)} locator Element locator
   * @param {{attribute: string, offsetX: number, offsetY: number, fromLastPos: boolean, drawSymbol: boolean}}
            [settings={attribute: 'title', offsetX: 5, offsetY: 15, fromLastPos: false, drawSymbol: false}]
            attribute: draw flyover on element's attribute,
            offsetX: offset X from the element,
            offsetY: offset Y from the element,
            fromLastPos: draw from last Flyover position,
            drawSymbol: draw symbol on the flyover.
   * @return {WebElementPromise}
   */
  drawFlyover(locator, settings = {attribute: 'title', offsetX: 5, offsetY: 15, fromLastPos: false, drawSymbol: false}) {
    this.log(`  [-] drawFlyover()`);

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
   * @param {(string|WebElement)} locator Element locator
   * @param {{top: number, left: number, bottom: number, right: number}} [padding={top: 0, left: 0, bottom: 0, right: 0}]
            Remark padding
   * @return {WebElementPromise}
   */
  drawRedMark(locator, padding = {top: 0, left: 0, bottom: 0, right: 0}) {
    this.log(`  [-] drawRedMark()`);

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
   * Draw drop-down menu for SELECT element
   * @param {(string|WebElement)} locator Element locator
   * @param {{x: number, y: number}} [offset={x: 5, y: 15}] Tooltip offset from the element
   * @return {WebElementPromise}
   */
  drawSelect(locator, offset = {x: 0, y: 0}) {
    this.log(`  [-] drawSelect()`);

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

  /**
   * Take a screenshot on an element
   * @param {(string|WebElement)} locator Element locator
   * @param {string} filename File name (.png) of the screenshot
   * @param {{x: number, y: number}} [offset={x: 0, y: 0}] An offset from an element
   *
   * References for detecting Retina: http://stackoverflow.com/questions/19689715
   */
  takeElementShot(locator, filename, offset = {x: 0, y: 0}) {
    this.log(`  [-] takeElementShot()`);

    const self = this;
    const element = self.findElement(locator);

    if (!filename.endsWith('.png')) filename += '.png';

    self.wd.takeScreenshot().then(function (screenData) {
      self.wd.executeScript(`
        var element = arguments[0];
        var screenData = arguments[1];
        var offsetX = arguments[2];
        var offsetY = arguments[3];

        function isRetinaDisplay() {
          if (window.matchMedia) {
            var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            return (mq && mq.matches || (window.devicePixelRatio > 1));
          }
        }

        var ratio = (isRetinaDisplay()) ? 2 : 1;

        var rect = element.getBoundingClientRect();

        var image = new Image();
        image.src = 'data:image/png;base64,' + screenData;

        var canvas = document.createElement('canvas');
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(
          image,
          (rect.left + offsetX) * ratio,
          (rect.top + offsetY) * ratio,
          rect.width * ratio,
          rect.height * ratio,
          0,
          0,
          rect.width * ratio,
          rect.height * ratio
        )

        return canvas.toDataURL();
      `, element, screenData, offset.x, offset.y)
      .then(function (elementData) {
        const base64Data = elementData.replace(/^data:image\/png;base64,/, "");
        fs.writeFile(filename, base64Data, 'base64', function (err) {
          if(err) console.error(err);
        });
      });
    });
  }

  /**
   * Take a screenshot on a scroll element
   * @param {(string|WebElement)} locator Element locator
   * @param {string} filename File name (.png) of the screenshot
   * @param {{x: number, y: number}} [offset={x: 0, y: 0}] An offset from an element
   */
  takeScrollShot(locator, filename, offset={x: 0, y: 0}) {
    this.log(`  [-] takeScrollShot()`);

    const self = this;
    const element = self.findElement(locator);

    self.wd.executeScript(`
      var element = arguments[0];

      while ((element.scrollHeight <= element.offsetHeight ) || (parseInt(element.scrollWidth) >= 99000)) {
        element = element.parentElement;
      }

      window.easydriverScrollElement = element;

      var old_maxWidth = element.style.maxWidth;
      element.style.maxWidth = 'none';
      var old_maxHeight = element.style.maxHeight;
      element.style.maxHeight = 'none';

      var old_width = element.clientWidth;
      element.style.width = element.scrollWidth + "px";
      var old_height = element.clientHeight;
      element.style.height = element.scrollHeight + "px";

      return {mW: old_maxWidth, mH: old_maxHeight, w: old_width, h: old_height};
    `, element).then(function (scrollData) {
      self.takeElementShot(element, filename, offset);

      self.wd.executeScript(`
        var scrollData = arguments[0];

        window.easydriverScrollElement.style.maxWidth = scrollData.mW;
      	window.easydriverScrollElement.style.maxHeight = scrollData.mH;

      	window.easydriverScrollElement.style.height = scrollData.h + "px";
      	window.easydriverScrollElement.style.width = scrollData.w + "px";
      `, scrollData);
    });
  }

  /*--- *************************** ---*/
  /*--- Not-yet-implemented Methods ---*/
  /*--- *************************** ---*/

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
}

module.exports = EasyDriver;
