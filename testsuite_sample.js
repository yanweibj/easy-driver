const EasyDriver = require('./easy-driver');
const EasySuite = require('./easy-suite');

const locale = process.env.EASYD_LOCALE || 'en';
const easyd = new EasyDriver({locale: locale});
const suite = new EasySuite('EasyDriver Test Suite');
easyd.VERBOSE = false;

suite.before(function() {
  easyd.log("Run Environment Setup Here");
});

suite.after(function() {
  easyd.log("Run Environment Cleanup Here");
  easyd.quit();
});

suite.testcase("010.010.010", function() {
  easyd.open('https://www.google.com');
  easyd.sleep(2000);
});

suite.testcase("010.010.020", function() {
  easyd.blank();
  easyd.open('https://www.mobile01.com');
  easyd.sleep(2000);
});

suite.testcase("010.020.010", function() {
  easyd.blank();
  easyd.open('https://www.nytimes.com');
  easyd.sleep(2000);
});

// Only run certain test cases
// suite.only(['010.010.010', "010.020.010"]);

suite.run();
