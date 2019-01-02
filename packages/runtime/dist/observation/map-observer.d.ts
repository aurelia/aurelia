import { ILifecycle } from '../lifecycle';
import { CollectionKind, ICollectionObserver, IObservedMap } from '../observation';
export declare function enableMapObservation(): void;
export declare function disableMapObservation(): void;
export interface MapObserver extends ICollectionObserver<CollectionKind.map> {
}
export declare class MapObserver implements MapObserver {
    resetIndexMap: () => void;
    lifecycle: ILifecycle;
    collection: IObservedMap;
    constructor(lifecycle: ILifecycle, map: IObservedMap);
}
export declare function getMapObserver(lifecycle: ILifecycle, map: IObservedMap): MapObserver;
//# sourceMappingURL=map-observer.d.ts.map