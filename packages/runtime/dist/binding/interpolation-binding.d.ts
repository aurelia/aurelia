import { IServiceLocator } from '@aurelia/kernel';
import { IExpression, IInterpolationExpression } from '../ast';
import { BindingMode, LifecycleFlags, State } from '../flags';
import { IBinding } from '../lifecycle';
import { IBindingTargetAccessor, IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { IConnectableBinding, IPartialConnectableBinding } from './connectable';
export declare class MultiInterpolationBinding implements IBinding {
    $state: State;
    $scope?: IScope;
    part?: string;
    interpolation: IInterpolationExpression;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    mode: BindingMode;
    parts: InterpolationBinding[];
    target: IObservable;
    targetProperty: string;
    constructor(observerLocator: IObserverLocator, interpolation: IInterpolationExpression, target: object, targetProperty: string, mode: BindingMode, locator: IServiceLocator);
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface InterpolationBinding extends IConnectableBinding {
}
export declare class InterpolationBinding implements IPartialConnectableBinding {
    id: number;
    $scope?: IScope;
    part?: string;
    $state: State;
    interpolation: IInterpolationExpression;
    isFirst: boolean;
    locator: IServiceLocator;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    sourceExpression: IExpression;
    target: IObservable;
    targetProperty: string;
    targetObserver: IBindingTargetAccessor;
    constructor(sourceExpression: IExpression, interpolation: IInterpolationExpression, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, isFirst: boolean);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map