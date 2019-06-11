import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedSet } from '../observation';
import { CollectionSizeObserver } from './collection-size-observer';
export declare function enableSetObservation(): void;
export declare function disableSetObservation(): void;
export interface SetObserver extends ICollectionObserver<CollectionKind.set> {
}
export declare class SetObserver {
    inBatch: boolean;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, observedSet: IObservedSet);
    notify(): void;
    getLengthObserver(): CollectionSizeObserver;
    flushBatch(flags: LifecycleFlags): void;
}
export declare function getSetObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observedSet: IObservedSet): SetObserver;
//# sourceMappingURL=set-observer.d.ts.map