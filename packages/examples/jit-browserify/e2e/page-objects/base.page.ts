// tslint:disable:typedef
// tslint:disable:function-name
// tslint:disable:no-import-side-effect
import { By, ThenableWebDriver, until } from 'selenium-webdriver';

export class BasePage {

  constructor(public browser: ThenableWebDriver) {}

  public async waitForElement(selector: string, timeout: number) {
    await this.browser.wait(until.elementLocated(By.css(selector)), timeout);
    return this.browser.findElement(By.css(selector));
  }

  public async waitForElements(selector: string, timeout: number) {
    await this.browser.wait(until.elementLocated(By.css(selector)), timeout);
    return this.browser.findElements(By.css(selector));
  }

  public async loadUrl(url: string) {
    console.log(`     * (re-)loading ${url}`);
    await this.browser.navigate().to(url);
    await this.browser.wait(this.browser.executeScript('return window.au && window.au.isStarted'));
  }
}
