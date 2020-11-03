import { IIndexable } from '@aurelia/kernel';
import { IAccessor, ISubscriber, ISubscriberCollection, LifecycleFlags, AccessorType } from '@aurelia/runtime';
import { EventSubscriber } from './event-delegator';
export interface ValueAttributeObserver extends ISubscriberCollection {
}
/**
 * Observer for non-radio, non-checkbox input.
 */
export declare class ValueAttributeObserver implements IAccessor {
    readonly handler: EventSubscriber;
    readonly obj: Node & IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    type: AccessorType;
    constructor(flags: LifecycleFlags, handler: EventSubscriber, obj: Node & IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map