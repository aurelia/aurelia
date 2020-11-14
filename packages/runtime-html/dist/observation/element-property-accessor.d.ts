import { IIndexable } from '@aurelia/kernel';
import { IAccessor, LifecycleFlags, AccessorType } from '@aurelia/runtime';
/**
 * Property accessor for HTML Elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see DataAttributeAccessor
 */
export declare class ElementPropertyAccessor implements IAccessor {
    currentValue: unknown;
    readonly obj: Node & IIndexable;
    readonly propertyKey: string;
    type: AccessorType;
    getValue(obj: HTMLElement & IIndexable, key: string): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags, obj: HTMLElement & IIndexable, key: string): void;
}
export declare const elementPropertyAccessor: ElementPropertyAccessor;
//# sourceMappingURL=element-property-accessor.d.ts.map