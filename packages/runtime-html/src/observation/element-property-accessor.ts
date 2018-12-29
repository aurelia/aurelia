import { IBindingTargetAccessor, ILifecycle, targetObserver } from '@aurelia/runtime';

export interface ElementPropertyAccessor extends IBindingTargetAccessor<object, string> {}

@targetObserver('')
export class ElementPropertyAccessor implements ElementPropertyAccessor {
  public readonly isDOMObserver: true;
  public lifecycle: ILifecycle;
  public obj: object;
  public propertyKey: string;

  constructor(lifecycle: ILifecycle, obj: object, propertyKey: string) {
    this.isDOMObserver = true;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.propertyKey = propertyKey;
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValueCore(value: unknown): void {
    this.obj[this.propertyKey] = value;
  }
}
