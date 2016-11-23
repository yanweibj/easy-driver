const EasyDriver = require('./easy-driver');
const languages = [
  'en', 'zh', 'zh-tw', 'ja', 'ko', 'it', 'fr', 'de', 'es', 'pt-br', 'pt',
  'nb', 'fi', 'sv', 'da', 'tr', 'nl', 'cs', 'hu', 'ru', 'ro', 'pl', 'el'
];
const pcServer = 'lsc218.tw.ibm.com';
const testcaseMapping = {
  DOC_OP_ADD_DOCUMENT_TO_FOLDER: "22.200.220",
  FOLDER_OP_ADD_FOLDER_TO_FOLDER: "22.200.221",
  DOC_OP_CANCEL_CHECK_OUT_DOCUMENT: "22.200.222",
  DOC_OP_CHECK_IN_DOCUMENT: "22.200.223",
  DOC_OP_CHECK_OUT_DOCUMENT: "22.200.224",
  DOC_OP_COPY_DOCUMENT: "22.200.225",
  DOC_OP_CREATE_DOCUMENT: "22.200.226",
  FOLDER_OP_CREATE_FOLDER: "22.200.227",
  DOC_OP_DELETE_DOCUMENT: "22.200.228",
  FOLDER_OP_DELETE_FOLDER: "22.200.229",
  DOC_OP_GET_ALL_DOCUMENT_VERSIONS: "22.200.230",
  FOLDER_OP_GET_CHILDREN: "22.200.231",
  DOC_OP_GET_DOCUMENT: "22.200.232",
  DOC_OP_GET_DOCUMENT_CONTENT: "22.200.233",
  FOLDER_OP_GET_DOCS_IN_FOLDER: "22.200.234",
  FOLDER_OP_GET_FOLDER: "22.200.235",
  FOLDER_OP_GET_FOLDER_BY_PATH: "22.200.236",
  FOLDER_OP_GET_FOLDER_TREE: "22.200.237",
  SERVER_OP_GET_TYPE_DEFINITION: "22.200.238",
  SERVER_OP_GET_TYPE_DESCENDANTS: "22.200.239",
  DOC_OP_MOVE_DOCUMENT: "22.200.240",
  FOLDER_OP_MOVE_FOLDER: "22.200.241",
  DOC_OP_REMOVE_DOCUMENT_FROM_FOLDER: "22.200.242",
  FOLDER_OP_REMOVE_FOLDER_FROM_FOLDER: "22.200.243",
  DOC_OP_RENAME_REFERENCE: "22.200.244",
  FOLDER_OP_RENAME_REFERENCE: "22.200.245",
  SEARCH_OP: "22.200.246",
  DOC_OP_SET_DOCUMENT_CONTENT: "22.200.247",
  DOC_OP_UPDATE_DOCUMENT_PROPERTIES: "22.200.248",
  FOLDER_OP_UPDATE_FOLDER_PROPERTIES: "22.200.249",
};

languages.forEach(function (lang) {
  // New a driver with locale: lang
  const easyd = new EasyDriver(lang);

  // Screenshot directory
  const screenDir = `bpm_screens/${lang}`;

  // Process App used
  const procApp = 'TVTAPP01';

  // Create a lang directory to hold all screenshots
  easyd.createDirectories(screenDir);
  // Open "Process Center"
  easyd.open(`https://${pcServer}:9443/ProcessCenter/login.jsp`);
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
  // Wait and make sure lang preferences are saved to pcServer.
  easyd.sleep(500);
  // Click on Process App: procApp
  easyd.click(`//span[text()="${procApp}"]/../../../../../../..//span[@class="openInDesignerActionIcon actIcon"]`);
  // Click on "Services" and select "Service Flow01"
  easyd.click('id=dijit__TreeNode_5');
  easyd.click('//*[text()="Service Flow01"]');
  // Wait for the diagram to load
  easyd.waitForVisible('//div[@dojoattachpoint="canvasNode"]');
  // Click on "Content Integration"
  easyd.sleep(2000); // wait a few seconds to make sure JS is loaded
  easyd.clickAt('css=g+image+rect:eq(2)');
  // Wait for the "Properties" panel to load
  easyd.waitForVisible('//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"]');
  // Expand the "Properties" panal
  easyd.click('.bpmClickyThumbUp');
  // Click on "Implmentation" (2nd element in the tabs)
  easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[2]');
  // Wait till "Operation Name" select box is enabled
  easyd.waitForEnabled('[data-test-attr="service-flow-impl-operation"]');
  // Capture "Operation Name" drop-down menu
  easyd.drawSelect('[data-test-attr="service-flow-impl-operation"]', {x: -465, y: -100});
  easyd.drawRedMark('[data-test-attr="service-flow-impl-operation"]');
  easyd.drawRedMark('[id*="easydriver_"]');
  easyd.drawArrow('[data-test-attr="service-flow-impl-operation"]', '[id*="easydriver_"]');
  easyd.takeScreenshot(`${screenDir}/22.200.210`); // drop-down test case
  easyd.clearAllDrawings();
  // Get all options of "Operation Name"
  easyd.findElements('[data-test-attr="service-flow-impl-operation"] > option')
  .then(function (options) {
    options.shift();  // remove the 1st opiton: "<None>"

    // Loop through the rest of options
    options.forEach(function (option) {
      // Select the option
      easyd.click(option);

      // Get the option value, so that we can map it to the test case number in testcaseMapping
      easyd.getAttribute(option, 'value').then(function (val) {
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
              easyd.drawFlyover(link, {offsetX: -380, offsetY: 180, fromLastPos: false, drawSymbol: true});
            } else { // The rest of tooltips
              easyd.drawFlyover(link, {offsetX: 0, offsetY: 0, fromLastPos: true, drawSymbol: true});
            }
          });
        });

        // Take a screenshot
        easyd.takeScreenshot(`${screenDir}/${testcaseMapping[val]}`);

        // Clear EasyDriver elements
        easyd.clearAllDrawings();

        // Got back to "Implmentation" so that we can click on another <option>
        easyd.click('xpath=(//div[@class="TabbedPropertiesPane"]//span[@class="tabLabel"])[2]');
      }); // end of option value
    }); // end of options loop
  });

  // Quit the driver
  easyd.quit();
});
