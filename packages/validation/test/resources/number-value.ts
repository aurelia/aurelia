import { DOM } from 'aurelia-pal';
import { inject } from 'aurelia-dependency-injection';
import { customAttribute, customElement, bindable, inlineView } from 'aurelia-templating';
import { bindingMode } from 'aurelia-binding';

export abstract class NumberBase {
  public abstract value: number | null;
  // tslint:disable-next-line:variable-name
  protected _input: HTMLInputElement;

  constructor(protected input: HTMLInputElement) { }

  public valueChanged(newValue: number | null) {
    this.input.value = newValue === null ? '' : newValue.toString(10);
  }

  public inputValueChanged = () => {
    this.value = this.input.value === '' ? null : parseInt(this.input.value, 10);
  }

  public bind() {
    this._input = this.input;
    this._input.addEventListener('change', this.inputValueChanged);
  }

  public unbind() {
    this._input.removeEventListener('change', this.inputValueChanged);
    this._input = null as any;
  }
}

@customAttribute('number-value', bindingMode.twoWay)
@inject(Element)
export class NumberValueCustomAttribute extends NumberBase {
  public value: number | null;
}

@customElement('number-input')
@inject(Element)
@inlineView(`<template><input ref="input"></template>`)
export class NumberInputCustomElement extends NumberBase {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) public value: number | null;

  constructor(private element: Element) {
    super(null as any);
    (this.element as any).focus = () => this.input.focus();
  }

  public inputBlurred = () => {
    this.element.dispatchEvent(DOM.createCustomEvent('blur', {}));
  }

  public bind() {
    super.bind();
    this._input.addEventListener('blur', this.inputBlurred);
  }

  public unbind() {
    this._input.removeEventListener('blur', this.inputBlurred);
    super.unbind();
  }
}
