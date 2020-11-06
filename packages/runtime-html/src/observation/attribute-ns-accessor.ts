import { IAccessor, LifecycleFlags, AccessorType } from '@aurelia/runtime';

const nsMap: Record<string, AttributeNSAccessor> = Object.create(null);

/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export class AttributeNSAccessor implements IAccessor<string | null> {

  public static forNs(ns: string): AttributeNSAccessor {
    return nsMap[ns] ??= new AttributeNSAccessor(ns);
  }

  public currentValue: string | null = null;
  public oldValue: string | null = null;

  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public obj?: HTMLElement;
  public propertyKey?: string;

  public constructor(
    public readonly namespace: string,
  ) {
  }

  public getValue(obj: HTMLElement, propertyKey: string): string | null {
    return obj.getAttributeNS(this.namespace, propertyKey);
  }

  public setValue(newValue: string | null, flags: LifecycleFlags, obj: HTMLElement, key: string): void {
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      if (newValue == void 0) {
        obj.removeAttributeNS(this.namespace, key);
      } else {
        obj.setAttributeNS(this.namespace, key, newValue);
      }
    }
  }

  public flushChanges(flags: LifecycleFlags): void {/* empty */}
}
