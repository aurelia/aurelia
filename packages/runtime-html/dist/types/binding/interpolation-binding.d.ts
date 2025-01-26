import { type IServiceLocator } from '@aurelia/kernel';
import { IAstEvaluator } from '@aurelia/runtime';
import type { ITask, TaskQueue } from '@aurelia/platform';
import type { IAccessor, ICollectionSubscriber, IObserverLocator, IObserverLocatorBasedConnectable, ISubscriber, Scope } from '@aurelia/runtime';
import type { IBinding, BindingMode, IBindingController } from './interfaces-bindings';
import { type Interpolation, IsExpression } from '@aurelia/expression-parser';
export interface InterpolationBinding extends IObserverLocatorBasedConnectable, IAstEvaluator, IServiceLocator {
}
export declare class InterpolationBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    ast: Interpolation;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    strict: boolean;
    isBound: boolean;
    partBindings: InterpolationPartBinding[];
    constructor(controller: IBindingController, locator: IServiceLocator, observerLocator: IObserverLocator, taskQueue: TaskQueue, ast: Interpolation, target: object, targetProperty: string, mode: BindingMode, strict: boolean);
    updateTarget(): void;
    bind(_scope: Scope): void;
    unbind(): void;
    /**
     * Start using a given observer to update the target
     */
    useAccessor(accessor: IAccessor): void;
}
export interface InterpolationPartBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class InterpolationPartBinding implements IBinding, ICollectionSubscriber {
    readonly ast: IsExpression;
    readonly target: object;
    readonly targetProperty: string;
    strict: boolean;
    readonly owner: InterpolationBinding;
    readonly mode: BindingMode;
    _scope?: Scope;
    task: ITask | null;
    isBound: boolean;
    constructor(ast: IsExpression, target: object, targetProperty: string, locator: IServiceLocator, observerLocator: IObserverLocator, strict: boolean, owner: InterpolationBinding);
    updateTarget(): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(scope: Scope): void;
    unbind(): void;
}
//# sourceMappingURL=interpolation-binding.d.ts.map