import { IIndexable, IServiceLocator, Primitive } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindScope, State } from '../lifecycle';
import { IAccessor, IScope, LifecycleFlags } from '../observation';
import { IsBindingBehavior, StrictAny } from './ast';
import { IConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';
export interface Call extends IConnectableBinding {
}
export declare class Call {
    sourceExpression: IsBindingBehavior;
    locator: IServiceLocator;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: INode, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: IIndexable): Primitive | IIndexable;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: StrictAny, previousValue: StrictAny, flags: LifecycleFlags): void;
}
//# sourceMappingURL=call.d.ts.map