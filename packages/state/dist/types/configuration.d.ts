import { IContainer } from '@aurelia/kernel';
import { IActionHandler, IStateMiddleware, MiddlewarePlacement } from './interfaces';
import { IDevToolsOptions } from './interfaces-devtools';
export interface IMiddlewareRegistration<T = any, S = any> {
    middleware: IStateMiddleware<T, S>;
    placement: MiddlewarePlacement;
    settings?: S;
}
export declare const StateDefaultConfiguration: IStateConfiguration;
export interface IStateConfiguration {
    register(c: IContainer): void;
    /**
     * Create a new configuration for the State plugin
     */
    init: IConfigurationInit;
}
export interface IStateConfigurationOptions {
    devToolsOptions?: IDevToolsOptions;
    middlewares?: IMiddlewareRegistration[];
}
export interface IConfigurationInit {
    /**
     * @param state - the initial state
     */
    <T1>(state: T1, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
    /**
     * @param state - the initial state
     * @param options - configuration for the Store
     */
    <T1>(state: T1, options: IStateConfigurationOptions, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
}
//# sourceMappingURL=configuration.d.ts.map