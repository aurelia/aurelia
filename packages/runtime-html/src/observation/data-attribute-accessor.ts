import { AccessorType } from '@aurelia/runtime';

import type { IAccessor, LifecycleFlags } from '@aurelia/runtime';

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
export class DataAttributeAccessor implements IAccessor<string | null> {
  public readonly obj!: HTMLElement;
  public readonly propertyKey: string = '';
  public currentValue: string | null = null;

  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public getValue(obj: HTMLElement, key: string): string | null {
    return obj.getAttribute(key);
  }

  public setValue(newValue: string | null, flags: LifecycleFlags, obj: HTMLElement, key: string): void {
    if (newValue == void 0) {
      obj.removeAttribute(key);
    } else {
      obj.setAttribute(key, newValue);
    }
  }
}

export const attrAccessor = new DataAttributeAccessor();
