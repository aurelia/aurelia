import { Constructable, ResourceType } from '@aurelia/kernel';
import { IRoute } from '../route';
export type RouteType<T extends Constructable = Constructable> = ResourceType<T, InstanceType<T>, IRoute>;
export type RouteDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext) => T;
/**
 * Associate a static route configuration with this type.
 *
 * @param config - The route config
 */
export declare function route(config: IRoute): RouteDecorator;
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
export declare function route(path: string): RouteDecorator;
//# sourceMappingURL=route.d.ts.map