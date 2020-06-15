import {
  Constructable,
  Metadata,
  Protocol,
  ResourceType,
  PLATFORM,
  IIndexable,
} from '@aurelia/kernel';

import {
  validateRouteConfig,
  expectType,
} from './validation';
import {
  RouteableComponent,
} from './navigation-instruction';

const noChildren = PLATFORM.emptyArray as RouteConfig['children'];

/**
 * Either a `RouteableComponent` or a name/config that can be resolved to a one:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IChildRouteConfig`: a standalone child route config object.
 * - `Routeable`: see `Routeable`.
 *
 * NOTE: differs from `NavigationInstruction` only in having `IChildRouteConfig` instead of `IViewportIntruction`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 */
export type Routeable = (
  string |
  IChildRouteConfig |
  RouteableComponent
);

export interface IRouteConfig extends Partial<RouteConfig> { }
export interface IChildRouteConfig extends IRouteConfig, Pick<ChildRouteConfig, 'component'> { }

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
    public readonly path: string | null,
    /**
     * Whether the `path` should be case sensitive.
     */
    public readonly caseSensitive: boolean,
    /**
     * The name of the viewport this component should be loaded into.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    public readonly viewport: string | null,
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    public readonly data: IIndexable,
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    public readonly children: readonly Routeable[],
  ) { }

  public static create(
    configOrPath: IRouteConfig | string,
    Type: RouteType | null,
  ): RouteConfig {
    switch (typeof configOrPath) {
      case 'string': {
        const path = configOrPath;

        const caseSensitive = Type?.caseSensitive ?? false;
        const id = Type?.id ?? path;
        const viewport = Type?.viewport ?? null;
        const data = Type?.data ?? {};
        const children = Type?.children ?? noChildren;

        return new RouteConfig(id, path, caseSensitive, viewport, data, children);
      }
      case 'object': {
        const config = configOrPath;
        validateRouteConfig(config, '');

        const path = config.path ?? Type?.path ?? null;
        const caseSensitive = config.caseSensitive ?? Type?.caseSensitive ?? false;
        const id = config.id ?? Type?.id ?? path;
        const viewport = config.viewport ?? Type?.viewport ?? null;
        const data = {
          ...Type?.data,
          ...config.data,
        };
        const children = [
          ...(config.children ?? noChildren),
          ...(Type?.children ?? noChildren),
        ];

        return new RouteConfig(id, path, caseSensitive, viewport, data, children);
      }
      default:
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
    path: string | null,
    caseSensitive: boolean,
    viewport: string | null,
    data: IIndexable,
    children: readonly Routeable[],
    /**
     * The component to load when this route is matched.
     */
    public readonly component: Routeable,
  ) {
    super(
      id,
      path,
      caseSensitive,
      viewport,
      data,
      children,
    );
  }
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
  configure<T extends RouteType>(configOrPath: IRouteConfig | string, Type: T): T {
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
export function route(path: string): RouteDecorator;
export function route(configOrPath: IRouteConfig | string): RouteDecorator {
  return function (target) {
    return Route.configure(configOrPath, target);
  };
}
