import { IContainer } from '@aurelia/kernel';
import { StoreOptions } from './store.js';
export interface StorePluginOptions<T> extends StoreOptions {
    initialState: T;
}
export interface IConfigure {
    withInitialState(state: unknown): IConfigure;
    withOptions(options: Partial<StorePluginOptions<unknown>>): IConfigure;
    register(container: IContainer): IContainer;
}
export declare const StoreConfiguration: IConfigure;
export { ActionRegistrationError, DevToolsRemoteDispatchError, IStoreWindow, MiddlewareSettings, PerformanceMeasurement, PipedDispatch, Reducer, ReducerNoStateError, STORE, Store, StoreOptions, UnregisteredActionError, dispatchify, } from './store.js';
export { StepFn, executeSteps } from './test-helpers.js';
export { HistoryOptions, StateHistory, applyLimits, isStateHistory, jump, nextStateHistory, } from './history.js';
export { LogDefinitions, LogLevel, getLogType, } from './logging.js';
export { CallingAction, DEFAULT_LOCAL_STORAGE_KEY, Middleware, MiddlewarePlacement, localStorageMiddleware, logMiddleware, rehydrateFromLocalStorage, } from './middleware.js';
export { ConnectToSettings, MultipleSelector, connectTo, } from './decorator.js';
export { Action, ActionCreator, DevTools, DevToolsExtension, DevToolsMessage, DevToolsOptions, } from './devtools.js';
//# sourceMappingURL=index.d.ts.map