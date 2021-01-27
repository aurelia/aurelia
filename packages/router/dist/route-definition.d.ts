import { IContainer, IModule } from '@aurelia/kernel';
import { CustomElementDefinition } from '@aurelia/runtime-html';
import { Params } from './instructions.js';
import { RouteConfig, IChildRouteConfig, Routeable, IRedirectRouteConfig } from './route.js';
import { IRouteContext } from './route-context.js';
export declare class RouteDefinition {
    readonly config: Omit<RouteConfig, 'saveTo'>;
    readonly component: CustomElementDefinition | null;
    readonly hasExplicitPath: boolean;
    readonly caseSensitive: boolean;
    readonly path: string[];
    readonly redirectTo: string | null;
    readonly viewport: string;
    readonly id: string;
    readonly data: Params;
    constructor(config: Omit<RouteConfig, 'saveTo'>, component: CustomElementDefinition | null);
    static resolve(routeable: Promise<IModule>, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
    static resolve(routeable: string | IChildRouteConfig, context: IRouteContext): RouteDefinition;
    static resolve(routeable: string | IChildRouteConfig | Promise<IModule>): never;
    static resolve(routeable: Exclude<Routeable, Promise<IModule> | string | IChildRouteConfig>): RouteDefinition;
    static resolve(routeable: Routeable, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
    static resolveCustomElementDefinition(routeable: Exclude<Routeable, IRedirectRouteConfig>, context?: IRouteContext): CustomElementDefinition | Promise<CustomElementDefinition>;
    register(container: IContainer): void;
    toUrlComponent(): string;
    toString(): string;
}
//# sourceMappingURL=route-definition.d.ts.map