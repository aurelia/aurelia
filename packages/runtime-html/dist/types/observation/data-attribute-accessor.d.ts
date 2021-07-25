import { AccessorType } from '@aurelia/runtime';
import type { IAccessor, LifecycleFlags } from '@aurelia/runtime';
/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
export declare class DataAttributeAccessor implements IAccessor<string | null> {
    type: AccessorType;
    getValue(obj: HTMLElement, key: string): string | null;
    setValue(newValue: string | null, f: LifecycleFlags, obj: HTMLElement, key: string): void;
}
export declare const attrAccessor: DataAttributeAccessor;
//# sourceMappingURL=data-attribute-accessor.d.ts.map