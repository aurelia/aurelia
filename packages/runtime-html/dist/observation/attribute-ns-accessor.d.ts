import { IAccessor, LifecycleFlags, IScheduler, ITask, INode } from '@aurelia/runtime';
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export declare class AttributeNSAccessor implements IAccessor<string | null> {
    readonly scheduler: IScheduler;
    readonly propertyKey: string;
    readonly namespace: string;
    readonly obj: HTMLElement;
    currentValue: string | null;
    oldValue: string | null;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, obj: INode, propertyKey: string, namespace: string);
    getValue(): string | null;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=attribute-ns-accessor.d.ts.map