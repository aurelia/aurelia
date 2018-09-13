import { logAction } from "../logger";

// tslint:disable:typedef
// tslint:disable:function-name

export class AppPage {
  public static get select() {
    return $('#select');
  }

  public static getSelectedValue() {
    return (this.select.getValue()).trim();
  }

  public static getSelectedText() {
    return (this.select.getText('option:checked')).trim();
  }

  public static setSelectByValue(value: string) {
    logAction(`setSelectByValue: ${value}`);
    this.select.selectByValue(value);
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
    return $('#checkbox');
  }

  public static checkboxChecked() {
    return this.checkbox.isSelected();
  }

  public static checkCheckbox() {
    logAction(`checkCheckbox`);
    if (!(this.checkboxChecked())) {
      this.clickCheckbox();
    }
  }

  public static uncheckCheckbox() {
    logAction(`uncheckCheckbox`);
    if ((this.checkboxChecked())) {
      this.clickCheckbox();
    }
  }

  public static clickCheckbox() {
    logAction(`clickCheckbox`);
    this.checkbox.click();
  }

  public static get options() {
    return $$('.option');
  }

  public static option(index: number) {
    return $(`#option-${index}`);
  }
}
