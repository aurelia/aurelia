import { IContainer, ILogger } from '@aurelia/kernel';
import { Observable } from 'rxjs';
import { HistoryOptions } from './history.js';
import { Middleware, MiddlewarePlacement } from './middleware.js';
import { LogDefinitions } from './logging.js';
import { DevToolsOptions, DevToolsExtension } from './devtools.js';
export declare type Reducer<T, P extends unknown[] = unknown[]> = (state: T, ...params: P) => T | false | Promise<T | false>;
export declare enum PerformanceMeasurement {
    StartEnd = "startEnd",
    All = "all"
}
export interface StoreOptions {
    history?: Partial<HistoryOptions>;
    logDispatchedActions?: boolean;
    measurePerformance?: PerformanceMeasurement;
    propagateError?: boolean;
    logDefinitions?: LogDefinitions;
    devToolsOptions?: DevToolsOptions;
}
export interface PipedDispatch<T> {
    pipe: <P extends unknown[]>(reducer: Reducer<T, P> | string, ...params: P) => PipedDispatch<T>;
    dispatch: () => Promise<void>;
}
export declare const STORE: {
    container: IContainer;
};
export interface IStoreWindow extends Window {
    devToolsExtension?: DevToolsExtension;
    __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension;
}
export declare class UnregisteredActionError<T, P extends unknown[]> extends Error {
    constructor(reducer?: string | Reducer<T, P>);
}
export declare class DevToolsRemoteDispatchError extends Error {
}
export declare class ActionRegistrationError extends Error {
}
export declare class ReducerNoStateError extends Error {
}
export interface MiddlewareSettings {
    placement: MiddlewarePlacement;
    settings?: unknown;
}
export declare class Store<T> {
    private readonly initialState;
    private readonly logger;
    private readonly _window;
    readonly state: Observable<T>;
    private devToolsAvailable;
    private devTools?;
    private readonly actions;
    private readonly middlewares;
    private readonly _state;
    private readonly options;
    private readonly dispatchQueue;
    constructor(initialState: T, logger: ILogger, _window: IStoreWindow, options?: Partial<StoreOptions>);
    registerMiddleware(reducer: Middleware<T, undefined>, placement: MiddlewarePlacement): void;
    registerMiddleware<S extends NonNullable<any>>(reducer: Middleware<T, S>, placement: MiddlewarePlacement, settings: S): void;
    unregisterMiddleware(reducer: Middleware<T>): void;
    isMiddlewareRegistered(middleware: Middleware<T>): boolean;
    registerAction(name: string, reducer: Reducer<T>): void;
    unregisterAction(reducer: Reducer<T>): void;
    isActionRegistered(reducer: Reducer<T> | string): boolean;
    resetToState(state: T): void;
    dispatch<P extends unknown[]>(reducer: Reducer<T, P> | string, ...params: P): Promise<void>;
    pipe<P extends unknown[]>(reducer: Reducer<T, P> | string, ...params: P): PipedDispatch<T>;
    private lookupAction;
    private queueDispatch;
    private handleQueue;
    private internalDispatch;
    private executeMiddlewares;
    private setupDevTools;
    private updateDevToolsState;
    private registerHistoryMethods;
}
export declare function dispatchify<T, P extends unknown[]>(action: Reducer<T, P> | string): (...params: P) => Promise<void>;
//# sourceMappingURL=store.d.ts.map