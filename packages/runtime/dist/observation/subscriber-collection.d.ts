import { ISubscriberRecord, LifecycleFlags as LF } from '../observation.js';
import type { ICollectionSubscriber, ICollectionSubscriberCollection, IndexMap, ISubscriber, ISubscriberCollection } from '../observation.js';
export declare type IAnySubscriber = ISubscriber | ICollectionSubscriber;
export declare function subscriberCollection(): ClassDecorator;
export declare function subscriberCollection(target: Function): void;
export declare class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
    /**
     * subscriber flags: bits indicating the existence status of the subscribers of this record
     */
    private _sf;
    private _s0?;
    private _s1?;
    private _s2?;
    /**
     * subscriber rest: When there's more than 3 subscribers, use an array to store the subscriber references
     */
    private _sr?;
    count: number;
    readonly owner: ISubscriberCollection | ICollectionSubscriberCollection;
    constructor(owner: ISubscriberCollection | ICollectionSubscriberCollection);
    add(subscriber: T): boolean;
    has(subscriber: T): boolean;
    any(): boolean;
    remove(subscriber: T): boolean;
    notify(val: unknown, oldVal: unknown, flags: LF): void;
    notifyCollection(indexMap: IndexMap, flags: LF): void;
}
//# sourceMappingURL=subscriber-collection.d.ts.map