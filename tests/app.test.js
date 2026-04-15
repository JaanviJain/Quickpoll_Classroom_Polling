const { Builder, Browser, By, until } = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('QuickPoll Application E2E Tests', function () {
  this.timeout(30000);
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

  it('should load the home page and show the correct heading', async function () {
    await driver.get('http://localhost:3005');

    // Wait for the main heading to be visible
    const heading = await driver.wait(until.elementLocated(By.css('h1')), 5000);
    await driver.wait(until.elementIsVisible(heading), 5000);
    
    const text = await heading.getText();
    console.log('Heading text found:', text);

    assert(text.toLowerCase().includes('engage your classroom'), `Heading text "${text}" should contain "Engage your classroom"`);
  });

  it('should have a "Get Started" or "Dashboard" link', async function () {
    await driver.get('http://localhost:3001');

    const ctaButton = await driver.wait(until.elementLocated(By.id('hero-cta-primary')), 5000);
    await driver.wait(until.elementIsVisible(ctaButton), 5000);
    
    const buttonText = await ctaButton.getText();
    console.log('CTA button text found:', buttonText);

    assert(buttonText.includes('Get Started') || buttonText.includes('Dashboard'), 'CTA button text should be present');
  });

  it('should display the "Live Polling" feature card', async function () {
    await driver.get('http://localhost:3005');

    const featureCard = await driver.wait(until.elementLocated(By.id('feature-live-polling')), 5000);
    await driver.wait(until.elementIsVisible(featureCard), 5000);
    
    const titleElement = await featureCard.findElement(By.css('h3'));
    const title = await titleElement.getText();
    console.log('Feature card title found:', title);

    assert.strictEqual(title, 'Live Polling');
  });
});
