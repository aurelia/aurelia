import { IServiceLocator } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { AccessorOrObserver, IObservable, IScope, LifecycleFlags } from '../observation';
import { ForOfStatement, IsBindingBehavior } from './ast';
import { BindingMode } from './binding-mode';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';
export interface IBinding extends IBindScope {
    readonly locator: IServiceLocator;
    readonly $scope: IScope;
}
export declare type IBindingTarget = INode | IObservable;
export interface Binding extends IConnectableBinding {
}
export declare class Binding implements IPartialConnectableBinding {
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $lifecycle: ILifecycle;
    $nextConnect: IConnectableBinding;
    $nextPatch: IConnectableBinding;
    $scope: IScope;
    locator: IServiceLocator;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    sourceExpression: IsBindingBehavior | ForOfStatement;
    target: IBindingTarget;
    targetProperty: string;
    targetObserver: AccessorOrObserver;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: IBindingTarget, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    connect(flags: LifecycleFlags): void;
    patch(flags: LifecycleFlags): void;
}
//# sourceMappingURL=binding.d.ts.map