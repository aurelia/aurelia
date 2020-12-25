import { Constructable, emptyArray, Metadata, Protocol, ResourceType } from '@aurelia/kernel';

import { validateRouteConfig, expectType, shallowEquals } from './validation.js';
import { RouteableComponent, Params } from './instructions.js';
import { RouteNode } from './route-tree.js';
import { CanLoad, CanUnload, Load, Unload } from './hooks.js';

const noChildren = emptyArray as RouteConfig['children'];
const noCanLoadHooks = emptyArray as RouteConfig['canLoad'];
const noCanUnloadHooks = emptyArray as RouteConfig['canUnload'];
const noLoadHooks = emptyArray as RouteConfig['load'];
const noUnloadHooks = emptyArray as RouteConfig['unload'];

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

export interface IRouteConfig extends Partial<Omit<RouteConfig, 'saveTo'>> { }
export interface IChildRouteConfig extends IRouteConfig, Pick<ChildRouteConfig, 'component'> { }
export interface IRedirectRouteConfig extends Pick<IRouteConfig, 'caseSensitive'>, Pick<RouteConfig, 'redirectTo' | 'path'> { }

export type TransitionPlan = 'none' | 'replace' | 'invoke-lifecycles';
export type TransitionPlanOrFunc = TransitionPlan | ((current: RouteNode, next: RouteNode) => TransitionPlan);
export function defaultReentryBehavior(current: RouteNode, next: RouteNode): TransitionPlan {
  if (!shallowEquals(current.params, next.params)) {
    return 'invoke-lifecycles';
  }

  return 'none';
}

export class RouteConfig {
  protected constructor(
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    public readonly id: string | null,
    /**
     * The path to match against the url.
     *
     * If left blank, the path will be derived from the component's static `path` property (if it exists), or otherwise the component name will be used (if direct routing is enabled).
     */
    public readonly path: string | string[] | null,
    /**
     * The title to use for this route when matched.
     *
     * If left blank, this route will not contribute to the generated title.
     */
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    public readonly redirectTo: string | null,
    /**
     * Whether the `path` should be case sensitive.
     */
    public readonly caseSensitive: boolean,
    /**
     * How to behave when this component scheduled to be loaded again in the same viewport:
     *
     * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed.
     * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
     * - `none`: does nothing (default if nothing has changed for the viewport)
     *
     * By default, calls the router lifecycle hooks only if the parameters have changed, otherwise does nothing.
     */
    public readonly transitionPlan: TransitionPlanOrFunc,
    /**
     * The name of the viewport this component should be loaded into.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    public readonly viewport: string | null,
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    public readonly data: Params,
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    public readonly children: readonly Routeable[],
    public readonly canLoad: readonly CanLoad[],
    public readonly canUnload: readonly CanUnload[],
    public readonly load: readonly Load[],
    public readonly unload: readonly Unload[],
  ) { }

  public static create(configOrPath: IRouteConfig | string | string[], Type: RouteType | null): RouteConfig {
    if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
      const path = configOrPath;

      const redirectTo = Type?.redirectTo ?? null;
      const caseSensitive = Type?.caseSensitive ?? false;
      const id = Type?.id ?? (path instanceof Array ? path[0] : path);
      const title = Type?.title ?? null;
      const reentryBehavior = Type?.transitionPlan ?? defaultReentryBehavior;
      const viewport = Type?.viewport ?? null;
      const data = Type?.data ?? {};
      const children = Type?.children ?? noChildren;
      const canLoad = Type?.canLoad ?? noCanLoadHooks;
      const canUnload = Type?.canUnload ?? noCanUnloadHooks;
      const load = Type?.load ?? noLoadHooks;
      const unload = Type?.unload ?? noUnloadHooks;

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
        canLoad,
        canUnload,
        load,
        unload,
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
        ...(config.children ?? noChildren),
        ...(Type?.children ?? noChildren),
      ];
      const canLoad = [
        ...(config.canLoad ?? noCanLoadHooks),
        ...(Type?.canLoad ?? noCanLoadHooks),
      ];
      const canUnload = [
        ...(config.canUnload ?? noCanUnloadHooks),
        ...(Type?.canUnload ?? noCanUnloadHooks),
      ];
      const load = [
        ...(config.load ?? noLoadHooks),
        ...(Type?.load ?? noLoadHooks),
      ];
      const unload = [
        ...(config.unload ?? noUnloadHooks),
        ...(Type?.unload ?? noUnloadHooks),
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
        canLoad,
        canUnload,
        load,
        unload,
      );
    } else {
      expectType('string, function/class or object', '', configOrPath);
    }
  }

  public static configure<T extends RouteType>(configOrPath: IRouteConfig | string, Type: T): T {
    const config = RouteConfig.create(configOrPath, Type);
    Metadata.define(Route.name, config, Type);

    return Type;
  }

  public static getConfig(Type: RouteType): RouteConfig {
    if (!Metadata.hasOwn(Route.name, Type)) {
      // In the case of a type, this means there was no @route decorator on the class.
      // However there might still be static properties, and this API provides a unified way of accessing those.
      Route.configure({}, Type);
    }

    return Metadata.getOwn(Route.name, Type) as RouteConfig;
  }

  public saveTo(Type: RouteType): void {
    Metadata.define(Route.name, this, Type);
  }
}

export class ChildRouteConfig extends RouteConfig {
  private constructor(
    id: string | null,
    path: string | string[] | null,
    title: string | null,
    redirectTo: string | null,
    caseSensitive: boolean,
    reentryBehavior: TransitionPlanOrFunc,
    viewport: string | null,
    data: Params,
    children: readonly Routeable[],
    canLoad: readonly CanLoad[],
    canUnload: readonly CanUnload[],
    load: readonly Load[],
    unload: readonly Unload[],
    /**
     * The component to load when this route is matched.
     */
    public readonly component: Routeable,
  ) {
    super(
      id,
      path,
      title,
      redirectTo,
      caseSensitive,
      reentryBehavior,
      viewport,
      data,
      children,
      canLoad,
      canUnload,
      load,
      unload,
    );
  }
}

export class RedirectRouteConfig {
  private constructor(
    public readonly path: string | string[],
    public readonly redirectTo: string,
    public readonly caseSensitive: boolean,
  ) {}
}

export const Route = {
  name: Protocol.resource.keyFor('route'),
  /**
   * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
   */
  isConfigured(Type: RouteType): boolean {
    return Metadata.hasOwn(Route.name, Type);
  },
  /**
   * Apply the specified configuration to the specified type, overwriting any existing configuration.
   */
  configure<T extends RouteType>(configOrPath: IRouteConfig | string | string[], Type: T): T {
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
