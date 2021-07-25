import { LifecycleFlags, SetterObserver, AccessorType } from '@aurelia/runtime';
import type { INode } from '../dom.js';
import type { EventSubscriber } from './event-delegator.js';
import type { ValueAttributeObserver } from './value-attribute-observer.js';
import type { IndexMap, ISubscriber, ISubscriberCollection, IObserver, IObserverLocator, IFlushable, IWithFlushQueue, FlushQueue } from '@aurelia/runtime';
export interface IInputElement extends HTMLInputElement {
    model?: unknown;
    $observers?: {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
    matcher?: typeof defaultMatcher;
}
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface CheckedObserver extends ISubscriberCollection {
}
export declare class CheckedObserver implements IObserver, IFlushable, IWithFlushQueue {
    readonly handler: EventSubscriber;
    type: AccessorType;
    value: unknown;
    readonly obj: IInputElement;
    readonly queue: FlushQueue;
    constructor(obj: INode, _key: PropertyKey, handler: EventSubscriber, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    handleEvent(): void;
    start(): void;
    stop(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    flush(): void;
}
export {};
//# sourceMappingURL=checked-observer.d.ts.map