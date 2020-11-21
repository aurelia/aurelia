import { BindingMode, LifecycleFlags } from '../observation.js';
import type { IServiceLocator, TaskQueue } from '@aurelia/kernel';
import type { AccessorOrObserver } from '../observation.js';
import type { IObserverLocator } from '../observation/observer-locator.js';
import type { ForOfStatement, IsBindingBehavior } from './ast.js';
import type { IConnectableBinding, IPartialConnectableBinding } from './connectable.js';
import type { Scope } from '../observation/binding-context.js';
export interface PropertyBinding extends IConnectableBinding {
}
export declare class PropertyBinding implements IPartialConnectableBinding {
    sourceExpression: IsBindingBehavior | ForOfStatement;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    observerLocator: IObserverLocator;
    locator: IServiceLocator;
    private readonly taskQueue;
    interceptor: this;
    id: number;
    isBound: boolean;
    $scope?: Scope;
    $hostScope: Scope | null;
    targetObserver?: AccessorOrObserver;
    persistentFlags: LifecycleFlags;
    private task;
    constructor(sourceExpression: IsBindingBehavior | ForOfStatement, target: object, targetProperty: string, mode: BindingMode, observerLocator: IObserverLocator, locator: IServiceLocator, taskQueue: TaskQueue);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=property-binding.d.ts.map