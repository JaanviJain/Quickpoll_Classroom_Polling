const { Builder, Browser, By, until } = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('QuickPoll Login Functionality', function () {
  this.timeout(40000);
  let driver;

  before(async function () {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should successfully log in as an admin', async function () {
    await driver.get('http://localhost:3001/login');

    // 2. Wait for the inputs to be visible
    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    await driver.wait(until.elementIsVisible(emailInput), 5000);

    const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
    const submitBtn = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);

    // 3. Fill in credentials (Admin credentials from seed)
    await emailInput.sendKeys('admin@quickpoll.com');
    await passwordInput.sendKeys('AdminPassword123!');

    // 4. Click Sign In
    await submitBtn.click();

    // 5. Verify redirection to the homepage
    await driver.wait(until.urlIs('http://localhost:3005/'), 10000);

    // 6. Verify that the CTA button now reflects a logged-in state
    const ctaButton = await driver.wait(until.elementLocated(By.id('hero-cta-primary')), 5000);
    await driver.wait(until.elementIsVisible(ctaButton), 5000);

    const buttonText = await ctaButton.getText();
    console.log('Post-login button text:', buttonText);

    assert(buttonText.toLowerCase().includes('dashboard'), `Button text "${buttonText}" should include "Dashboard" after login`);
  });

  it('should show an error message with invalid credentials', async function () {
    await driver.get('http://localhost:3005/login');

    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    const passwordInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
    const submitBtn = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);

    await emailInput.sendKeys('wrong@example.com');
    await passwordInput.sendKeys('NotThePassword123');
    await submitBtn.click();

    // Look for the error message div (based on the "AlertCircle" component in page.tsx)
    const errorMsg = await driver.wait(until.elementLocated(By.css('[class*="bg-danger-muted"]')), 5000);
    await driver.wait(until.elementIsVisible(errorMsg), 5000);

    const errorText = await errorMsg.getText();
    console.log('Error message found:', errorText);

    assert(errorText.length > 0, 'An error message should be displayed');
  });
});
