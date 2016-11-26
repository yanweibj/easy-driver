const EasyDriver = require('./easy-driver');
const test = require('selenium-webdriver/testing');

test.describe('EasyDriver Test Suite', function() {
  let easyd;

  test.before(function() {
    easyd = new EasyDriver('en');
  });

  test.after(function() {
     easyd.quit();
   });

  test.it('Test Case: takeElementShot()', function(done) {
    easyd.open('https://www.google.com');
    easyd.sendKeys('name=q', 'webdriver' + easyd.Key.ENTER);
    easyd.waitForVisible('id=rso');
    easyd.scrollIntoView('(//*[@class="_Gs"])[2]');
    easyd.takeElementShot('id=foot', 'test02.png');
    done();
  });

  test.it('Test Case: checkAll() and unCheckAll()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/8w0zyuyu/show/');
    easyd.switchToFrame('//iframe');
    easyd.checkAll('//form');
    easyd.sleep(3000);
    easyd.unCheckAll('//form');
    done();
  });

  test.it('Test Case: takeScrollShot()', function(done) {
    easyd.open('https://jsfiddle.net/aaronchen/x86j7qo2/show/');
    easyd.switchToFrame('//iframe');
    easyd.takeScrollShot('id=c1', 'test02_s1.png');
    easyd.takeScrollShot('id=c2', 'test02_s2.png');
    easyd.takeScrollShot('id=c3', 'test02_s3.png');
    easyd.takeScrollShot('id=c4', 'test02_s4.png');
    done();
  });

});
