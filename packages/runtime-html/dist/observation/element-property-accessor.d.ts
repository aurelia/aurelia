import { IIndexable } from '@aurelia/kernel';
import { IAccessor, LifecycleFlags, IScheduler, ITask } from '@aurelia/runtime';
/**
 * Property accessor for HTML Elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see DataAttributeAccessor
 */
export declare class ElementPropertyAccessor implements IAccessor<unknown> {
    readonly scheduler: IScheduler;
    readonly obj: Node & IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, obj: Node & IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=element-property-accessor.d.ts.map