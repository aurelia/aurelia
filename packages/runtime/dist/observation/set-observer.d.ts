import { ITask } from '@aurelia/kernel';
import { CollectionKind, ICollectionObserver, IObservedSet, ICollectionIndexObserver, AccessorType, ILifecycle, LifecycleFlags } from '../observation';
import { CollectionSizeObserver } from './collection-size-observer';
export declare function enableSetObservation(): void;
export declare function disableSetObservation(): void;
export interface SetObserver extends ICollectionObserver<CollectionKind.set> {
}
export declare class SetObserver {
    inBatch: boolean;
    type: AccessorType;
    task: ITask | null;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, observedSet: IObservedSet);
    notify(): void;
    getLengthObserver(): CollectionSizeObserver;
    getIndexObserver(index: number): ICollectionIndexObserver;
    flushBatch(flags: LifecycleFlags): void;
}
export declare function getSetObserver(flags: LifecycleFlags, lifecycle: ILifecycle, observedSet: IObservedSet): SetObserver;
//# sourceMappingURL=set-observer.d.ts.map