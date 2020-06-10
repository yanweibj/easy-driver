const EasyDriver = require("./easy-driver");

const lang = "zh-cn";

// New with locale: lang
const easyd = new EasyDriver({ locale: lang, browser: "chrome" });
// Create directory: lang
easyd.createDirectories(lang);
// Open bluepage
easyd.open("https://w3.ibm.com/bluepages/");
// Maximize the window
easyd.maximizeWindow();
// Search 'webdriver'
easyd.sendKeys("name=search-input", "Wei Yan" + easyd.Key.ENTER);
// Wait till search results are done
easyd.waitForVisible("xpath=/html/body/div[5]/div[2]/div[3]/ul/li[5]/div[1]/div/div[1]");
// Red-mark 'Yan Wei'
easyd.drawRedMark('(//*[@id="searchCards"]/li[5]/div[1]/div/div[1])');
// Scroll to 'Wei Yan' at the bottom of the page
easyd.scrollIntoView('//*[@id="searchCards"]/li[1]/div[1]/div/a');
// Capture the page
easyd.takeScreenshot(`${lang}/01.010.010`);
// Print Title
easyd.getTitle(function(title) {
  console.log("Title: " + title);
});
// Clear redmark
easyd.clearAllDrawings();
// Sleep 6 seconds
easyd.sleep(6000);
// Quit
easyd.quit();
