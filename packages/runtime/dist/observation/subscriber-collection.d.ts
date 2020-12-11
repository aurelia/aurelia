import { ISubscriberRecord, LifecycleFlags as LF } from '../observation.js';
import type { ICollectionSubscriber, ICollectionSubscriberCollection, IndexMap, ISubscriber, ISubscriberCollection } from '../observation.js';
declare type IAnySubscriber = ISubscriber | ICollectionSubscriber;
export declare function subscriberCollection(): ClassDecorator;
export declare function collectionSubscriberCollection(): ClassDecorator;
export declare class SubscriberRecord<T extends IAnySubscriber> implements ISubscriberRecord<T> {
    private _sFlags;
    private _s0?;
    private _s1?;
    private _s2?;
    private _sRest?;
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
export {};
//# sourceMappingURL=subscriber-collection.d.ts.map