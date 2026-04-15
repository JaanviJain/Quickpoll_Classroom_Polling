const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Example Domain Functionality', function() {
  // Mocha timeout (this replaces jest.setTimeout)
  this.timeout(30000);
  let driver;

  before(async function() {
    let options = new chrome.Options();
    // Headless mode is more stable in programmatic test runs
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('should successfully visit example.com', async function() {
    await driver.get('https://example.com');
    
    // wait for results by waiting for the title to be updated to include 'Example Domain'
    await driver.wait(until.titleContains('Example Domain'), 5000);
    
    const title = await driver.getTitle();
    // Node.js native assertion!
    assert(title.includes('Example Domain'));
  });
});
