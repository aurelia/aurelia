import { BindingMode, LifecycleFlags } from '@aurelia/runtime';
import type { IServiceLocator, ITask, TaskQueue } from '@aurelia/kernel';
import type { ICollectionSubscriber, IndexMap, Interpolation, IObserverLocator, IsExpression, IBinding, Scope } from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import type { IAstBasedBinding } from './interfaces-bindings';
export declare class InterpolationBinding implements IBinding {
    interpolation: Interpolation;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    locator: IServiceLocator;
    private readonly taskQueue;
    interceptor: this;
    isBound: boolean;
    $scope?: Scope;
    partBindings: InterpolationPartBinding[];
    private readonly targetObserver;
    private task;
    /**
     * A semi-private property used by connectable mixin
     */
    readonly oL: IObserverLocator;
    constructor(observerLocator: IObserverLocator, interpolation: Interpolation, target: object, targetProperty: string, mode: BindingMode, locator: IServiceLocator, taskQueue: TaskQueue);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface InterpolationPartBinding extends IAstBasedBinding {
}
export declare class InterpolationPartBinding implements IAstBasedBinding, ICollectionSubscriber {
    readonly sourceExpression: IsExpression;
    readonly target: object;
    readonly targetProperty: string;
    readonly locator: IServiceLocator;
    readonly owner: InterpolationBinding;
    interceptor: this;
    readonly mode: BindingMode;
    value: unknown;
    $scope?: Scope;
    task: ITask | null;
    isBound: boolean;
    /**
     * A semi-private property used by connectable mixin
     */
    readonly oL: IObserverLocator;
    constructor(sourceExpression: IsExpression, target: object, targetProperty: string, locator: IServiceLocator, observerLocator: IObserverLocator, owner: InterpolationBinding);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
}
export interface ContentBinding extends IAstBasedBinding {
}
/**
 * A binding for handling the element content interpolation
 */
export declare class ContentBinding implements IAstBasedBinding, ICollectionSubscriber {
    readonly sourceExpression: IsExpression;
    readonly target: Text;
    readonly locator: IServiceLocator;
    private readonly p;
    private readonly strict;
    interceptor: this;
    readonly mode: BindingMode;
    value: unknown;
    $scope?: Scope;
    task: ITask | null;
    isBound: boolean;
    /**
     * A semi-private property used by connectable mixin
     */
    readonly oL: IObserverLocator;
    constructor(sourceExpression: IsExpression, target: Text, locator: IServiceLocator, observerLocator: IObserverLocator, p: IPlatform, strict: boolean);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    handleCollectionChange(): void;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
    private queueUpdate;
}
//# sourceMappingURL=interpolation-binding.d.ts.map