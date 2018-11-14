import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IBindingTargetAccessor, IScope, LifecycleFlags } from '../observation';
import { IExpression, Interpolation } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { BindingMode } from './binding-mode';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';
export declare class MultiInterpolationBinding implements IBinding {
    observerLocator: IObserverLocator;
    interpolation: Interpolation;
    target: IBindingTarget;
    targetProperty: string;
    mode: BindingMode;
    locator: IServiceLocator;
    $nextBind: IBindScope;
    $prevBind: IBindScope;
    $state: State;
    $scope: IScope;
    parts: InterpolationBinding[];
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: IBindingTarget, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface InterpolationBinding extends IConnectableBinding {
}
export declare class InterpolationBinding implements IPartialConnectableBinding {
    sourceExpression: IExpression;
    interpolation: Interpolation;
    target: IBindingTarget;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    isFirst: boolean;
    $scope: IScope;
    $state: State;
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IExpression, interpolation: Interpolation, target: IBindingTarget, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: any, flags: LifecycleFlags): void;
    handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map