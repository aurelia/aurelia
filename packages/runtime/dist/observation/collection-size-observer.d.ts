import { AccessorType } from '../observation.js';
import type { ISubscriberCollection } from '../observation.js';
export interface CollectionSizeObserver extends ISubscriberCollection {
}
export declare class CollectionSizeObserver {
    obj: Set<unknown> | Map<unknown, unknown>;
    currentValue: number;
    type: AccessorType;
    constructor(obj: Set<unknown> | Map<unknown, unknown>);
    getValue(): number;
    setValue(): void;
    notify(): void;
}
//# sourceMappingURL=collection-size-observer.d.ts.map