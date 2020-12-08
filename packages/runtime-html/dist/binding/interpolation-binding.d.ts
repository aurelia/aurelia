import { BindingMode, LifecycleFlags } from '@aurelia/runtime';
import type { IServiceLocator, ITask, TaskQueue } from '@aurelia/kernel';
import type { ICollectionSubscriber, IndexMap, Interpolation, IConnectableBinding, IObserverLocator, IsExpression, IBinding, Scope } from '@aurelia/runtime';
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
    $hostScope: Scope | null;
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
    $scope?: Scope;
    $hostScope: Scope | null;
    task: ITask | null;
    isBound: boolean;
    constructor(sourceExpression: IsExpression, target: object, targetProperty: string, locator: IServiceLocator, observerLocator: IObserverLocator, owner: InterpolationBinding);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map