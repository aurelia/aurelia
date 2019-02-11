import { IContainer } from '@aurelia/kernel';
import { customElement, bindable, INode, BindingMode } from '@aurelia/runtime';
import template from './combo-box.html';
import { Filter } from './value-converters';
// import { customElement, bindable, autoinject, bindingMode } from "aurelia-framework";

@customElement({
  name: 'combo-box',
  template,
  dependencies: [Filter]
})
export class ComboBox<T = any> {
  public static readonly register: (container: IContainer) => IContainer;

  static inject = [INode];

  @bindable items: T[]

  @bindable({ mode: BindingMode.twoWay }) selection: T

  expanded: boolean;
  readonly input: HTMLInputElement;
  readonly listCt: HTMLElement;

  constructor(public readonly element: Element) {
    window['combo'] = this;
  }

  expandList() {
    this.expanded = true;
  }

  select(item: T) {
    this.selection = item;
    this.expanded = false;
  }

  focus() {
    if (!this.expanded) {
      this.expandList();
    } else {
      this.input.focus();
    }
  }
}
