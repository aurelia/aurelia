import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IPropertyObserver, ISubscriber } from '../observation';
export interface SelfObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SelfObserver {
    readonly lifecycle: ILifecycle;
    readonly obj: IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    inBatch: boolean;
    observing: boolean;
    private readonly callback?;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: object, propertyName: string, cbName: string);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    private createGetterSetter;
}
//# sourceMappingURL=self-observer.d.ts.map