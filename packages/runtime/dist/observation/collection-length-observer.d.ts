import { LifecycleFlags } from '../flags';
import { ISubscriberCollection, AccessorType } from '../observation';
import { ITask } from '@aurelia/scheduler';
export interface CollectionLengthObserver extends ISubscriberCollection {
}
export declare class CollectionLengthObserver {
    obj: unknown[];
    currentValue: number;
    type: AccessorType;
    task: ITask | null;
    constructor(obj: unknown[]);
    getValue(): number;
    setValue(newValue: number, flags: LifecycleFlags): void;
}
//# sourceMappingURL=collection-length-observer.d.ts.map