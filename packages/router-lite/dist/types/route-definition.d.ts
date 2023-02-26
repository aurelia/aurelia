import { type IContainer, IModule } from '@aurelia/kernel';
import { type CustomElementDefinition } from '@aurelia/runtime-html';
import { RouteConfig, IChildRouteConfig, Routeable } from './route';
import type { IRouteContext } from './route-context';
import type { RouteNode } from './route-tree';
import { FallbackFunction } from './resources/viewport';
export declare class RouteDefinition {
    readonly config: RouteConfig;
    readonly component: CustomElementDefinition | null;
    readonly hasExplicitPath: boolean;
    readonly caseSensitive: boolean;
    readonly path: string[];
    readonly redirectTo: string | null;
    readonly viewport: string;
    readonly id: string;
    readonly data: Record<string, unknown>;
    readonly fallback: string | FallbackFunction | null;
    constructor(config: RouteConfig, component: CustomElementDefinition | null, parentDefinition: RouteDefinition | null);
    static resolve(routeable: Promise<IModule>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
    static resolve(routeable: string | IChildRouteConfig, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): RouteDefinition;
    static resolve(routeable: string | IChildRouteConfig | Promise<IModule>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null): never;
    static resolve(routeable: Exclude<Routeable, Promise<IModule> | string | IChildRouteConfig>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null): RouteDefinition | Promise<RouteDefinition>;
    static resolve(routeable: Routeable, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
    private static createNavigationInstruction;
    register(container: IContainer): void;
    toString(): string;
}
export declare const $RouteDefinition: {
    name: string;
    /**
     * Returns `true` if the `def` has a route definition.
     */
    isDefined(def: CustomElementDefinition): boolean;
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    define(routeDefinition: RouteDefinition, customElementDefinition: CustomElementDefinition): void;
    /**
     * Get the `RouteDefinition` associated with the `customElementDefinition`.
     * Returns `null` if no route definition is associated with the given `customElementDefinition`.
     */
    get(customElementDefinition: CustomElementDefinition): RouteDefinition | null;
};
//# sourceMappingURL=route-definition.d.ts.map