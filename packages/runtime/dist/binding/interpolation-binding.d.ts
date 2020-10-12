import { IServiceLocator } from '@aurelia/kernel';
import { IScheduler, ITask } from '@aurelia/scheduler';
import { BindingMode, LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { IBindingTargetAccessor } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { Interpolation, IsExpression } from './ast';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
import type { Scope } from '../observation/binding-context';
export declare class MultiInterpolationBinding implements IBinding {
    observerLocator: IObserverLocator;
    interpolation: Interpolation;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    locator: IServiceLocator;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    parts: InterpolationBinding[];
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: object, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface InterpolationBinding extends IConnectableBinding {
}
export declare class InterpolationBinding implements IPartialConnectableBinding {
    sourceExpression: IsExpression;
    interpolation: Interpolation;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    isFirst: boolean;
    interceptor: this;
    id: number;
    $scope?: Scope;
    $hostScope: Scope | null;
    $scheduler: IScheduler;
    task: ITask | null;
    isBound: boolean;
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IsExpression, interpolation: Interpolation, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map