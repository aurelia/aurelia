import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IAccessor, IBindingContext, IObservable, IScope, LifecycleFlags } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IsBindingBehavior } from './ast';
import { IConnectableBinding } from './connectable';
export interface Call extends IConnectableBinding {
}
export declare class Call {
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    locator: IServiceLocator;
    sourceExpression: IsBindingBehavior;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: IObservable | IBindingContext, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call.d.ts.map