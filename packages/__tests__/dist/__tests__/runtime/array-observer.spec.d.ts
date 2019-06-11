import { IndexMap, LifecycleFlags as LF, ICollectionSubscriber } from '@aurelia/runtime';
export declare class SynchronizingCollectionSubscriber implements ICollectionSubscriber {
    readonly oldArr: unknown[];
    readonly newArr: unknown[];
    constructor(oldArr: unknown[], newArr: unknown[]);
    handleCollectionChange(indexMap: IndexMap, flags: LF): void;
}
//# sourceMappingURL=array-observer.spec.d.ts.map