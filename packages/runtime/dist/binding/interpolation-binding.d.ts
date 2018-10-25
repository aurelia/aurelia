import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, LifecycleState } from '../lifecycle';
import { BindingFlags, IBindingTargetAccessor, IScope } from '../observation';
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
    $state: LifecycleState;
    $scope: IScope;
    parts: InterpolationBinding[];
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: IBindingTarget, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
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
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IExpression, interpolation: Interpolation, target: IBindingTarget, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: any, flags: BindingFlags): void;
    handleChange(newValue: any, previousValue: any, flags: BindingFlags): void;
    $bind(flags: BindingFlags, scope: IScope): void;
    $unbind(flags: BindingFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map