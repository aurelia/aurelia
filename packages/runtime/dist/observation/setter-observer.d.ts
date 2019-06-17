import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IPropertyObserver, ISubscriber } from '../observation';
export interface SetterObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SetterObserver {
    readonly lifecycle: ILifecycle;
    readonly obj: IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    inBatch: boolean;
    observing: boolean;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: object, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushBatch(flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
}
//# sourceMappingURL=setter-observer.d.ts.map