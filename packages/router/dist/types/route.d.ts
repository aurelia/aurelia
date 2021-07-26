import { Constructable, ResourceType } from '@aurelia/kernel';
import { RouteableComponent, Params } from './instructions.js';
import { RouteNode } from './route-tree.js';
/**
 * Either a `RouteableComponent` or a name/config that can be resolved to a one:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IChildRouteConfig`: a standalone child route config object.
 * - `Routeable`: see `Routeable`.
 *
 * NOTE: differs from `NavigationInstruction` only in having `IChildRouteConfig` instead of `IViewportIntruction`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 * as well as `IRedirectRouteConfig`
 */
export declare type Routeable = string | IChildRouteConfig | IRedirectRouteConfig | RouteableComponent;
export interface IRouteConfig extends Partial<Omit<RouteConfig, 'saveTo'>> {
}
export interface IChildRouteConfig extends IRouteConfig, Pick<ChildRouteConfig, 'component'> {
}
export interface IRedirectRouteConfig extends Pick<IRouteConfig, 'caseSensitive'>, Pick<RouteConfig, 'redirectTo' | 'path'> {
}
export declare type TransitionPlan = 'none' | 'replace' | 'invoke-lifecycles';
export declare type TransitionPlanOrFunc = TransitionPlan | ((current: RouteNode, next: RouteNode) => TransitionPlan);
export declare function defaultReentryBehavior(current: RouteNode, next: RouteNode): TransitionPlan;
export declare class RouteConfig {
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    readonly id: string | null;
    /**
     * The path to match against the url.
     *
     * If left blank, the path will be derived from the component's static `path` property (if it exists), or otherwise the component name will be used (if direct routing is enabled).
     */
    readonly path: string | string[] | null;
    /**
     * The title to use for this route when matched.
     *
     * If left blank, this route will not contribute to the generated title.
     */
    readonly title: string | ((node: RouteNode) => string | null) | null;
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    readonly redirectTo: string | null;
    /**
     * Whether the `path` should be case sensitive.
     */
    readonly caseSensitive: boolean;
    /**
     * How to behave when this component scheduled to be loaded again in the same viewport:
     *
     * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed.
     * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
     * - `none`: does nothing (default if nothing has changed for the viewport)
     *
     * By default, calls the router lifecycle hooks only if the parameters have changed, otherwise does nothing.
     */
    readonly transitionPlan: TransitionPlanOrFunc;
    /**
     * The name of the viewport this component should be loaded into.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    readonly viewport: string | null;
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    readonly data: Params;
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    readonly routes: readonly Routeable[];
    protected constructor(
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    id: string | null, 
    /**
     * The path to match against the url.
     *
     * If left blank, the path will be derived from the component's static `path` property (if it exists), or otherwise the component name will be used (if direct routing is enabled).
     */
    path: string | string[] | null, 
    /**
     * The title to use for this route when matched.
     *
     * If left blank, this route will not contribute to the generated title.
     */
    title: string | ((node: RouteNode) => string | null) | null, 
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    redirectTo: string | null, 
    /**
     * Whether the `path` should be case sensitive.
     */
    caseSensitive: boolean, 
    /**
     * How to behave when this component scheduled to be loaded again in the same viewport:
     *
     * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed.
     * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
     * - `none`: does nothing (default if nothing has changed for the viewport)
     *
     * By default, calls the router lifecycle hooks only if the parameters have changed, otherwise does nothing.
     */
    transitionPlan: TransitionPlanOrFunc, 
    /**
     * The name of the viewport this component should be loaded into.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    viewport: string | null, 
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    data: Params, 
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    routes: readonly Routeable[]);
    static create(configOrPath: IRouteConfig | string | string[], Type: RouteType | null): RouteConfig;
    static configure<T extends RouteType>(configOrPath: IRouteConfig | string, Type: T): T;
    static getConfig(Type: RouteType): RouteConfig;
    saveTo(Type: RouteType): void;
}
export declare class ChildRouteConfig extends RouteConfig {
    /**
     * The component to load when this route is matched.
     */
    readonly component: Routeable;
    private constructor();
}
export declare class RedirectRouteConfig {
    readonly path: string | string[];
    readonly redirectTo: string;
    readonly caseSensitive: boolean;
    private constructor();
}
export declare const Route: {
    name: string;
    /**
     * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
     */
    isConfigured(Type: RouteType): boolean;
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    configure<T extends RouteType<Constructable<{}>>>(configOrPath: IRouteConfig | string | string[], Type: T): T;
    /**
     * Get the `RouteConfig` associated with the specified type, creating a new one if it does not yet exist.
     */
    getConfig(Type: RouteType): RouteConfig;
};
export declare type RouteType<T extends Constructable = Constructable> = ResourceType<T, InstanceType<T>, IRouteConfig>;
export declare type RouteDecorator = <T extends Constructable>(Type: T) => T;
/**
 * Associate a static route configuration with this type.
 *
 * @param config - The route config
 */
export declare function route(config: IRouteConfig): RouteDecorator;
/**
 * Associate a static route configuration with this type.
 *
 * @param path - The path to match against.
 *
 * (TODO: improve the formatting, better examples, etc)
 *
 * ```
 * &#64;route('home')
 * export class Home {}
 * ```
 *
 * ```
 * &#64;route(':id')
 * export class ProductDetail {}
 * ```
 */
export declare function route(path: string | string[]): RouteDecorator;
//# sourceMappingURL=route.d.ts.map