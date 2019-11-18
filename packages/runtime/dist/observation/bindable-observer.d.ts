import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IPropertyObserver, ISubscriber } from '../observation';
import { InterceptorFunc } from '../templating/bindable';
export interface BindableObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class BindableObserver {
    readonly lifecycle: ILifecycle;
    readonly obj: IIndexable;
    readonly propertyKey: string;
    private readonly $set;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    inBatch: boolean;
    observing: boolean;
    private readonly callback?;
    private readonly propertyChangedCallback?;
    private readonly hasPropertyChangedCallback;
    private readonly shouldInterceptSet;
    constructor(lifecycle: ILifecycle, flags: LifecycleFlags, obj: IIndexable, propertyKey: string, cbName: string, $set: InterceptorFunc);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    private createGetterSetter;
}
//# sourceMappingURL=bindable-observer.d.ts.map