import { Metadata } from '@aurelia/metadata';
import { Constructable, getResourceKeyFor } from '@aurelia/kernel';
import { CustomElementType } from '@aurelia/runtime-html';
import { IRoute, Route } from '../route';
import { RouteableComponentType } from '../interfaces';

export const Routes: {
  name: string;
  isConfigured<T extends CustomElementType>(Type: T): boolean;
  configure<T extends CustomElementType>(configurationsOrTypes: (IRoute | RouteableComponentType)[], Type: T): T;
  getConfiguration<T extends CustomElementType>(Type: T): Route[];
} = {
  name: /*@__PURE__*/getResourceKeyFor('routes'),
  /**
   * Returns `true` if the specified type has any static routes configuration (either via static properties or a &#64;route decorator)
   */
  isConfigured<T extends CustomElementType>(Type: T): boolean {
    return Metadata.has(Routes.name, Type) || 'routes' in Type;
  },

  /**
   * Apply the specified configuration to the specified type, overwriting any existing configuration.
   */
  configure<T extends CustomElementType>(configurationsOrTypes: (IRoute | RouteableComponentType)[], Type: T): T {
    const configurations = configurationsOrTypes.map(configOrType => Route.create(configOrType));
    Metadata.define(configurations, Type, Routes.name);

    return Type;
  },

  /**
   * Get the `RouteConfiguration`s associated with the specified type.
   */
  getConfiguration<T extends CustomElementType>(Type: T): Route[] {
    const type: RouteableComponentType = Type;
    const routes: (IRoute | Route)[] = [];
    const metadata = Metadata.get(Routes.name, Type);

    // TODO: Check if they are indeed to be concatenated (and what that means
    // for match order) or if one should replace the other
    if (Array.isArray(metadata)) {
      routes.push(...metadata);
    }
    if (Array.isArray(type.routes)) {
      routes.push(...type.routes);
    }
    return routes.map(route => route instanceof Route ? route : Route.create(route));
  },
};

export type RoutesDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext<T>) => T;

/**
 * Associate a static routes configuration with this type.
 *
 * @param configurations - The route configurations
 */
export function routes(configurations: IRoute[]): RoutesDecorator;
/**
 * Create static route configurations for these types.
 *
 * @param Types - The types to create routes for.
 *
 * (TODO: improve the formatting, better examples, etc)
 *
 * ```
 * &#64;routes([{ path: 'home', component: 'my-home' }])
 * export class Home {}
 * ```
 */
export function routes(Types: RouteableComponentType[]): RoutesDecorator;
export function routes(configurationsOrTypes: (IRoute | RouteableComponentType)[]): RoutesDecorator {
  return function (target, context) {
    context.addInitializer(function (this) {
      Routes.configure(configurationsOrTypes, this);
    });
    return target;
  };
}
