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
    return browser.findElement(By.css(cssSelectors.toggleTodosButton));
  }

  public static async toggleTodos() {
    log(`click Toggle todos`);
    await this.toggleTodosButton.click();
  }

  public static get updateTodosButton() {
    return browser.findElement(By.css(cssSelectors.updateTodosButton));
  }

  public static async updateTodos() {
    log(`click Update todos`);
    await this.updateTodosButton.click();
  }

  public static get reverseTodosButton() {
    return browser.findElement(By.css(cssSelectors.reverseTodosButton));
  }

  public static async reverseTodos() {
    log(`click Reverse todos`);
    await this.reverseTodosButton.click();
  }

  public static get descriptionInterpolation() {
    return browser.findElement(By.css(cssSelectors.descriptionText));
  }

  public static async getDescriptionInterpolationText() {
    return this.descriptionInterpolation.getText();
  }

}
