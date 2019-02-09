import { logAction } from "../logger";

export class AppPage {
  public static waitForElement(selector: string, timeout: number = 1000) {
    const el = $(selector);
    el.waitForDisplayed(timeout);
    return el;
  }
  public static waitForElements(selector: string, timeout: number = 1000) {
    const el = $$(selector);
    el.forEach(el => el.waitForDisplayed(timeout));
    return el;
  }

  public static get descriptionInput() {
    return this.waitForElement('#description');
  }

  public static setDescriptionInputValue(value: string) {
    logAction(`set description input value to ${value}`);
    this.descriptionInput.clearValue();
    this.descriptionInput.setValue(value.toString());
  }

  public static getDescriptionInputValue() {
    return this.descriptionInput.getAttribute('value').trim();
  }

  public static get countInput() {
    return this.waitForElement('#count');
  }

  public static setCountInputValue(value: number) {
    logAction(`set count value to ${value}`);
    this.countInput.clearValue();
    this.countInput.setValue(value.toString());
  }

  public static get getCountInputValue() {
    return parseInt(this.countInput.getAttribute('value'), 10);
  }

  public static get logInput() {
    return this.waitForElement('#log');
  }

  public static setLogInputValue(value: boolean) {
    this.logInput.click();
  }

  public static get logInputValue() {
    return this.descriptionInput.getAttribute('checked') === 'true';
  }

  public static get addTodoButton() {
    return this.waitForElement('#addTodo');
  }

  public static addTodo() {
    logAction(`click Add todo`);
    this.addTodoButton.click();
  }

  public static get clearTodosButton() {
    return this.waitForElement('#clearTodos');
  }

  public static clearTodos() {
    logAction(`click Clear todos`);
    this.clearTodosButton.click();
  }

  public static get toggleTodosButton() {
    logAction(`click Toggle todos`);
    return this.waitForElement('#toggleTodos');
  }

  public static toggleTodos() {
    logAction(`toggle todos`);
    this.toggleTodosButton.click();
  }

  public static get descriptionInterpolation() {
    return this.waitForElement('#descriptionText');
  }

  public static getDescriptionInterpolationText() {
    // the replace + trim is a workaround for safari which renders lots of spaces and newlines
    return this.descriptionInterpolation.getText().replace(/\n/g, '').replace(/ +/g, ' ').trim();
  }
  public static getTodosCount() {
    const results = this.waitForElements('.todo');
    return results.length;
  }

  public static get todos() {
    return this.waitForElements('.todo');
  }

  public static todoElement(id: number) {
    return this.waitForElement(`#todo-${id}`);
  }

  public static clickTodoDoneCheckbox(id: number) {
    logAction(`click Todo done checkbox`);
    const el = this.waitForElement(`#todo-${id}-done`);
    el.click();
    if (browser.capabilities.browserName === 'Edge') {
      // because Edge is slow :)
      browser.pause(1000);
    }
  }

}
