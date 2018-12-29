import { IBindingTargetAccessor, ILifecycle, targetObserver } from '@aurelia/runtime';

export interface AttributeNSAccessor extends IBindingTargetAccessor<HTMLElement, string, string> {}

@targetObserver('')
export class AttributeNSAccessor implements AttributeNSAccessor {
  public readonly isDOMObserver: true;
  public attributeName: string;
  public currentValue: string;
  public defaultValue: string;
  public lifecycle: ILifecycle;
  public obj: HTMLElement;
  public oldValue: string;
  public propertyKey: string;
  public namespace: string;

  constructor(lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string, attributeName: string, namespace: string) {
    this.isDOMObserver = true;
    this.attributeName = attributeName;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.oldValue = this.currentValue = this.getValue();
    this.propertyKey = propertyKey;
    this.namespace = namespace;
  }

  public getValue(): string {
    return this.obj.getAttributeNS(this.namespace, this.attributeName);
  }

  public setValueCore(newValue: string): void {
    this.obj.setAttributeNS(this.namespace, this.attributeName, newValue);
  }
}
