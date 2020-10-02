import { LifecycleFlags } from '../flags';
import { ISubscriberCollection, AccessorType } from '../observation';
import { ITask } from '@aurelia/scheduler';
export interface CollectionSizeObserver extends ISubscriberCollection {
}
export declare class CollectionSizeObserver {
    obj: Set<unknown> | Map<unknown, unknown>;
    currentValue: number;
    type: AccessorType;
    task: ITask | null;
    constructor(obj: Set<unknown> | Map<unknown, unknown>);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
}
//# sourceMappingURL=collection-size-observer.d.ts.map