import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IBindingTargetAccessor, IScope, LifecycleFlags } from '../observation';
import { IExpression, Interpolation } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { BindingMode } from './binding-mode';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';
export declare class MultiInterpolationBinding implements IBinding {
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    interpolation: Interpolation;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    mode: BindingMode;
    parts: InterpolationBinding[];
    target: IBindingTarget;
    targetProperty: string;
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: IBindingTarget, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface InterpolationBinding extends IConnectableBinding {
}
export declare class InterpolationBinding implements IPartialConnectableBinding {
    $scope: IScope;
    $state: State;
    interpolation: Interpolation;
    isFirst: boolean;
    locator: IServiceLocator;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    sourceExpression: IExpression;
    target: IBindingTarget;
    targetProperty: string;
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IExpression, interpolation: Interpolation, target: IBindingTarget, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map