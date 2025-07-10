import { type IServiceLocator } from '@aurelia/kernel';
import { IsBindingBehavior } from '@aurelia/expression-parser';
import { type IObserverLocator, type IObserverLocatorBasedConnectable, ISubscriber, type IAstEvaluator, type Scope } from '@aurelia/runtime';
import { BindingMode, type IBindingController, type IBinding } from '@aurelia/runtime-html';
import { IStore, type IStoreSubscriber } from './interfaces';
/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class StateBinding implements IBinding, ISubscriber, IStoreSubscriber<object> {
    isBound: boolean;
    ast: IsBindingBehavior;
    private readonly target;
    private readonly targetProperty;
    strict: boolean;
    mode: BindingMode;
    constructor(controller: IBindingController, locator: IServiceLocator, observerLocator: IObserverLocator, ast: IsBindingBehavior, target: object, prop: PropertyKey, store: IStore<object>, strict: boolean);
    updateTarget(value: unknown): void;
    bind(_scope: Scope): void;
    unbind(): void;
    handleChange(newValue: unknown): void;
    handleStateChange(): void;
}
//# sourceMappingURL=state-binding.d.ts.map