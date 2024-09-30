import { type IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior } from '@aurelia/expression-parser';
import { type IObserverLocatorBasedConnectable, type Scope, type IAstEvaluator } from '@aurelia/runtime';
import { type IBinding } from '@aurelia/runtime-html';
import { type IStoreSubscriber, type IStore } from './interfaces';
/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateDispatchBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {
}
export declare class StateDispatchBinding implements IBinding, IStoreSubscriber<object> {
    isBound: boolean;
    ast: IsBindingBehavior;
    strict: boolean;
    constructor(locator: IServiceLocator, expr: IsBindingBehavior, target: HTMLElement, prop: string, store: IStore<object>, strict: boolean);
    callSource(e: Event): void;
    handleEvent(e: Event): void;
    bind(_scope: Scope): void;
    unbind(): void;
    handleStateChange(state: object): void;
}
//# sourceMappingURL=state-dispatch-binding.d.ts.map