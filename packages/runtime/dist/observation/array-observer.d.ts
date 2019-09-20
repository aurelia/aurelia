import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IndexMap, IObservedArray } from '../observation';
import { CollectionLengthObserver } from './collection-length-observer';
export declare function enableArrayObservation(): void;
export declare function disableArrayObservation(): void;
export interface ArrayObserver extends ICollectionObserver<CollectionKind.array> {
}
export declare class ArrayObserver {
    inBatch: boolean;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray);
    notify(): void;
    getLengthObserver(): CollectionLengthObserver;
    flushBatch(flags: LifecycleFlags): void;
}
export declare function getArrayObserver(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray): ArrayObserver;
/**
 * Applies offsets to the non-negative indices in the IndexMap
 * based on added and deleted items relative to those indices.
 *
 * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
 * used for sorting/reordering items if needed
 */
export declare function applyMutationsToIndices(indexMap: IndexMap): void;
/**
 * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
 * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
 */
export declare function synchronizeIndices<T>(items: T[], indexMap: IndexMap): void;
//# sourceMappingURL=array-observer.d.ts.map