import { logAction } from "../logger";

export class AppPage {
  private static waitForElement(selector: string, timeout: number = 1000) {
    const el = $(selector);
    el.waitForDisplayed(timeout);
    return el;
  }
  private static waitForElements(selector: string, timeout: number = 1000) {
    const el = $$(selector);
    el.forEach(el => el.waitForDisplayed(timeout));
    return el;
  }

  private static getDescriptionInput() {
    return this.waitForElement('#description');
  }

  public static setDescriptionInputValue(value: string) {
    logAction(`set description input value to ${value}`);
    const input = this.getDescriptionInput();
    input.clearValue();
    input.setValue(value.toString());
  }

  public static getDescriptionInputValue() {
    const input = this.getDescriptionInput();
    const value = input.getAttribute('value');
    return value.trim();
  }

  private static getCountInput() {
    return this.waitForElement('#count');
  }

  public static setCountInputValue(value: number) {
    logAction(`set count value to ${value}`);
    const input = this.getCountInput();
    input.clearValue();
    input.setValue(value.toString());
  }

  public static getCountInputValue() {
    const input = this.getCountInput();
    const value = input.getAttribute('value');
    return parseInt(value.trim(), 10);
  }

  private static getAddTodoButton() {
    return this.waitForElement('#addTodo');
  }

  public static addTodo() {
    logAction(`click Add todo`);
    const button = this.getAddTodoButton();
    button.click();
  }

  private static getClearTodosButton() {
    return this.waitForElement('#clearTodos');
  }

  public static clearTodos() {
    logAction(`click Clear todos`);
    const button = this.getClearTodosButton();
    button.click();
  }

  private static getToggleTodosButton() {
    logAction(`click Toggle todos`);
    return this.waitForElement('#toggleTodos');
  }

  public static toggleTodos() {
    logAction(`toggle todos`);
    const button = this.getToggleTodosButton();
    button.click();
  }

  private static getDescriptionInterpolation() {
    return this.waitForElement('#descriptionText');
  }

  public static getDescriptionInterpolationText() {
    // the replace + trim is a workaround for safari which renders lots of spaces and newlines
    const el = this.getDescriptionInterpolation();
    const text = el.getText();
    return text.replace(/\n/g, '').replace(/ +/g, ' ').trim();
  }
  public static getTodosCount() {
    const results = this.waitForElements('.todo');
    return results.length;
  }

  public static getTodos() {
    return this.waitForElements('.todo');
  }

  public static getTodoElement(id: number) {
    return this.waitForElement(`#todo-${id}`);
  }

  public static clickTodoDoneCheckbox(id: number) {
    logAction(`click Todo done checkbox`);
    const el = this.waitForElement(`#todo-${id}-done`);
    el.click();
  }

}
