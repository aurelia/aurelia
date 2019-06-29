import { IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IAccessor, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding } from './connectable';
export interface CallBinding extends IConnectableBinding {
}
export declare class CallBinding {
    $state: State;
    $scope?: IScope;
    part?: string;
    locator: IServiceLocator;
    sourceExpression: IsBindingBehavior;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: object, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: object): unknown;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call-binding.d.ts.map