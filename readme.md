# Installation (Mac)

## Install Homebrew

> (For Windows) Please skip this step.

> (For Mac) Please make sure you have **Xcode Command Line Tools** installed by running `xcode-select -p` in Terminal.

In Terminal, run:

```shell
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

## Install Node.js

> (For Windows) Please download  [Nodes.js](https://nodejs.org/en/download/) and install.

In Terminal, run:

```shell
brew update
brew install node6-lts
```

## Clone EasyDriver repository

> (For Windows) Please download [Git for Windows](https://git-scm.com/download/win) and install.

In Terminal, run:

```shell
cd /path/to/all_projects_root

git clone https://github.ibm.com/aaronhc/easy-driver

cd easy-driver

npm install
```

## Run Sample Test Cases

In Terminal: run:

```shell
node sample
node testcase_bpm_01
```

Or, you can create your own test case (mytest01.js), and run it like:

`node mytest01`

## Update EasyDriver

In Terminal, run:

```shell
git pull
npm install
```

# Usage

## Available Functions

```javascript
const EasyDriver = require('./easy-driver');
const easyd = new EasyDriver('zh-tw');
```

\*\* **loc_or_web**: Parameter can be either ***locater*** or ***WebElement***.

##### easyd (WebDriver functions)
* `easyd.actions() -> ActionSequence` (See **Class ActionSequence**)
* `easyd.close()`
* `easyd.findElement(locator, isDisplayed = false) -> WebElementPromise`
* `easyd.findElements(locator) -> Thenable<Array<WebElement>>`
* `easyd.getTitle() -> Thenable<string>`
* `easyd.Key`  (See **Enumeration Key**)
* `easyd.maximizeWindow()`
* `easyd.maximizeToScreenSize()`
* `easyd.open(url)`
* `easyd.quit()`
* `easyd.runScript(script, callback) -> callback(retval)`
* `easyd.setTimeout(timeout)`
* `easyd.sleep(ms)`
* `easyd.switchToFrame(loc_or_web)`
* `easyd.switchToWindow(nameOrHandle)`
* `easyd.takeScreenshot(png_filename)`
* `easyd.until` (See **until Conditions**)
* `easyd.wait(fn, timeout)`

##### easyd (WebElement functions)
* `easyd.clear(loc_or_web)`
* `easyd.click(loc_or_web, ms)`
* `easyd.clickAt(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.getAttribute(loc_or_web, attributeName) -> Thenable<(string|null)>`
* `easyd.getRect(loc_or_web) -> Thenable<{x: number, y: number, height: number, width: number}>`
* `easyd.getTagName(loc_or_web) -> Thenable<string>`
* `easyd.getText(loc_or_web) -> Thenable<string>`
* `easyd.isDisplayed(loc_or_web) -> Thenable<boolean>`
* `easyd.isEnabled(loc_or_web) -> Thenable<boolean>`
* `easyd.isSelected(loc_or_web) -> Thenable<boolean>`
* `easyd.mouseMove(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.scrollIntoView(loc_or_web)`
* `easyd.select(select_loc_or_web, option_locator)`
* `easyd.sendKeys(loc_or_web, keys)`
* `easyd.waitForDisabled(loc_or_web)`
* `easyd.waitForEnabled(loc_or_web)`
* `easyd.waitForNotPresent(loc_or_web)`
* `easyd.waitForNotSelected(loc_or_web)`
* `easyd.waitForNotVisible(loc_or_web)`
* `easyd.waitForPresent(locator)`
* `easyd.waitForSelected(loc_or_web)`
* `easyd.waitForTextContains(loc_or_web, substr)`
* `easyd.waitForTextIs(loc_or_web, text)`
* `easyd.waitForVisible(loc_or_web)`

##### easyd (Custom functions)
* `easyd.createDirectories(dirtree)`
* `easyd.clearEasyDriverElements()`
* `easyd.drawSelect(loc_or_web, offset = {x: 0, y: 0})`
* `easyd.drawToolTip(loc_or_web, offset = {x: 5, y: 15}, fromLastPos = false)`
* `easyd.redMark(loc_or_web, padding = {top: 0, left: 0, bottom: 0, right: 0})`


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

`easyd.until`

> Supported Conditions: [until](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/until.html)

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
