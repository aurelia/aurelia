import { AccessorType } from '@aurelia/runtime';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IAccessor, PropertyAccessor } from '@aurelia/runtime';

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see PropertyAccessor
 */
export class DataAttributeAccessor implements IAccessor<string | null> {
  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public getValue(obj: HTMLElement, key: string): string | null {
    return obj.getAttribute(key);
  }

  public setValue(newValue: string | null, obj: HTMLElement, key: string): void {
    if (newValue == null) {
      obj.removeAttribute(key);
    } else {
      obj.setAttribute(key, newValue);
    }
  }
}

export const attrAccessor = new DataAttributeAccessor();
