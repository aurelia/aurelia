import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedArray } from '../observation';
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
//# sourceMappingURL=array-observer.d.ts.map