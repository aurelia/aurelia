// tslint:disable:typedef
// tslint:disable:function-name
// tslint:disable:no-import-side-effect
import 'chromedriver';
import { Builder, By, until } from 'selenium-webdriver';

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

export const browser = new Builder().forBrowser('chrome').build();
