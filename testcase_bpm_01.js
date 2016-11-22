const EasyDriver = require('./easy-driver');
const languages = ['en', 'zh-tw'];

languages.forEach(function (lang) {
  // New a driver with locale: lang
  const easyd = new EasyDriver(lang);

  // Screenshot directory
  const screenDir = `screens/${lang}`;

  // Process App used
  const procApp = 'TVTAPP01';

  // Create a lang directory to hold all screenshots
  easyd.createDirectories(screenDir);
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
  // Click on Process App: procApp
  easyd.click(`//span[text()="${procApp}"]/../../../../../../..//span[@class="openInDesignerActionIcon actIcon"]`);
  // Click on "Services" and select "Service Flow01"
  easyd.click('id=dijit__TreeNode_5');
  easyd.click('//*[text()="Service Flow01"]');
  // Wait for the diagram to load
  easyd.waitForVisible('//div[@dojoattachpoint="canvasNode"]');
  // Click on "Content Integration"
  easyd.sleep(2000); // wait a couple of seconds to make sure JS is loaded
  easyd.clickAt('css=g+image+rect:eq(2)');
  // Wait for the "Properties" panel to load
  easyd.waitForVisible('//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"]');
  // Expand the "Properties" panal
  easyd.click('.bpmClickyThumbUp');
  // Click on "Implmentation" (2nd element in the tabs)
  easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[2]');
  // Capture "Operation Name" drop-down menu
  easyd.drawSelect('[data-test-attr="service-flow-impl-operation"]');
  easyd.redMark('[id*="easydriver_"]');
  easyd.takeScreenshot(`${screenDir}/22.200.210`) // drop-down test case
  easyd.clearEasyDriverElements();
  // Get all options of "Operation Name"
  easyd.findElements('[data-test-attr="service-flow-impl-operation"] > option')
  .then(function (options) {
    options.shift();  // remove the 1st opiton: "None"

    // Tooltip test case number starts with:
    let tcNum = 220;

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
        // Create tooltips for all links
        links.forEach(function (link, index) {
          if (index === 0) { // First tooltip
            easyd.drawToolTip(link, {x: -250, y: 175}, false);
          } else { // The rest of tooltips
            easyd.drawToolTip(link, {x: 0, y: 0}, true);
          }
        });
      });

      // Sleep 0.5s to make sure all tooltips are drawn
      easyd.sleep(500);

      // Take a screenshot
      easyd.takeScreenshot(`${screenDir}/22.200.${tcNum}`);
      tcNum++;

      // Clear EasyDriver elements
      easyd.clearEasyDriverElements();

      // Got back to "Implmentation" so that we can click on another <option>
      easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[2]');
    });
  });

  // Quit the driver
  easyd.quit();
});
