// Test Languages
const languages = ['zh_Hant', 'ja'];

// Loop Test Languages
languages.forEach(function (lang) {
  /* --- Pre: Environment --- */
  // New a driver
  const EasyDriver = require('./easy-driver');
  const easyd = new EasyDriver({locale: lang});
  easyd.maximizeWindow();

  // Create ${lang} folder
  const langFolder = `blueworks_1stRun/${lang}`;
  easyd.createDirectories(langFolder);

  // Login
  easyd.open('https://bwlux-web.canlab.ibm.com/sLogin.html');
  easyd.sendKeys('name=txtLogin', 'bwl_ide2@mailinator.com');
  easyd.sendKeys('name=txtPassword', 'tvt2test', easyd.Key.ENTER);

  // Switch Blueworks Live to ${lang}
  easyd.click('#pageHeaderOtherControls * li:eq(0)'); // User
  easyd.click('.selectListButton:eq(2)'); // Location tab
  easyd.select('.timezone:eq(1)', `[value="${lang}"]`); // Language <select>
  easyd.click('.bpDialogButtons > button'); // Update button

  /* --- TVT Execution: Test Cases --- */
  // Case 1
  easyd.blank();
  easyd.open('https://bwlux-web.canlab.ibm.com/scr/processes/5f60058220082#bpmn');
  easyd.doubleClick('.bpmn_activity_table * span'); // Activity
  easyd.click('.detailsTabContainer > li:eq(3)'); // Documentation
  easyd.click('.detailContent * em'); // Click to Edit Description
  easyd.click('.rteButton > img:eq(14)'); // Insert Image icon
  easyd.drawRedMark('.bpPaddedDialogContent');
  easyd.takeScreenshot(`${langFolder}/01.010.010.png`);
  easyd.clearAllDrawings();

  // Case 2

  // Case 3

  /* --- Post: Cleanup --- */
  // Delete generated data that will affect looping of Test Case Execution

  // Quit the driver
  easyd.quit();
});
