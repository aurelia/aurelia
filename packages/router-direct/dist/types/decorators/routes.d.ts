import { Constructable } from '@aurelia/kernel';
import { CustomElementType } from '@aurelia/runtime-html';
import { IRoute, Route } from '../route';
import { RouteableComponentType } from '../interfaces';
export declare const Routes: {
    name: string;
    isConfigured<T extends CustomElementType>(Type: T): boolean;
    configure<T extends CustomElementType>(configurationsOrTypes: (IRoute | RouteableComponentType)[], Type: T): T;
    getConfiguration<T extends CustomElementType>(Type: T): Route[];
};
export type RoutesDecorator = <T extends Constructable>(Type: T, context: ClassDecoratorContext<T>) => T;
/**
 * Associate a static routes configuration with this type.
 *
 * @param configurations - The route configurations
 */
export declare function routes(configurations: IRoute[]): RoutesDecorator;
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
export declare function routes(Types: RouteableComponentType[]): RoutesDecorator;
//# sourceMappingURL=routes.d.ts.map