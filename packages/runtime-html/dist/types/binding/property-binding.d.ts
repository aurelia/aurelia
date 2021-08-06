import { BindingMode, LifecycleFlags } from '@aurelia/runtime';
import type { IServiceLocator, TaskQueue } from '@aurelia/kernel';
import type { AccessorOrObserver, ForOfStatement, IObserverLocator, IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings.js';
export interface PropertyBinding extends IAstBasedBinding {
}
export declare class PropertyBinding implements IAstBasedBinding {
    sourceExpression: IsBindingBehavior | ForOfStatement;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    locator: IServiceLocator;
    private readonly taskQueue;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    targetObserver?: AccessorOrObserver;
    persistentFlags: LifecycleFlags;
    private task;
    private targetSubscriber;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, taskQueue: TaskQueue);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=property-binding.d.ts.map