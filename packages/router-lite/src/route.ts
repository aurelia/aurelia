import { Metadata } from '@aurelia/metadata';
import { Constructable, emptyArray, Protocol, ResourceType } from '@aurelia/kernel';

import { validateRouteConfig, expectType, shallowEquals } from './validation';
import { RouteableComponent, Params } from './instructions';
import { RouteNode } from './route-tree';

const noRoutes = emptyArray as RouteConfig['routes'];

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
export type Routeable = string | IChildRouteConfig | IRedirectRouteConfig | RouteableComponent;

export interface IRouteConfig {
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     */
    readonly id?: string | null;
    /**
     * The path to match against the url.
     *
     * If left blank, the path will be derived from the component's static `path` property (if it exists).
     */
    readonly path?: string | string[] | null;
    /**
     * The title to use for this route when matched.
     *
     * If left blank, this route will not contribute to the generated title.
     */
    readonly title?: string | ((node: RouteNode) => string | null) | null;
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    readonly redirectTo?: string | null;
    /**
     * Whether the `path` should be case sensitive.
     */
    readonly caseSensitive?: boolean;
    /**
     * How to behave when this component scheduled to be loaded again in the same viewport:
     *
     * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed.
     * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
     * - `none`: does nothing (default if nothing has changed for the viewport)
     *
     * By default, calls the router lifecycle hooks only if the parameters have changed, otherwise does nothing.
     */
    readonly transitionPlan?: TransitionPlanOrFunc;
    /**
     * The name of the viewport this component should be loaded into.
     */
    readonly viewport?: string | null;
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    readonly data?: Record<string, unknown>;
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    readonly routes?: readonly Routeable[];

    /**
     * When set, will be used to redirect unknown/unconfigured routes to this route.
     * Can be a route-id, route-path (route), or a custom element name; this is also the resolution/fallback order.
     */
    readonly fallback?: string | null;
    /**
     * When set to `false`, the routes won't be included in the navigation model.
     *
     * @default true
     */
    readonly nav?: boolean;
}
export interface IChildRouteConfig extends IRouteConfig {
  /**
   * The component to load when this route is matched.
   */
  readonly component: Routeable;
}
export interface IRedirectRouteConfig extends Pick<IRouteConfig, 'caseSensitive' | 'redirectTo' | 'path'> {}

export type TransitionPlan = 'none' | 'replace' | 'invoke-lifecycles';
export type TransitionPlanOrFunc = TransitionPlan | ((current: RouteNode, next: RouteNode) => TransitionPlan);
export function defaultReentryBehavior(current: RouteNode, next: RouteNode): TransitionPlan {
  if (!shallowEquals(current.params, next.params)) {
    return 'replace';
  }

  return 'none';
}

// Every kind of route configurations are normalized to this `RouteConfig` class.
export class RouteConfig implements IRouteConfig, IChildRouteConfig {
  protected constructor(
    public readonly id: string | null,
    public readonly path: string | string[] | null,
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    public readonly redirectTo: string | null,
    public readonly caseSensitive: boolean,
    public readonly transitionPlan: TransitionPlanOrFunc,
    public readonly viewport: string | null,
    public readonly data: Record<string, unknown>,
    public readonly routes: readonly Routeable[],
    public readonly fallback: string | null,
    public readonly component: Routeable,
    public readonly nav: boolean,
  ) { }

