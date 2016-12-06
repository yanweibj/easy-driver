/*--- ********************* ---*/
/*--- EasyDriver Test Suite ---*/
/*--- ********************* ---*/

// Test Cases to test EasyDriver methods.

const EasyDriver = require('../easy-driver');
const test = require('selenium-webdriver/testing');
const assert = require('selenium-webdriver/testing/assert');

test.describe('=== EasyDriver Test Suite ===', function() {
  let easyd;
  const imgDir = 'test_img';

  // this.timeout(60000);

  test.before(function() {
    easyd = new EasyDriver('en');
    easyd.createDirectories(imgDir);
  });

  test.after(function() {
    easyd.quit();
  });

  test.it('Test Case: implicit-wait on click()', function(done) {
    easyd.open('https://jsfiddle.net/9snhn98w/show/');
    easyd.switchToFrame(0);
    easyd.click('id=p1');
    easyd.click('id=p2');
    easyd.click('id=p3');
    easyd.getText('id=desc').then(function (text) {
      assert(text).equalTo('Hahahaha');
    });
    done();
  });

  test.it('Test Case: getRect()', function(done) {
    easyd.getRect('id=p3').then(function (rect) {
      console.log(rect);
      assert(rect.width).greaterThan(20);
    });
    done();
  });

  test.it('Test Case: drawFlyover()', function(done) {
    easyd.setAttribute('id=p3', 'title', "fake flyover here");
    easyd.drawFlyover('id=p3');
    easyd.takeScreenshot(`${imgDir}/drawFlyover.png`);
    easyd.clearAllDrawings();
    done();
  });

  test.it('Test Case: drawArrow()', function(done) {
    easyd.drawArrow('id=p1', 'id=desc');
    easyd.focus('id=p1');
    easyd.takeScreenshot(`${imgDir}/drawArrow.png`);
    done();
  });

  test.it('Test Case: takeElementShot()', function(done) {
    easyd.open('https://www.google.com');
    easyd.sendKeys('name=q', 'webdriver' + easyd.Key.ENTER);
    easyd.waitForVisible('id=rso');
    easyd.scrollIntoView('(//*[@class="_Gs"])[2]');
    easyd.takeElementShot('id=foot', `${imgDir}/takeElementShot_1.png`);
    done();
  });

  test.it('Test Case: takeElementShot() & Implicit Wait', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/w06ehb9v/show/');
    easyd.getRect('//iframe').then(function (rect) {
      easyd.switchToFrame(0);
      easyd.takeElementShot('id=p1', `${imgDir}/takeElementShot_2.png`, {x: rect.x, y: rect.y});
    });
    done();
  });

  test.it('Test Case: checkAll() and unCheckAll()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/8w0zyuyu/show/');
    easyd.switchToFrame('//iframe');
    easyd.checkAll('//form');
    easyd.isSelected('[value="Bus"]').then(function (isSelected) {
      assert(isSelected).isTrue();
    });
    easyd.unCheckAll('//form');
    easyd.isSelected('[value="Train"]').then(function (isSelected) {
      assert(isSelected).isFalse();
    });
    done();
  });

  test.it('Test Case: waitForAlertIsPresent()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/8mgdc90t/show/');
    easyd.switchToFrame('//iframe');
    easyd.click('#bAlert');
    easyd.waitForAlertIsPresent().then(function (alert) {
      alert.getText().then(function (text) {
        assert(text).equalTo('I am an alert box!');
      });
      alert.accept();
    });
    done();
  });

  test.it('Test Case: drawSelect()', function(done) {
    easyd.drawSelect('#dropdown');
    easyd.drawRedMark('[id*="easydriver_"]');
    easyd.takeScreenshot(`${imgDir}/drawSelect.png`);
    done();
  });

  test.it('Test Case: takeScrollShot()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/x86j7qo2/show/');
    easyd.getRect('//iframe').then(function (rect) {
      easyd.switchToFrame(0);
      easyd.takeScrollShot('id=c1', `${imgDir}/takeScrollShot_1.png`, {x: rect.x, y: rect.y});
      easyd.takeScrollShot('id=c2', `${imgDir}/takeScrollShot_2.png`, {x: rect.x, y: rect.y});
      // Need to find a solution for this scroll element
      easyd.takeScrollShot('id=c3', `${imgDir}/takeScrollShot_3.png`, {x: rect.x, y: rect.y});
      easyd.takeScrollShot('id=c4', `${imgDir}/takeScrollShot_4.png`, {x: rect.x, y: rect.y});
    });
    done();
  });

});
