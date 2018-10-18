import { IChangeSet } from './change-set';
import { CollectionKind, ICollectionObserver, IObservedSet } from './observation';
export declare const nativeAdd: (value: any) => Set<any>;
export declare const nativeClear: () => void;
export declare const nativeDelete: (value: any) => boolean;
export declare function enableSetObservation(): void;
export declare function disableSetObservation(): void;
export interface SetObserver extends ICollectionObserver<CollectionKind.set> {
}
export declare class SetObserver implements SetObserver {
    resetIndexMap: () => void;
    changeSet: IChangeSet;
    collection: IObservedSet;
    constructor(changeSet: IChangeSet, set: IObservedSet);
}
export declare function getSetObserver(changeSet: IChangeSet, set: IObservedSet): SetObserver;
//# sourceMappingURL=set-observer.d.ts.map