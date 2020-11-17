import { AccessorType, LifecycleFlags } from '../observation.js';
import type { ISubscriberCollection } from '../observation.js';
export interface CollectionLengthObserver extends ISubscriberCollection {
}
export declare class CollectionLengthObserver {
    obj: unknown[];
    currentValue: number;
    type: AccessorType;
    constructor(obj: unknown[]);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
}
//# sourceMappingURL=collection-length-observer.d.ts.map