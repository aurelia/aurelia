/* eslint-disable import/no-unassigned-import */
import 'chromedriver';
import { Builder, By, until, logging } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

export async function waitForElement(selector: string, timeout: number) {
  await browser.wait(until.elementLocated(By.css(selector)), timeout);
  return browser.findElement(By.css(selector));
}

export async function waitForElements(selector: string, timeout: number) {
  await browser.wait(until.elementLocated(By.css(selector)), timeout);
  return browser.findElements(By.css(selector));
}

export async function loadUrl(url: string) {
  console.log(`     * (re-)loading ${url}`);
  await browser.navigate().to(url);
  await browser.wait(browser.executeScript('return window.au && window.au.isStarted'));
}

function buildDriver() {
  let logPref = new logging.Preferences();
  logPref.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL);
  logPref.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  let options = new chrome.Options();
  [
    '--enable-automation',
    '--js-flags=--expose-gc',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-managed-user-acknowledgment-check',
    '--no-pings',
    '--no-sandbox',
    '--no-wifi',
    '--no-zygote',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
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
    '--disable-translate',
    '--disable-sync',
    '--window-size=1200,800'
  ].reduce((opt, flag) => opt.addArguments(flag), options);
  options = options.setLoggingPrefs(logPref);
  options = options.setPerfLoggingPrefs(<any>{
    enableNetwork: true,
    enablePage: true,
    traceCategories: [
      'toplevel',
      'blink.console',
      'blink.user_timing',
      'benchmark',
      'loading',
      'latencyInfo',
      'devtools.timeline'
    ].join(','),
    bufferUsageReportingInterval: 20000
  });

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

export const browser = buildDriver();

export async function executeScript<T>(script: string) {
  return browser.executeScript<T>(`var p = p || (p = window.performance); ${script};`);
}

export async function getPerformanceEntries() {
  return executeScript<PerformanceEntry[]>('return p.getEntries()');
}

export async function clearMarks() {
  await executeScript('p.clearMarks()');
}

export async function clearMeasures() {
  await executeScript('p.clearMeasures()');
}

export async function getPageLoadTime() {
  return executeScript<number>('return p.timing.loadEventEnd - p.timing.navigationStart');
}

export async function getConnectTime() {
  return executeScript<number>('return p.timing.responseEnd - p.timing.requestStart');
}

export async function getRenderTime() {
  return executeScript<number>('return p.timing.domComplete - p.timing.domLoading');
}

export async function getAureliaMeasurements() {
  return executeScript<{name: string; startTime: number; duration: number}[]>('return getAureliaMeasurements();');
}
