import { AccessorType } from '../observation.js';
import { CollectionSizeObserver } from './collection-length-observer.js';
import type { CollectionKind, ICollectionObserver, ICollectionSubscriberCollection } from '../observation.js';
export declare function enableMapObservation(): void;
export declare function disableMapObservation(): void;
export interface MapObserver extends ICollectionObserver<CollectionKind.map>, ICollectionSubscriberCollection {
}
export declare class MapObserver {
    type: AccessorType;
    private lenObs?;
    constructor(map: Map<unknown, unknown>);
    notify(): void;
    getLengthObserver(): CollectionSizeObserver;
}
export declare function getMapObserver(map: Map<unknown, unknown>): MapObserver;
//# sourceMappingURL=map-observer.d.ts.map