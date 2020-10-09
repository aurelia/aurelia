// eslint-disable-next-line import/no-unassigned-import
import 'chromedriver';
import { Builder, By, until, logging } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

export function log(msg) {
  console.log(`     * ${msg}`);
}

const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(
    new chrome.Options()
      .addArguments(
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-backing-store-limit',
        '--disable-boot-animation',
        '--disable-breakpad',
        '--disable-cache',
        '--disable-clear-browsing-data-counters',
        '--disable-cloud-import',
        '--disable-component-extensions-with-background-pages',
        '--disable-contextual-search',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-infobars',
        '--disable-sync',
        '--disable-translate',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-managed-user-acknowledgment-check',
        '--no-pings',
        '--no-sandbox',
        '--no-wifi',
        '--no-zygote',
        '--window-size=800,600',
      )
      .setLoggingPrefs(
        new logging.Preferences()
          .setLevel(logging.Type.BROWSER, logging.Level.ALL)
      )
  )
  .build();

const baseUrl = `http://localhost:9000`;

export const navigate = {
  async to(path) {
    path =`${baseUrl}${path}`;
    log(`navigate.to('${path}')`);
    await driver.navigate().to(path);
    await aureliaStarted();
  },
  async forward() {
    log(`navigate.forward()`);
    await driver.navigate().forward();
  },
  async back() {
    log(`navigate.back()`);
    await driver.navigate().back();
  },
  async refresh() {
    log(`navigate.refresh()`);
    await driver.navigate().refresh();
    await aureliaStarted();
  },
};

export async function aureliaStarted(timeoutMs = 2500) {
  log(`aureliaStarted()`);
  await driver.wait(driver.executeScript('return window.au && window.au.isStarted'), timeoutMs, `Timed out after waiting for Aurelia to start for ${timeoutMs}ms`);
}

export async function getElement(selector, timeoutMs = 2500) {
  log(`getElement('${selector}')`);
  await driver.wait(until.elementLocated(By.css(selector)), timeoutMs, `Timed out after waiting for element '${selector}' for ${timeoutMs}ms`);
  return driver.findElement(By.css(selector));
}

export async function getElements(selector, timeoutMs = 2500) {
  log(`getElements('${selector}')`);
  await driver.wait(until.elementsLocated(By.css(selector)), timeoutMs, `Timed out after waiting for elements '${selector}' for ${timeoutMs}ms`);
  return driver.findElements(By.css(selector));
}

export async function quit() {
  log(`quit()`);
  await driver.quit();
}
