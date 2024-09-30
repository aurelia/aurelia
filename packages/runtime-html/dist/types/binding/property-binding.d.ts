import { ISubscriber, IAstEvaluator, type Scope, type ICollectionSubscriber, type IObserver, type IObserverLocator, type IObserverLocatorBasedConnectable } from '@aurelia/runtime';
import { IBinding } from './interfaces-bindings';
import type { IServiceLocator } from '@aurelia/kernel';
import type { TaskQueue } from '@aurelia/platform';
import type { BindingMode, IBindingController } from './interfaces-bindings';
import { type IsBindingBehavior, ForOfStatement } from '@aurelia/expression-parser';
export interface PropertyBinding extends IAstEvaluator, IServiceLocator, IObserverLocatorBasedConnectable {
}
export declare class PropertyBinding implements IBinding, ISubscriber, ICollectionSubscriber {
    ast: IsBindingBehavior | ForOfStatement;
    target: object;
    targetProperty: string;
    mode: BindingMode;
    strict: boolean;
    isBound: boolean;
    constructor(controller: IBindingController, locator: IServiceLocator, observerLocator: IObserverLocator, taskQueue: TaskQueue, ast: IsBindingBehavior | ForOfStatement, target: object, targetProperty: string, mode: BindingMode, strict: boolean);
    updateTarget(value: unknown): void;
    updateSource(value: unknown): void;
    handleChange(): void;
    handleCollectionChange(): void;
    bind(scope: Scope): void;
    unbind(): void;
    /**
     * Start using a given observer to listen to changes on the target of this binding
     */
    useTargetObserver(observer: IObserver): void;
    /**
     * Provide a subscriber for target change observation.
     *
     * Binding behaviors can use this to setup custom observation handling during bind lifecycle
     * to alter the update source behavior during bind phase of this binding.
     */
    useTargetSubscriber(subscriber: ISubscriber): void;
}
//# sourceMappingURL=property-binding.d.ts.map