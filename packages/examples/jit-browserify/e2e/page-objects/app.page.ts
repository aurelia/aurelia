// tslint:disable:typedef
// tslint:disable:function-name
import { By, ThenableWebDriver } from 'selenium-webdriver';
import { AppConstants } from './app.constants';
import { BasePage } from './base.page';

const { cssSelectors } = AppConstants;

function log(msg: string) {
  console.log(`     * ${msg}`);
}

export class AppPage extends BasePage {
  constructor(public browser: ThenableWebDriver) {
    super(browser);
  }

  public get descriptionInput() {
    return this.browser.findElement(By.css(cssSelectors.descriptionInput));
  }

  public async setDescriptionInputValue(value: string) {
    log(`set description input value to ${value}`);
    await this.descriptionInput.clear();
    await this.descriptionInput.sendKeys(value);
  }

  public async getDescriptionInputValue() {
    return (await this.descriptionInput.getAttribute('value')).trim();
  }

  public get countInput() {
    return this.browser.findElement(By.css(cssSelectors.countInput));
  }

  public async setCountInputValue(value: number) {
    log(`set count value to ${value}`);
    await this.countInput.clear();
    await this.countInput.sendKeys(value);
  }

  public async getCountInputValue() {
    return parseInt((await this.countInput.getAttribute('value')), 10);
  }

  public get logInput() {
    return this.browser.findElement(By.css(cssSelectors.logInput));
  }

  public async setLogInputValue(value: boolean) {
    await this.logInput.click();
  }

  public async getLogInputValue() {
    return (await this.descriptionInput.getAttribute('checked')) === 'true';
  }

  public get addTodoButton() {
    return this.browser.findElement(By.css(cssSelectors.addTodoButton));
  }

  public async addTodo() {
    log(`click Add todo`);
    await this.addTodoButton.click();
  }

  public get clearTodosButton() {
    return this.browser.findElement(By.css(cssSelectors.clearTodosButton));
  }

  public async clearTodos() {
    log(`click Clear todos`);
    await this.clearTodosButton.click();
  }

  public get toggleTodosButton() {
    log(`click Toggle todos`);
    return this.browser.findElement(By.css(cssSelectors.toggleTodosButton));
  }

  public async toggleTodos() {
    log(`toggle todos`);
    await this.toggleTodosButton.click();
  }

  public get descriptionInterpolation() {
    return this.browser.findElement(By.css(cssSelectors.descriptionText));
  }

  public async getDescriptionInterpolationText() {
    // the replace + trim is a workaround for safari which renders lots of spaces and newlines
    return (await this.descriptionInterpolation.getText()).replace(/\n/g, '').replace(/ +/g, ' ').trim();
  }
  public async getTodosCount() {
    const results = await this.browser.findElements(By.css(AppConstants.cssSelectors.todoElements));
    return results.length;
  }

  public async getTodos() {
    return this.browser.findElements(By.css(AppConstants.cssSelectors.todoElements));
  }

  public async getTodoElement(id: number, timeout: number = 10) {
    return this.waitForElement(cssSelectors.todoElement(id), timeout);
  }

  public async clickTodoDoneCheckbox(id: number, timeout: number = 10) {
    log(`click Todo done checkbox`);
    const element = await this.waitForElement(cssSelectors.todoDoneCheckbox(id), timeout);
    await element.click();
  }

}
