import { IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IBinding } from '../lifecycle';
import { IAccessor, IBindingContext, IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding } from './connectable';
export interface Call extends IConnectableBinding {
}
export declare class Call {
    $nextBinding: IBinding;
    $prevBinding: IBinding;
    $state: State;
    $scope: IScope;
    locator: IServiceLocator;
    sourceExpression: IsBindingBehavior;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: IObservable | IBindingContext, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call.d.ts.map