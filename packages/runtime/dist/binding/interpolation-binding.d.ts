import { BindingMode, LifecycleFlags } from '../observation.js';
import type { IServiceLocator, ITask, TaskQueue } from '@aurelia/kernel';
import type { Interpolation, IsExpression } from './ast.js';
import type { IConnectableBinding } from './connectable.js';
import type { IObserverLocator } from '../observation/observer-locator.js';
import type { ICollectionSubscriber, IndexMap, IBinding } from '../observation.js';
import type { Scope } from '../observation/binding-context.js';
export declare class InterpolationBinding implements IBinding {
    observerLocator: IObserverLocator;
    interpolation: Interpolation;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    locator: IServiceLocator;
    private readonly taskQueue;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    partBindings: ContentBinding[];
    private readonly targetObserver;
    private task;
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: object, targetProperty: string, mode: BindingMode, locator: IServiceLocator, taskQueue: TaskQueue);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface ContentBinding extends IConnectableBinding {
}
export declare class ContentBinding implements ContentBinding, ICollectionSubscriber {
    readonly sourceExpression: IsExpression;
    readonly target: object;
    readonly targetProperty: string;
    readonly locator: IServiceLocator;
    readonly observerLocator: IObserverLocator;
    readonly owner: InterpolationBinding;
    interceptor: this;
    readonly mode: BindingMode;
    value: unknown;
    id: number;
    $scope?: Scope;
    $hostScope: Scope | null;
    task: ITask | null;
    isBound: boolean;
    private arrayObserver?;
    constructor(sourceExpression: IsExpression, target: object, targetProperty: string, locator: IServiceLocator, observerLocator: IObserverLocator, owner: InterpolationBinding);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
    private observeArray;
    private unobserveArray;
}
//# sourceMappingURL=interpolation-binding.d.ts.map