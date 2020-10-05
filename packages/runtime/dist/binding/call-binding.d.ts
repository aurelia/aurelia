import { IServiceLocator } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IAccessor, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IsBindingBehavior } from './ast';
import { IConnectableBinding } from './connectable';
export interface CallBinding extends IConnectableBinding {
}
export declare class CallBinding {
    sourceExpression: IsBindingBehavior;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: IScope;
    $hostScope: IScope | null;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: object, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    dispose(): void;
}
//# sourceMappingURL=call-binding.d.ts.map