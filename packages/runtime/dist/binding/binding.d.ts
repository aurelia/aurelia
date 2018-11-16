import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { AccessorOrObserver, IScope, LifecycleFlags } from '../observation';
import { ForOfStatement, IsBindingBehavior, StrictAny } from './ast';
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
    $nextConnect: IConnectableBinding;
    $nextPatch: IConnectableBinding;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    $lifecycle: ILifecycle;
    targetObserver: AccessorOrObserver;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: IBindingTarget, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator);
    updateTarget(value: StrictAny, flags: LifecycleFlags): void;
    updateSource(value: StrictAny, flags: LifecycleFlags): void;
    handleChange(newValue: StrictAny, previousValue: StrictAny, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
    connect(flags: LifecycleFlags): void;
    patch(flags: LifecycleFlags): void;
}
//# sourceMappingURL=binding.d.ts.map