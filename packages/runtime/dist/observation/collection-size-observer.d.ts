import { LifecycleFlags } from '../flags';
import { ISubscriberCollection } from '../observation';
export interface CollectionSizeObserver extends ISubscriberCollection {
}
export declare class CollectionSizeObserver {
    currentValue: number;
    obj: Set<unknown> | Map<unknown, unknown>;
    constructor(obj: Set<unknown> | Map<unknown, unknown>);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
}
//# sourceMappingURL=collection-size-observer.d.ts.map