import { IContainer, IRegistry } from '@aurelia/kernel';
import { ViewportCustomElement } from './resources/viewport';
import { ViewportScopeCustomElement } from './resources/viewport-scope';
import { LoadCustomAttribute } from './resources/load';
import { HrefCustomAttribute } from './resources/href';
import { ConsideredActiveCustomAttribute } from './resources/considered-active';
import { IRouter } from './router';
import { IRouterOptions, RouterOptions } from './router-options';
import { BeforeNavigationHookFunction, IRoutingHookOptions, RoutingHookFunction, RoutingHookIdentity, TransformFromUrlHookFunction, TransformTitleHookFunction, TransformToUrlHookFunction } from './routing-hook';
export declare const IRouterConfiguration: import("@aurelia/kernel").InterfaceSymbol<IRouterConfiguration>;
export interface IRouterConfiguration extends RouterConfiguration {
}
export declare const RouterRegistration: IRegistry;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export declare const DefaultComponents: IRegistry[];
export { ViewportCustomElement, ViewportScopeCustomElement, LoadCustomAttribute, HrefCustomAttribute, ConsideredActiveCustomAttribute, };
export declare const ViewportCustomElementRegistration: IRegistry;
export declare const ViewportScopeCustomElementRegistration: IRegistry;
export declare const LoadCustomAttributeRegistration: IRegistry;
export declare const HrefCustomAttributeRegistration: IRegistry;
export declare const ConsideredActiveCustomAttributeRegistration: IRegistry;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
 */
export declare const DefaultResources: IRegistry[];
/**
 * A DI configuration object containing router resource registrations
 * and the router options API.
 */
export declare class RouterConfiguration {
    private static options;
    private static configurationCall;
    /**
     * The router options.
     */
    options: RouterOptions;
    /**
     * Register this configuration in a provided container and
     * register app tasks for starting and stopping the router.
     *
     * @param container - The container to register in
     */
    static register(container: IContainer): IContainer;
    /**
     * Make it possible to specify options to Router activation.
     *
     * @param config - Either a config object that's passed to router's
     * start or a config function that's called instead of router's start.
     */
    static customize(config?: IRouterOptions | ((router: IRouter) => void)): RouterConfiguration;
    /**
     * Create a new container with this configuration applied to it.
     */
    static createContainer(): IContainer;
    /**
     * Get the router configuration for a context.
     *
     * @param context - The context to get the configuration for
     */
    static for(context: IRouter | IContainer): RouterConfiguration;
    /**
     * Apply router options.
     *
     * @param options - The options to apply
     * @param firstResetDefaults - Whether the default router options should
     * be set before applying the specified options
     */
    apply(options: IRouterOptions, firstResetDefaults?: boolean): void;
    /**
     * Add a routing hook.
     *
     * @param hookFunction - The hook callback function
     * @param options - Options specifyinig hook type and filters
     */
    addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
    addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
    addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
    addHook(transformTitleHookFunction: TransformTitleHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
    addHook(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
    /**
     * Remove a routing hook.
     *
     * @param id - The id of the hook to remove (returned from the addHook call)
     */
    removeHook(id: RoutingHookIdentity): void;
    /**
     * Remove all routing hooks.
     */
    removeAllHooks(): void;
}
//# sourceMappingURL=configuration.d.ts.map