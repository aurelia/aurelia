import { AccessorType, IObserver } from '@aurelia/runtime';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IAccessor, PropertyAccessor } from '@aurelia/runtime';
import { mixinNoopSubscribable } from './observation-utils';

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see PropertyAccessor
 */
export class DataAttributeAccessor implements IAccessor<string | null>, IObserver {
  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  // the followings come from the noop mixing
  public subscribe!: () => void;
  public unsubscribe!: () => void;

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

mixinNoopSubscribable(DataAttributeAccessor);

export const attrAccessor = new DataAttributeAccessor();
