// tslint:disable:typedef
// tslint:disable:function-name
// tslint:disable:no-import-side-effect
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
  options = options.addArguments('--js-flags=--expose-gc');
  options = options.addArguments('--no-sandbox');
  options = options.addArguments('--no-first-run');
  options = options.addArguments('--enable-automation');
  options = options.addArguments('--disable-infobars');
  options = options.addArguments('--disable-background-networking');
  options = options.addArguments('--disable-background-timer-throttling');
  options = options.addArguments('--disable-cache');
  options = options.addArguments('--disable-translate');
  options = options.addArguments('--disable-sync');
  options = options.addArguments('--disable-extensions');
  options = options.addArguments('--disable-default-apps');
  options = options.addArguments('--window-size=1200,800');
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
