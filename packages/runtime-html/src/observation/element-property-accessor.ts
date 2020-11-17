import { AccessorType } from '@aurelia/runtime';

import type { IIndexable } from '@aurelia/kernel';
import type { IAccessor, LifecycleFlags } from '@aurelia/runtime';

/**
 * Property accessor for HTML Elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see DataAttributeAccessor
 */
export class ElementPropertyAccessor implements IAccessor {
  public currentValue: unknown = void 0;

  public readonly obj!: Node & IIndexable;
  public readonly propertyKey!: string;
  // ObserverType.Layout is not always true, it depends on the property
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Layout;

  public getValue(obj: HTMLElement & IIndexable, key: string): unknown {
    return obj[key];
  }

  public setValue(newValue: string | null, flags: LifecycleFlags, obj: HTMLElement & IIndexable, key: string): void {
    obj[key] = newValue;
  }
}

export const elementPropertyAccessor = new ElementPropertyAccessor();
