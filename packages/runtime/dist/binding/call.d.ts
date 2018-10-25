import { IIndexable, IServiceLocator, Primitive } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindScope, LifecycleState } from '../lifecycle';
import { BindingFlags, IAccessor, IScope } from '../observation';
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
    $state: LifecycleState;
    $scope: IScope;
    targetObserver: IAccessor;
    constructor(sourceExpression: IsBindingBehavior, target: INode, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator);
    callSource(args: IIndexable): Primitive | IIndexable;
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
    observeProperty(obj: StrictAny, propertyName: StrictAny): void;
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
}
//# sourceMappingURL=call.d.ts.map