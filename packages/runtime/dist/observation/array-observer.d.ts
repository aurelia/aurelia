import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedArray, LifecycleFlags } from '../observation';
export declare function enableArrayObservation(): void;
export declare function disableArrayObservation(): void;
export interface ArrayObserver extends ICollectionObserver<CollectionKind.array> {
}
export declare class ArrayObserver implements ArrayObserver {
    resetIndexMap: () => void;
    collection: IObservedArray;
    readonly flags: LifecycleFlags;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray);
}
export declare function getArrayObserver(flags: LifecycleFlags, lifecycle: ILifecycle, array: IObservedArray): ArrayObserver;
//# sourceMappingURL=array-observer.d.ts.map