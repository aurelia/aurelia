import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedSet } from '../observation';
export declare function enableSetObservation(): void;
export declare function disableSetObservation(): void;
export interface SetObserver extends ICollectionObserver<CollectionKind.set> {
}
export declare class SetObserver implements SetObserver {
    resetIndexMap: () => void;
    collection: IObservedSet;
    constructor(lifecycle: ILifecycle, observedSet: IObservedSet);
}
export declare function getSetObserver(lifecycle: ILifecycle, observedSet: IObservedSet): SetObserver;
//# sourceMappingURL=set-observer.d.ts.map