import { IServiceLocator } from '@aurelia/kernel';
import { IExpression, IInterpolationExpression } from '../ast';
import { BindingMode, LifecycleFlags, State } from '../flags';
import { IBinding } from '../lifecycle';
import { IBindingTargetAccessor, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export declare class MultiInterpolationBinding implements IBinding {
    observerLocator: IObserverLocator;
    interpolation: IInterpolationExpression;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    locator: IServiceLocator;
    interceptor: this;
    $state: State;
    $scope?: IScope;
    part?: string;
    parts: InterpolationBinding[];
    constructor(observerLocator: IObserverLocator, interpolation: IInterpolationExpression, target: object, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface InterpolationBinding extends IConnectableBinding {
}
export declare class InterpolationBinding implements IPartialConnectableBinding {
    sourceExpression: IExpression;
    interpolation: IInterpolationExpression;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    isFirst: boolean;
    interceptor: this;
    id: number;
    $scope?: IScope;
    part?: string;
    $state: State;
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IExpression, interpolation: IInterpolationExpression, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map