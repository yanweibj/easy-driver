/*--- ********************* ---*/
/*--- EasyDriver Test Suite ---*/
/*--- ********************* ---*/

// Test Cases to test EasyDriver methods.

const EasyDriver = require('../easy-driver');
const test = require('selenium-webdriver/testing');

test.describe('EasyDriver Test Suite', function() {
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

  test.it('Test Case: click(), getRect(), setAttribute(), drawFlyover(), drawArrow()', function(done) {
    easyd.open('https://jsfiddle.net/9snhn98w/show/');
    easyd.switchToFrame('//iframe');
    easyd.click('id=p1');
    easyd.click('id=p2');
    easyd.click('id=p3');
    easyd.getRect('id=p3').then(function (rect) {
     console.log(rect);
    });
    easyd.setAttribute('id=p3', 'title', "ccccc");
    easyd.drawFlyover('id=p3');
    easyd.drawArrow('id=p1', 'id=desc');
    easyd.focus('id=p1');
    easyd.sleep(2000);
    done();
  });

  test.it('Test Case: takeElementShot()', function(done) {
    easyd.open('https://www.google.com');
    easyd.sendKeys('name=q', 'webdriver' + easyd.Key.ENTER);
    easyd.waitForVisible('id=rso');
    easyd.scrollIntoView('(//*[@class="_Gs"])[2]');
    easyd.takeElementShot('id=foot', `${imgDir}/test_1_1.png`);
    easyd.sleep(2000);
    done();
  });

  test.it('Test Case: checkAll() and unCheckAll()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/8w0zyuyu/show/');
    easyd.switchToFrame('//iframe');
    easyd.checkAll('//form');
    easyd.sleep(2000);
    easyd.unCheckAll('//form');
    easyd.sleep(2000);
    done();
  });

  test.it('Test Case: takeScrollShot()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/x86j7qo2/show/');
    easyd.switchToFrame('//iframe');
    easyd.takeScrollShot('id=c1', `${imgDir}/test_2_1.png`);
    easyd.takeScrollShot('id=c2', `${imgDir}/test_2_2.png`);
    easyd.takeScrollShot('id=c3', `${imgDir}/test_2_3.png`);
    easyd.takeScrollShot('id=c4', `${imgDir}/test_2_4.png`);
    easyd.sleep(2000);
    done();
  });

});
