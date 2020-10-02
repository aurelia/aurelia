import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedSet, ICollectionIndexObserver, AccessorType } from '../observation';
import { CollectionSizeObserver } from './collection-size-observer';
import { ITask } from '@aurelia/scheduler';
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