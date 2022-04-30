import { IContainer, IModule } from '@aurelia/kernel';
import { CustomElementDefinition } from '@aurelia/runtime-html';
import { Params } from './instructions.js';
import { RouteConfig, IChildRouteConfig, Routeable, IRedirectRouteConfig } from './route.js';
import { IRouteContext } from './route-context.js';
export declare const defaultViewportName = "default";
export declare class RouteDefinition {
    readonly config: RouteConfig;
    readonly component: CustomElementDefinition | null;
    readonly hasExplicitPath: boolean;
    readonly caseSensitive: boolean;
    readonly path: string[];
    readonly redirectTo: string | null;
    readonly viewport: string;
    readonly id: string;
    readonly data: Params;
    readonly fallback: string | null;
    constructor(config: RouteConfig, component: CustomElementDefinition | null, parentDefinition: RouteDefinition | null);
    static resolve(routeable: Promise<IModule>, parentDefinition: RouteDefinition | null, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
    static resolve(routeable: string | IChildRouteConfig, parentDefinition: RouteDefinition | null, context: IRouteContext): RouteDefinition;
    static resolve(routeable: string | IChildRouteConfig | Promise<IModule>, parentDefinition: RouteDefinition | null): never;
    static resolve(routeable: Exclude<Routeable, Promise<IModule> | string | IChildRouteConfig>, parentDefinition: RouteDefinition | null): RouteDefinition;
    static resolve(routeable: Routeable, parentDefinition: RouteDefinition | null, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
    static resolveCustomElementDefinition(routeable: Exclude<Routeable, IRedirectRouteConfig>, context?: IRouteContext): CustomElementDefinition | Promise<CustomElementDefinition>;
    register(container: IContainer): void;
    toUrlComponent(): string;
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