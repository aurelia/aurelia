import { LifecycleFlags } from '../flags';
import { ISubscriberCollection } from '../observation';
export interface CollectionLengthObserver extends ISubscriberCollection {
}
export declare class CollectionLengthObserver {
    obj: unknown[];
    currentValue: number;
    constructor(obj: unknown[]);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
}
//# sourceMappingURL=collection-length-observer.d.ts.map