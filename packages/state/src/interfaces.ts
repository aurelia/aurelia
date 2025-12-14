import { type IDisposable, type IRegistry } from '@aurelia/kernel';
import { IDevToolsOptions } from './interfaces-devtools';
import { createInterface } from './state-utilities';

export const IActionHandler = /*@__PURE__*/createInterface<IActionHandler>('IActionHandler');
export type IActionHandler<T = any> = (state: T, action: unknown) => T | Promise<T>;

export type IStateMiddleware<T = any, S = any> = (state: T, action: unknown, settings: S) => T | undefined | false | void | Promise<T | undefined | false | void>;

export type MiddlewarePlacement = 'before' | 'after';

export interface IMiddlewareSettings {
  placement: MiddlewarePlacement;
  settings?: unknown;
}

export const IStore = /*@__PURE__*/createInterface<IStore<object>>('IStore');
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

export const IState = /*@__PURE__*/createInterface<object>('IState');

export interface IStoreRegistry {
  registerStore<T extends object>(name: string, store: IStore<T>): void;
  getStore<T extends object>(name: string): IStore<T>;
}

export const IStoreRegistry = /*@__PURE__*/createInterface<IStoreRegistry>('IStoreRegistry');

export type IRegistrableAction = IActionHandler & IRegistry;

export interface IStoreSubscriber<T extends object> {
  handleStateChange(state: T, prevState: T): void;
}

/** @internal */
export type SubscribableValue = {
  subscribe(cb: (res: unknown) => void): IDisposable | Unsubscribable | (() => void);
};

/** @internal */
export type Unsubscribable = {
  unsubscribe(): void;
};
