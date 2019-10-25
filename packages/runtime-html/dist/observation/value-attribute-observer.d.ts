import { IIndexable } from '@aurelia/kernel';
import { IAccessor, ISubscriber, ISubscriberCollection, LifecycleFlags, IScheduler, ITask } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
export interface ValueAttributeObserver extends ISubscriberCollection {
}
/**
 * Observer for non-radio, non-checkbox input.
 */
export declare class ValueAttributeObserver implements IAccessor<unknown> {
    readonly scheduler: IScheduler;
    readonly handler: IEventSubscriber;
    readonly obj: Node & IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, handler: IEventSubscriber, obj: Node & IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map