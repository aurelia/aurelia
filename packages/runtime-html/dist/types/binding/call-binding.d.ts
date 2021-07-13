import { LifecycleFlags } from '@aurelia/runtime';
import type { IServiceLocator } from '@aurelia/kernel';
import type { IAccessor, IConnectableBinding, IObserverLocator, IsBindingBehavior, Scope } from '@aurelia/runtime';
export interface CallBinding extends IConnectableBinding {
}
export declare class CallBinding {
    sourceExpression: IsBindingBehavior;
    readonly target: object;
    readonly targetProperty: string;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: object, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call-binding.d.ts.map