import { CollectionKind, IChangeSet, ICollectionObserver, IObservedMap } from '../observation';
export declare const nativeSet: (key: any, value: any) => Map<any, any>;
export declare const nativeClear: () => void;
export declare const nativeDelete: (key: any) => boolean;
export declare function enableMapObservation(): void;
export declare function disableMapObservation(): void;
export interface MapObserver extends ICollectionObserver<CollectionKind.map> {
}
export declare class MapObserver implements MapObserver {
    resetIndexMap: () => void;
    changeSet: IChangeSet;
    collection: IObservedMap;
    constructor(changeSet: IChangeSet, map: IObservedMap);
}
export declare function getMapObserver(changeSet: IChangeSet, map: IObservedMap): MapObserver;
//# sourceMappingURL=map-observer.d.ts.map