import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, LifecycleState } from '../lifecycle';
import { AccessorOrObserver, BindingFlags, IScope } from '../observation';
import { ForOfStatement, IsBindingBehavior } from './ast';
import { BindingMode } from './binding-mode';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';
export interface IBinding extends IBindScope {
    readonly locator: IServiceLocator;
    readonly $scope: IScope;
}
export declare type IBindingTarget = any;
export interface Binding extends IConnectableBinding {
}
export declare class Binding implements IPartialConnectableBinding {
    sourceExpression: IsBindingBehavior | ForOfStatement;
    target: IBindingTarget;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: LifecycleState;
    $scope: IScope;
    targetObserver: AccessorOrObserver;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: IBindingTarget, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: any, flags: BindingFlags): void;
    updateSource(value: any, flags: BindingFlags): void;
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
}
//# sourceMappingURL=binding.d.ts.map