  public static create(configOrPath: IRouteConfig | IChildRouteConfig | string | string[], Type: RouteType | null): RouteConfig {
    if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
      const path = configOrPath;

      const redirectTo = Type?.redirectTo ?? null;
      const caseSensitive = Type?.caseSensitive ?? false;
      const id = Type?.id ?? (path instanceof Array ? path[0] : path);
      const title = Type?.title ?? null;
      const reentryBehavior = Type?.transitionPlan ?? defaultReentryBehavior;
      const viewport = Type?.viewport ?? null;
      const data = Type?.data ?? {};
      const children = Type?.routes ?? noRoutes;

      return new RouteConfig(
        id,
        path,
        title,
        redirectTo,
        caseSensitive,
        reentryBehavior,
        viewport,
        data,
        children,
        Type?.fallback ?? null,
        null!, // TODO(sayan): find a TS-wise clearer way to deal with this.
        Type?.nav ?? true,
      );
    } else if (typeof configOrPath === 'object') {
      const config = configOrPath;
      validateRouteConfig(config, '');

      const path = config.path ?? Type?.path ?? null;
      const title = config.title ?? Type?.title ?? null;
      const redirectTo = config.redirectTo ?? Type?.redirectTo ?? null;
      const caseSensitive = config.caseSensitive ?? Type?.caseSensitive ?? false;
      const id = config.id ?? Type?.id ?? (path instanceof Array ? path[0] : path);
      const reentryBehavior = config.transitionPlan ?? Type?.transitionPlan ?? defaultReentryBehavior;
      const viewport = config.viewport ?? Type?.viewport ?? null;
      const data = {
        ...Type?.data,
        ...config.data,
      };
      const children = [
        ...(config.routes ?? noRoutes),
        ...(Type?.routes ?? noRoutes),
      ];
      return new RouteConfig(
        id,
        path,
        title,
        redirectTo,
        caseSensitive,
        reentryBehavior,
        viewport,
        data,
        children,
        config.fallback ?? Type?.fallback ?? null,
        (config as IChildRouteConfig).component ?? null,
        config.nav ?? true,
      );
    } else {
      expectType('string, function/class or object', '', configOrPath);
    }
  }

  /**
   * Creates a new route config applying the child route config.
   * Note that the current rote config is not mutated.
   */
  public applyChildRouteConfig(config: IChildRouteConfig): RouteConfig {
    let parentPath = this.path ?? '';
    if(typeof parentPath!=='string') {
      parentPath = parentPath[0];
    }
    validateRouteConfig(config, parentPath);
    return new RouteConfig(
      config.id ?? this.id,
      config.path ?? this.path,
      config.title ?? this.title,
      config.redirectTo ?? this.redirectTo,
      config.caseSensitive ?? this.caseSensitive,
      config.transitionPlan ?? this.transitionPlan,
      config.viewport ?? this.viewport,
      config.data ?? this.data,
      config.routes ?? this.routes,
      config.fallback ?? this.fallback,
      config.component ?? this.component,
      config.nav ?? this.nav,
    );
  }
}

export const Route = {
  name: Protocol.resource.keyFor('route-configuration'),
  /**
   * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
   */
  isConfigured(Type: RouteType): boolean {
    return Metadata.hasOwn(Route.name, Type);
  },
  /**
   * Apply the specified configuration to the specified type, overwriting any existing configuration.
   */
  configure<T extends RouteType>(configOrPath: IRouteConfig | IChildRouteConfig | string | string[], Type: T): T {
    const config = RouteConfig.create(configOrPath, Type);
    Metadata.define(Route.name, config, Type);

    return Type;
  },
  /**
   * Get the `RouteConfig` associated with the specified type, creating a new one if it does not yet exist.
   */
  getConfig(Type: RouteType): RouteConfig {
    if (!Route.isConfigured(Type)) {
      // This means there was no @route decorator on the class.
      // However there might still be static properties, and this API provides a unified way of accessing those.
      Route.configure({}, Type);
    }

    return Metadata.getOwn(Route.name, Type) as RouteConfig;
  },
};

export type RouteType<T extends Constructable = Constructable> = ResourceType<T, InstanceType<T>, IRouteConfig>;
export type RouteDecorator = <T extends Constructable>(Type: T) => T;

/**
 * Associate a static route configuration with this type.
 *
 * @param config - The route config
 */
export function route(config: IRouteConfig): RouteDecorator;
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
export function route(path: string | string[]): RouteDecorator;
export function route(configOrPath: IRouteConfig | string | string[]): RouteDecorator {
  return function (target) {
    return Route.configure(configOrPath, target);
  };
}
