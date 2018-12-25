import { IBindingTargetAccessor, IDOM, ILifecycle, targetObserver } from '@aurelia/runtime';

export interface DataAttributeAccessor extends IBindingTargetAccessor<Node, string, string> {}

@targetObserver()
export class DataAttributeAccessor implements DataAttributeAccessor {
  public readonly dom: IDOM;
  public currentValue: string;
  public defaultValue: string;
  public lifecycle: ILifecycle;
  public obj: HTMLElement;
  public oldValue: string;
  public propertyKey: string;

  constructor(dom: IDOM, lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string) {
    this.dom = dom;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.oldValue = this.currentValue = this.getValue();
    this.propertyKey = propertyKey;
  }

  public getValue(): string {
    return this.dom.getAttribute(this.obj, this.propertyKey);
  }

  public setValueCore(newValue: string): void {
    if (newValue === null) {
      this.dom.removeAttribute(this.obj, this.propertyKey);
    } else {
      this.dom.setAttribute(this.obj, this.propertyKey, newValue);
    }
  }
}
