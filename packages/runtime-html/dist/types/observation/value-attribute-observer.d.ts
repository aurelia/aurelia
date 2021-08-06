import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import type { EventSubscriber } from './event-delegator.js';
import type { INode } from '../dom.js';
import type { ISubscriberCollection, ISubscriber, IObserver, IFlushable, IWithFlushQueue, FlushQueue } from '@aurelia/runtime';
export interface ValueAttributeObserver extends ISubscriberCollection {
}
/**
 * Observer for non-radio, non-checkbox input.
 */
export declare class ValueAttributeObserver implements IObserver, IWithFlushQueue, IFlushable {
    readonly handler: EventSubscriber;
    type: AccessorType;
    readonly queue: FlushQueue;
    constructor(obj: INode, key: PropertyKey, handler: EventSubscriber);
    getValue(): unknown;
    setValue(newValue: string | null, flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    flush(): void;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map