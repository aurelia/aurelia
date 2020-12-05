import { AccessorType, CollectionKind, LifecycleFlags } from '../observation.js';
import type { ICollectionObserver, IndexMap, ISubscriberCollection } from '../observation.js';
export interface CollectionLengthObserver extends ISubscriberCollection {
}
export declare class CollectionLengthObserver {
    readonly owner: ICollectionObserver<CollectionKind.array>;
    value: number;
    readonly type: AccessorType;
    readonly obj: unknown[];
    constructor(owner: ICollectionObserver<CollectionKind.array>);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
    handleCollectionChange(_: IndexMap, flags: LifecycleFlags): void;
}
export interface CollectionSizeObserver extends ISubscriberCollection {
}
export declare class CollectionSizeObserver {
    readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>;
    value: number;
    readonly type: AccessorType;
    readonly obj: Set<unknown> | Map<unknown, unknown>;
    constructor(owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>);
    getValue(): number;
    setValue(): void;
    handleCollectionChange(_: IndexMap, flags: LifecycleFlags): void;
}
//# sourceMappingURL=collection-length-observer.d.ts.map