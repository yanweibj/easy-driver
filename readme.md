# Installation

## Install Homebrew

> (For Windows) Please skip this.

> (For Mac) Please make sure you have **Xcode Command Line Tools** installed first by running `xcode-select -p` in Terminal.

(For Mac) In Terminal, run:

```shell
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

## Install Node.js

> (For Windows) Please download [Nodes.js](https://nodejs.org/en/download/) and install.

(For Mac) In Terminal, run:

```shell
brew update
brew install node
```

## Get EasyDriver

##### Method 1: Use Git
> (For Windows) Please first download [Git for Windows](https://git-scm.com/download/win) and install.

In Terminal, run:

```shell
cd /path/to/all_projects_root

git clone https://github.ibm.com/aaronhc/easy-driver

cd easy-driver

npm install
```

##### Methodd 2: Use easy-driver-master.zip

1. Download [easy-driver-master.zip](https://github.ibm.com/aaronhc/easy-driver/archive/master.zip).
2. Unzip **easy-driver-master.zip** to a directory of your choice.
3. In Terminal, change the current directory (`cd`) to the unzipped directory, and run `npm install`.


## Run Sample Test Cases

In Terminal: Go to your **EasyDriver** directory, and run:

```shell
node testcase_sample
```

Or, you can create your own test case (mytest01.js), and run it like: `node mytest01`

## Update EasyDriver

##### Method 1: Use Git
In Terminal, run:

```shell
git pull
npm install
```

##### Methodd 2: Use easy-driver-master.zip
1. Download the latest [easy-driver-master.zip](https://github.ibm.com/aaronhc/easy-driver/archive/master.zip).
2. Unzip **easy-driver-master.zip** to a directory of your choice.
3. In Terminal, change the current directory (`cd`) to the unzipped directory, and run `npm install`.

# Usage

## Instance Methods

```javascript
const EasyDriver = require('./easy-driver');
const easyd = new EasyDriver('zh-tw');
```

\*\* **loc_or_web**: Parameter can be either ***locater*** or ***WebElement***.

##### easyd (WebDriver methods)
* `easyd.actions() -> ActionSequence` => See **Class ActionSequence**
* `easyd.back()`
* `easyd.close()`
* `easyd.deleteAllCookies()`
* `easyd.findElement(locator, isVisible = false) -> WebElementPromise`
* `easyd.findElements(locator) -> Thenable<Array<WebElement>>`
* `easyd.forward()`
* `easyd.getTitle() -> Thenable<string>`
* `easyd.Key`  => See **Enumeration Key**
* `easyd.locateElementBy(locator) -> By`
* `easyd.log(msg)`
* `easyd.maximizeWindow()`
* `easyd.maximizeToScreenSize()`
* `easyd.open(url)`
* `easyd.pageLoadTimeout(ms)`
* `easyd.quit()`
* `easyd.refresh()`
* `easyd.runScript(script, callback) -> callback(retval)`
* `easyd.setTimeout(timeout)`
* `easyd.setWindowPosition(x, y)`
* `easyd.setWindowSize(width, height)`
* `easyd.sleep(ms)`
* `easyd.switchToDefaultContent()`
* `easyd.switchToFrame(number_or_loc_or_web)`
* `easyd.switchToWindow(nameOrHandle)`
* `easyd.takeScreenshot(png_filename)`
* `easyd.until` => See **until Conditions**
* `easyd.wait(fn, timeout)`
* `easyd.waitForAlertIsPresent() -> Thenable<Alert>`
* `easyd.waitForTitleContains(substr)`
* `easyd.waitForTitleIs(title)`
* `easyd.waitForTitleMatches(regex)`
* `easyd.waitForUrlContains(substrUrl)`
* `easyd.waitForUrlIs(url)`
* `easyd.waitForUrlMatches(regex)`
* `easyd.zoom(percent)`

##### easyd (WebElement methods)
* `easyd.blur(loc_or_web)`
* `easyd.checkAll(loc_or_web)`
* `easyd.clear(loc_or_web)`
* `easyd.click(loc_or_web)`
* `easyd.clickAt(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.doubleClick(loc_or_web)`
* `easyd.dragAndDrop(from_loc_or_web, to_loc_or_web_or_position)`
* `easyd.focus(loc_or_web)`
* `easyd.getAttribute(loc_or_web, attributeName) -> Thenable<(string|null)>`
* `easyd.getRect(loc_or_web) -> Thenable<{x: number, y: number, height: number, width: number}>`
* `easyd.getTagName(loc_or_web) -> Thenable<string>`
* `easyd.getText(loc_or_web) -> Thenable<string>`
* `easyd.isDisplayed(loc_or_web) -> Thenable<boolean>`
* `easyd.isEnabled(loc_or_web) -> Thenable<boolean>`
* `easyd.isSelected(loc_or_web) -> Thenable<boolean>`
* `easyd.mouseMove(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.rightClick(loc_or_web)`
* `easyd.rightClickAt(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.scrollIntoView(loc_or_web)`
* `easyd.select(select_loc_or_web, option_locator)`
* `easyd.sendKeys(loc_or_web, ...keys)`
* `easyd.setAttribute(loc_or_web, attribute, value)`
* `easyd.submit(loc_or_web)`
* `easyd.unCheckAll(loc_or_web)`
* `easyd.waitForDisabled(loc_or_web)`
* `easyd.waitForEnabled(loc_or_web)`
* `easyd.waitForNotPresent(loc_or_web)`
* `easyd.waitForNotSelected(loc_or_web)`
* `easyd.waitForNotVisible(loc_or_web)`
* `easyd.waitForPresent(locator)`
* `easyd.waitForSelected(loc_or_web)`
* `easyd.waitForSwitchToFrame(number_or_loc_or_web)`
* `easyd.waitForTextContains(loc_or_web, substr)`
* `easyd.waitForTextIs(loc_or_web, text)`
* `easyd.waitForTextMatches(loc_or_web, regex)`
* `easyd.waitForVisible(loc_or_web)`

##### easyd (Custom methods)
* `easyd.clearAllDrawings()`
* `easyd.createDirectories(dirtree)`
* `easyd.drawArrow(from_loc_or_web, to_loc_or_web)`
* `easyd.drawFlyover(loc_or_web, settings = {attribute: 'title', offsetX: 5, offsetY: 15, fromLastPos: false, drawSymbol: false})`
* `easyd.drawRedMark(loc_or_web, padding = {top: 0, left: 0, bottom: 0, right: 0})`
* `easyd.drawSelect(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.takeElementShot(loc_or_web, png_filename, offset = {x: 0, y: 0})`
* `easyd.takeScrollShot(loc_or_web, png_filename, offset = {x: 0, y: 0})`


## Supported ***locator*** Formats

> ***Format: 'type=type_syntax'***

* `css=.btn`
* `class=btn-primary`
* `id=frame1`
* `name=j_username`
* `xpath=//span/a`


> If ***type*** (css, class, id, name, xpath) is not specified, locator starting with `//` or `(` will be parsed as **xpath**, while `.`, `[` and `#` are treated as **css**.

> **css** pseudo selector support => `:eq()`

## Enumeration Key

`easyd.Key`

> All supported keys: [here](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Key.html)

## ***until*** Conditions

Almost all ***until*** conditions are integrated in `easyd.waitFor`.  However, if you want to use ***until*** conditions on your own, you can use:

`easyd.until`

> All Supported Conditions: [until](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/until.html)

## Class **ActionSequence**

`easyd.actions()`

```javascript
easyd.findElements('css=[id*="item"]').then(function (elements) {
  easyd.actions()
       .keyDown(easyd.Key.SHIFT)
       .click(elements[0])
       .click(elements[2])
       .keyUp(easyd.Key.SHIFT)
       .perform();
});
```

> All Actions: [Class ActionSequence](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ActionSequence.html)

## WebDriver Instance

`easyd.wd`

> [Class WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html)

## WebElement

> [Class WebElement](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html)

## selenium-webdriver

> [Documentation](https://seleniumhq.github.io/selenium/docs/api/javascript/index.html)

## Limitation

Chrome can only take screenshot of viewport.  It is currently not possible to take a full-page screenshot.
