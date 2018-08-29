// tslint:disable:typedef
// tslint:disable:function-name
import { By } from 'selenium-webdriver';
import { browser, waitForElement, waitForElements } from '../common/browser';
import { AppConstants } from './app.constants';

const { cssSelectors } = AppConstants;

function log(msg: string) {
  console.log(`     * ${msg}`);
}

export class AppPage {
  public static get descriptionInput() {
    return browser.findElement(By.css(cssSelectors.descriptionInput));
  }

  public static async setDescriptionInputValue(value: string) {
    log(`set description input value to ${value}`);
    await this.descriptionInput.clear();
    await this.descriptionInput.sendKeys(value);
  }

  public static async getDescriptionInputValue() {
    return this.descriptionInput.getAttribute('value');
  }

  public static get countInput() {
    return browser.findElement(By.css(cssSelectors.countInput));
  }

  public static async setCountInputValue(value: number) {
    log(`set count value to ${value}`);
    await this.countInput.clear();
    await this.countInput.sendKeys(value);
  }

  public static async getCountInputValue() {
    return parseInt((await this.countInput.getAttribute('value')), 10);
  }

  public static get logInput() {
    return browser.findElement(By.css(cssSelectors.logInput));
  }

  public static async setLogInputValue(value: boolean) {
    await this.logInput.click();
  }

  public static async getLogInputValue() {
    return (await this.descriptionInput.getAttribute('checked')) === 'true';
  }

  public static get addTodoButton() {
    return browser.findElement(By.css(cssSelectors.addTodoButton));
  }

  public static async addTodo() {
    log(`click Add todo`);
    await this.addTodoButton.click();
  }

  public static get clearTodosButton() {
    return browser.findElement(By.css(cssSelectors.clearTodosButton));
  }

  public static async clearTodos() {
    log(`click Clear todos`);
    await this.clearTodosButton.click();
  }

  public static get toggleTodosButton() {
    log(`click Toggle todos`);
    return browser.findElement(By.css(cssSelectors.toggleTodosButton));
  }

  public static async toggleTodos() {
    log(`toggle todos`);
    await this.toggleTodosButton.click();
  }

  public static get descriptionInterpolation() {
    return browser.findElement(By.css(cssSelectors.descriptionText));
  }

  public static async getDescriptionInterpolationText() {
    return this.descriptionInterpolation.getText();
  }
  public static async getTodosCount() {
    const results = await browser.findElements(By.css(AppConstants.cssSelectors.todoElements));
    return results.length;
  }

  public static async getTodos() {
    return browser.findElements(By.css(AppConstants.cssSelectors.todoElements));
  }

  public static async getTodoElement(id: number, timeout: number = 10) {
    return waitForElement(cssSelectors.todoElement(id), timeout);
  }

  public static async clickTodoDoneCheckbox(id: number, timeout: number = 10) {
    log(`click Todo done checkbox`);
    const element = await waitForElement(cssSelectors.todoDoneCheckbox(id), timeout);
    await element.click();
  }

}
