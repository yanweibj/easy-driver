const EasyDriver = require('./easy-driver');
const lang = 'en';
let tcNum = 220;

const easyd = new EasyDriver(lang);

// Create a lang directory to hold all screenshots
easyd.createDirectories(lang);
// Open "Process Center"
easyd.open('https://lsc556.tw.ibm.com:9443/ProcessCenter/login.jsp');
// Maximize the window to the screen
easyd.maximizeToScreenSize();
// Login
easyd.sendKeys('name=j_username', 'admin');
easyd.sendKeys('name=j_password', 'admin' + easyd.Key.ENTER);
// Close Pop-up dialog
easyd.click('.closeButton');
// Click on "Preferences"
easyd.click('(//div[@class="logout"])[2]');
// Select language: lang
easyd.select('//table//select[not(@style)]', `css=[value="${lang.replace('-','_')}" i]`);
// Save language pref only when changed
easyd.findElement('.savePrefsButton').then(function (saveButton) {
  saveButton.isEnabled().then(function (isEnabled) {
    if (isEnabled) saveButton.click(); // Save
    else easyd.click('.closeButton'); // Or, close Preferences
  });
});
// Click on the first ProcApp
easyd.click('(//span[@class="openInDesignerActionIcon actIcon"])[1]');
// Click on "Services" and select "Service Flow01"
easyd.click('id=dijit__TreeNode_5');
easyd.click('//*[text()="Service Flow01"]');
// Wait for the diagram to load
easyd.waitForVisible('//div[@dojoattachpoint="canvasNode"]');
easyd.sleep(2000);
// Click on "Content Integration" when enabled
easyd.findElements('css=g+image+rect')
.then(function (elements) { // Find all tasks
  const element = elements[2]; // Content Integration is the 3rd task
  easyd.waitForEnabled(element);
  easyd.clickAt(element);
});
// Wait for the "Properties" panel to load
easyd.waitForVisible('//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"]');
// Expand the "Properties" panal
easyd.click('.bpmClickyThumbUp');
// Click on "Implmentation" (2ndd element in the tabs)
easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[2]');
// Get all options of "Operation Name"
easyd.findElements('css=select[data-test-attr="service-flow-impl-operation"] > option')
.then(function (options) {
  options.shift();  // remove the 1st opiton "None"
  // Loop through the rest of options
  options.forEach(function (option) {
    option.click();

    // Click on "Data Mapping" (3rd element in the tabs)
    easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[3]');

    // Wait till all inuput fields are present
    easyd.wait(easyd.until.elementsLocated(easyd.locateElementBy('.textviewContent')));
    // Find all links
    easyd.findElements('.TabbedPropertiesPane .dijitTabPaneWrapper .dijitVisible .imageHyperLinkText')
    .then(function (links) {
      // Create tooltips for the links
      links.forEach(function (link, index) {
        if (index === 0) {
          easyd.createToolTip(link, {x: -250, y: 175}, false);
        } else {
          easyd.createToolTip(link, {x: 0, y: 0}, true);
        }
      });
    });

    // Sleep 0.5s to make sure all tooltips are drawn
    easyd.sleep(500);

    // Take a screenshot
    easyd.takeScreenshot(`${lang}/22.200.${tcNum}`);
    tcNum++;

    // Clear EasyDriver elements
    easyd.clearEasyDriverElements();

    // Got back to "Implmentation"
    easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[2]');
  });
});
