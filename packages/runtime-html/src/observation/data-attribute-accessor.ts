import { IBindingTargetAccessor, ILifecycle, targetObserver } from '@aurelia/runtime';

export interface DataAttributeAccessor extends IBindingTargetAccessor<Node, string, string> {}

@targetObserver()
export class DataAttributeAccessor implements DataAttributeAccessor {
  public readonly isDOMObserver: true;
  public currentValue: string;
  public defaultValue!: string;
  public lifecycle: ILifecycle;
  public obj: HTMLElement;
  public oldValue: string;
  public propertyKey: string;

  constructor(lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string) {
    this.isDOMObserver = true;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.oldValue = this.currentValue = this.getValue()!;
    this.propertyKey = propertyKey;
  }

  public getValue(): string {
    return this.obj.getAttribute(this.propertyKey)!;
  }

  public setValueCore(newValue: string): void {
    if (newValue === null) {
      this.obj.removeAttribute(this.propertyKey);
    } else {
      this.obj.setAttribute(this.propertyKey, newValue);
    }
  }
}
