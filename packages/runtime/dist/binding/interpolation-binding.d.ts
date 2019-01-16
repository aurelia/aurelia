import { IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IBindingTargetAccessor, IObservable, IScope, LifecycleFlags } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IExpression, Interpolation } from './ast';
import { IBinding } from './binding';
import { BindingMode } from './binding-mode';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
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
    target: IObservable;
    targetProperty: string;
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: IObservable, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
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
    target: IObservable;
    targetProperty: string;
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IExpression, interpolation: Interpolation, target: IObservable, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map