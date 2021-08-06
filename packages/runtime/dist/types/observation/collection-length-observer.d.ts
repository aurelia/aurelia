import { AccessorType, CollectionKind, LifecycleFlags } from '../observation.js';
import type { ICollectionObserver, IndexMap, ISubscriberCollection, ICollectionSubscriber } from '../observation.js';
import type { FlushQueue, IFlushable, IWithFlushQueue } from './flush-queue.js';
export interface CollectionLengthObserver extends ISubscriberCollection {
}
export declare class CollectionLengthObserver implements IWithFlushQueue, ICollectionSubscriber, IFlushable {
    readonly owner: ICollectionObserver<CollectionKind.array>;
    readonly type: AccessorType;
    readonly queue: FlushQueue;
    constructor(owner: ICollectionObserver<CollectionKind.array>);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
    handleCollectionChange(_: IndexMap, flags: LifecycleFlags): void;
    flush(): void;
}
export interface CollectionSizeObserver extends ISubscriberCollection {
}
export declare class CollectionSizeObserver implements ICollectionSubscriber, IFlushable {
    readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>;
    readonly type: AccessorType;
    readonly queue: FlushQueue;
    constructor(owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>);
    getValue(): number;
    setValue(): void;
    handleCollectionChange(_: IndexMap, flags: LifecycleFlags): void;
    flush(): void;
}
//# sourceMappingURL=collection-length-observer.d.ts.map