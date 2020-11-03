import { IAccessor, LifecycleFlags, AccessorType } from '@aurelia/runtime';
import { INode } from '../dom';
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export declare class AttributeNSAccessor implements IAccessor<string | null> {
    readonly propertyKey: string;
    readonly namespace: string;
    readonly obj: HTMLElement;
    currentValue: string | null;
    oldValue: string | null;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    type: AccessorType;
    constructor(flags: LifecycleFlags, obj: INode, propertyKey: string, namespace: string);
    getValue(): string | null;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute-ns-accessor.d.ts.map