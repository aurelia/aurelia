import { IAccessor, ILifecycle, LifecycleFlags, Priority } from '@aurelia/runtime';
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export declare class AttributeNSAccessor implements IAccessor<string | null> {
    readonly lifecycle: ILifecycle;
    readonly obj: HTMLElement;
    readonly propertyKey: string;
    currentValue: string | null;
    oldValue: string | null;
    readonly persistentFlags: LifecycleFlags;
    readonly namespace: string;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: HTMLElement, propertyKey: string, namespace: string);
    getValue(): string | null;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute-ns-accessor.d.ts.map