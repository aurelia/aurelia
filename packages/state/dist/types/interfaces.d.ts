import { type IRegistry } from '@aurelia/kernel';
import { IDevToolsOptions } from './interfaces-devtools';
export declare const IActionHandler: import("@aurelia/kernel").InterfaceSymbol<IActionHandler<any>>;
export type IActionHandler<T = any> = (state: T, action: unknown) => T | Promise<T>;
export type IStateMiddleware<T = any, S = any> = (state: T, action: unknown, settings: S) => T | undefined | false | void | Promise<T | undefined | false | void>;
export type MiddlewarePlacement = 'before' | 'after';
export interface IMiddlewareSettings {
    placement: MiddlewarePlacement;
    settings?: unknown;
}
export declare const IStore: import("@aurelia/kernel").InterfaceSymbol<IStore<object, unknown>>;
export interface IStore<T extends object, TAction = unknown> {
    subscribe(subscriber: IStoreSubscriber<T>): void;
    unsubscribe(subscriber: IStoreSubscriber<T>): void;
    getState(): T;
    /**
     * Dispatch an action by name or the function itself. The action needs to be registered with the store.
     *
     * @param action - the name or the action to be dispatched
     * @param params - all the parameters to be called with the action
     */
    dispatch(action: TAction): void | Promise<void>;
    /**
     * Register middleware to intercept actions before or after they are processed
     *
     * @param middleware - the middleware function to register
     * @param placement - whether to run the middleware before or after action handlers
     * @param settings - optional settings to pass to the middleware
     */
    registerMiddleware<S = any>(middleware: IStateMiddleware<T, S>, placement: MiddlewarePlacement, settings?: S): void;
    /**
     * Unregister middleware from the store
     *
     * @param middleware - the middleware function to unregister
     */
    unregisterMiddleware(middleware: IStateMiddleware<T>): void;
    /**
     * For Devtools integration
     */
    connectDevTools(options?: IDevToolsOptions): void;
}
export declare const IState: import("@aurelia/kernel").InterfaceSymbol<object>;
export type IRegistrableAction = IActionHandler & IRegistry;
export interface IStoreSubscriber<T extends object> {
    handleStateChange(state: T, prevState: T): void;
}
//# sourceMappingURL=interfaces.d.ts.map