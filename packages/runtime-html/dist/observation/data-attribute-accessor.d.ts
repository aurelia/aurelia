import { IAccessor, LifecycleFlags, IScheduler, ITask } from '@aurelia/runtime';
/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
export declare class DataAttributeAccessor implements IAccessor<string | null> {
    readonly scheduler: IScheduler;
    readonly obj: HTMLElement;
    readonly propertyKey: string;
    currentValue: string | null;
    oldValue: string | null;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, obj: HTMLElement, propertyKey: string);
    getValue(): string | null;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=data-attribute-accessor.d.ts.map