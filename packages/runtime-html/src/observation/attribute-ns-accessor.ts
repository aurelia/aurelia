import { AccessorType } from '@aurelia/runtime';
import { createLookup } from '../utilities';

import type { IAccessor, LifecycleFlags } from '@aurelia/runtime';

const nsMap: Record<string, AttributeNSAccessor> = createLookup();

/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export class AttributeNSAccessor implements IAccessor<string | null> {

  public static forNs(ns: string): AttributeNSAccessor {
    return nsMap[ns] ??= new AttributeNSAccessor(ns);
  }

  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public constructor(
    /**
     * The namespace associated with this accessor
     */
    public readonly ns: string,
  ) {
  }

  public getValue(obj: HTMLElement, propertyKey: string): string | null {
    return obj.getAttributeNS(this.ns, propertyKey);
  }

  public setValue(newValue: string | null, f: LifecycleFlags, obj: HTMLElement, key: string): void {
    if (newValue == void 0) {
      obj.removeAttributeNS(this.ns, key);
    } else {
      obj.setAttributeNS(this.ns, key, newValue);
    }
  }
}
