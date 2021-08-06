import { LifecycleFlags, AccessorType, IObserver } from '../observation.js';
import type { ISubscriber, ICollectionSubscriber, ISubscriberCollection, IConnectable } from '../observation.js';
import type { IConnectableBinding } from '../binding/connectable.js';
import type { IObserverLocator } from './observer-locator.js';
import type { FlushQueue, IFlushable, IWithFlushQueue } from './flush-queue.js';
export interface ComputedObserver extends IConnectableBinding, ISubscriberCollection {
}
export declare class ComputedObserver implements IObserver, IConnectableBinding, ISubscriber, ICollectionSubscriber, ISubscriberCollection, IWithFlushQueue, IFlushable {
    static create(obj: object, key: PropertyKey, descriptor: PropertyDescriptor, observerLocator: IObserverLocator, useProxy: boolean): ComputedObserver;
    interceptor: this;
    type: AccessorType;
    readonly queue: FlushQueue;
    readonly get: (watcher: IConnectable) => unknown;
    readonly set: undefined | ((v: unknown) => void);
    /**
     * A semi-private property used by connectable mixin
     */
    readonly oL: IObserverLocator;
    constructor(obj: object, get: (watcher: IConnectable) => unknown, set: undefined | ((v: unknown) => void), useProxy: boolean, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(v: unknown, _flags: LifecycleFlags): void;
    handleChange(): void;
    handleCollectionChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    flush(): void;
    private run;
    private compute;
}
//# sourceMappingURL=computed-observer.d.ts.map