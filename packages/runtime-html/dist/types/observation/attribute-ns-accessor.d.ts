import { AccessorType } from '@aurelia/runtime';
import type { IAccessor, LifecycleFlags } from '@aurelia/runtime';
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export declare class AttributeNSAccessor implements IAccessor<string | null> {
    /**
     * The namespace associated with this accessor
     */
    readonly ns: string;
    static forNs(ns: string): AttributeNSAccessor;
    type: AccessorType;
    constructor(
    /**
     * The namespace associated with this accessor
     */
    ns: string);
    getValue(obj: HTMLElement, propertyKey: string): string | null;
    setValue(newValue: string | null, f: LifecycleFlags, obj: HTMLElement, key: string): void;
}
//# sourceMappingURL=attribute-ns-accessor.d.ts.map