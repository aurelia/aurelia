// tslint:disable:typedef
// tslint:disable:function-name

function log(msg: string) {
  msg = `     * ${msg}`;
  console.log(msg);
}

export class AppPage {
  public static get descriptionInput() {
    return $('#description');
  }

  public static setDescriptionInputValue(value: string) {
    log(`set description input value to ${value}`);
    this.descriptionInput.clearElement();
    this.descriptionInput.setValue(value);
  }

  public static getDescriptionInputValue() {
    return (this.descriptionInput.getValue()).trim();
  }

  public static get countInput() {
    return $('#count');
  }

  public static setCountInputValue(value: number) {
    log(`set count value to ${value}`);
    this.countInput.clearElement();
    this.countInput.setValue(value);
  }

  public static getCountInputValue() {
    return parseInt((this.countInput.getAttribute('value')), 10);
  }

  public static get logInput() {
    return $('#log');
  }

  public static setLogInputValue(value: boolean) {
    this.logInput.click();
  }

  public static getLogInputValue() {
    return (this.descriptionInput.getAttribute('checked')) === 'true';
  }

  public static get addTodoButton() {
    return $('#addTodo');
  }

  public static addTodo() {
    log(`click Add todo`);
    this.addTodoButton.click();
  }

  public static get clearTodosButton() {
    return $('#clearTodos');
  }

  public static clearTodos() {
    log(`click Clear todos`);
    this.clearTodosButton.click();
  }

  public static get toggleTodosButton() {
    log(`click Toggle todos`);
    return $('#toggleTodos');
  }

  public static toggleTodos() {
    log(`toggle todos`);
    this.toggleTodosButton.click();
  }

  public static get descriptionInterpolation() {
    return $('#descriptionText');
  }

  public static getDescriptionInterpolationText() {
    // the replace + trim is a workaround for safari which renders lots of spaces and newlines
    return (this.descriptionInterpolation.getText()).replace(/\n/g, '').replace(/ +/g, ' ').trim();
  }
  public static getTodosCount() {
    const results = $$('.todo');
    return results.length;
  }

  public static getTodos() {
    return $$('.todo');
  }

  public static getTodoElement(id: number, timeout: number = 100) {
    const el = $(`#todo-${id}`);
    el.waitForVisible(timeout);
    return el;
  }

  public static clickTodoDoneCheckbox(id: number, timeout: number = 100) {
    log(`click Todo done checkbox`);
    const el = $(`#todo-${id}-done`);
    el.waitForVisible(timeout);
    el.click();
    if (browser.desiredCapabilities.browserName === 'Edge') {
      // because Edge is slow :)
      browser.pause(1000);
    }
  }

}
