import { IIndexable } from '@aurelia/kernel';
import { IAccessor, ILifecycle, ISubscriber, ISubscriberCollection, LifecycleFlags, Priority } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
export interface ValueAttributeObserver extends ISubscriberCollection {
}
/**
 * Observer for non-radio, non-checkbox input.
 */
export declare class ValueAttributeObserver implements IAccessor<unknown> {
    readonly lifecycle: ILifecycle;
    readonly handler: IEventSubscriber;
    readonly obj: Node & IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    priority: Priority;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, handler: IEventSubscriber, obj: Node, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map