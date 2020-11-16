import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import type { EventSubscriber } from './event-delegator.js';
import type { INode } from '../dom.js';
import type { IIndexable } from '@aurelia/kernel';
import type { ISubscriberCollection, ISubscriber, IObserver } from '@aurelia/runtime';
export interface ValueAttributeObserver extends ISubscriberCollection {
}
/**
 * Observer for non-radio, non-checkbox input.
 */
export declare class ValueAttributeObserver implements IObserver {
    readonly propertyKey: PropertyKey;
    readonly handler: EventSubscriber;
    readonly obj: INode & IIndexable;
    currentValue: unknown;
    oldValue: unknown;
    hasChanges: boolean;
    type: AccessorType;
    constructor(obj: INode, propertyKey: PropertyKey, handler: EventSubscriber);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map