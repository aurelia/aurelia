import { AccessorType, LifecycleFlags } from '@aurelia/runtime';
import type { IIndexable } from '@aurelia/kernel';
import type { InterceptorFunc, IPropertyObserver, ISubscriber } from '@aurelia/runtime';
import type { IController } from '../templating/controller';
export interface BindableObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class BindableObserver {
    readonly obj: IIndexable;
    readonly propertyKey: string;
    private readonly $set;
    readonly $controller: IController;
    currentValue: unknown;
    oldValue: unknown;
    inBatch: boolean;
    observing: boolean;
    type: AccessorType;
    private readonly lifecycle;
    private readonly callback?;
    private readonly propertyChangedCallback?;
    private readonly hasPropertyChangedCallback;
    private readonly shouldInterceptSet;
    constructor(obj: IIndexable, propertyKey: string, cbName: string, $set: InterceptorFunc, $controller: IController);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    private createGetterSetter;
}
//# sourceMappingURL=bindable-observer.d.ts.map