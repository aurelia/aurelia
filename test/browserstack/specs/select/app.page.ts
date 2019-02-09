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

  public static get select() {
    return this.waitForElement('#select');
  }

  public static get selectedValue() {
    return this.select.getAttribute('value').trim();
  }

  public static setSelectByVisibleText(text: string) {
    logAction(`setSelectByVisibleText: ${text}`);
    this.select.selectByVisibleText(text);
  }

  public static setSelectByIndex(index: number) {
    logAction(`setSelectByIndex: ${index}`);
    this.select.selectByIndex(index);
  }

  public static get checkbox() {
    return this.waitForElement('#checkbox');
  }

  public static get checkboxChecked() {
    return this.checkbox.isSelected();
  }

  public static checkCheckbox() {
    logAction(`checkCheckbox`);
    if (!this.checkboxChecked) {
      this.clickCheckbox();
    }
  }

  public static uncheckCheckbox() {
    logAction(`uncheckCheckbox`);
    if (this.checkboxChecked) {
      this.clickCheckbox();
    }
  }

  public static clickCheckbox() {
    logAction(`clickCheckbox`);
    this.checkbox.click();
  }

  public static get options() {
    return this.waitForElements('.option');
  }

  public static option(index: number) {
    return this.waitForElement(`#option-${index}`);
  }
}
