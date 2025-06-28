import { NavigationCoordinator } from './navigation-coordinator';
import { IViewportScopeOptions, ViewportScope } from './endpoints/viewport-scope';
import { ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { FoundRoute } from './found-route';
import { IRouter } from './router';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Viewport } from './endpoints/viewport';
import { IViewportOptions } from './endpoints/viewport-options';
import { Step } from './utilities/runner';
import { Endpoint, EndpointTypeName, IConnectedCustomElement } from './endpoints/endpoint';
import { EndpointContent } from './index';
import { IContainer } from '@aurelia/kernel';
import { Parameters } from './instructions/instruction-parameters';
export type TransitionAction = 'skip' | 'reload' | 'swap' | '';
/**
 * The router uses routing scopes to organize all endpoints (viewports and viewport
 * scopes) into two hierarchical structures. Each routing scope belongs to a parent/child
 * hierarchy, that follows the DOM and is used when routing scopes are added and removed,
 * and an owner/owning hierarchy that's used when finding endpoints. Every routing scope
 * has a routing scope that owns it (except the root) and can in turn have several
 * routing scopes that it owns. A routing scope always has a connected endpoint content
 * and an endpoint content always has a connected routing scope.
 *
 * Every navigtion/load instruction that the router processes is first tied to a
 * routing scope, either a specified scope or the root scope. That routing scope is
 * then asked to
 * 1a) find routes (and their routing instructions) in the load instruction based on
 * the endpoint and its content (configured routes), and/or
 * 1b) find (direct) routing instructions in the load instruction.
 *
 * After that, the routing scope is used to
 * 2) match each of its routing instructions to an endpoint (viewport or viewport scope), and
 * 3) set the scope of the instruction to the next routing scopes ("children") and pass
 * the instructions on for matching in their new routing scopes.
 *
 * Once (component) transitions start in endpoints, the routing scopes assist by
 * 4) propagating routing hooks vertically through the hierarchy and disabling and
 * enabling endpoint contents and their routing data (routes) during transitions.
 *
 * Finally, when a navigation is complete, the routing scopes helps
 * 5) structure all existing routing instructions into a description of the complete
 * state of all the current endpoints and their contents.
 *
 * The hierarchy of the owner/owning routing scopes often follows the parent/child DOM
 * hierarchy, but it's not a necessity; it's possible to have routing scopes that doesn't
 * create their own "owning capable scope", and thus placing all their "children" under the
 * same "parent" as themselves or for a routing scope to hoist itself up or down in the
 * hierarchy and, for example, place itself as a "child" to a DOM sibling endpoint.
 * (Scope self-hoisting will not be available for early-on alpha.)
 */
export declare class RoutingScope {
    id: number;
    /**
     * The parent of the routing scope (parent/child hierarchy)
     */
    parent: RoutingScope | null;
    /**
     * The children of the routing scope (parent/child hierarchy)
     */
    children: RoutingScope[];
    readonly router: IRouter;
    /**
     * Whether the routing scope has a scope and can own other scopes
     */
    readonly hasScope: boolean;
    /**
     * The routing scope that owns this routing scope (owner/owning hierarchy)
     */
    owningScope: RoutingScope | null;
    /**
     * The endpoint content the routing scope is connected to
     */
    endpointContent: EndpointContent;
    constructor(router: IRouter, 
    /**
     * Whether the routing scope has a scope and can own other scopes
     */
    hasScope: boolean, 
    /**
     * The routing scope that owns this routing scope (owner/owning hierarchy)
     */
    owningScope: RoutingScope | null, 
    /**
     * The endpoint content the routing scope is connected to
     */
    endpointContent: EndpointContent);
    static for(origin: Element | ICustomElementViewModel | Viewport | ViewportScope | RoutingScope | ICustomElementController | IContainer | null, instruction?: string): {
        scope: RoutingScope | null;
        instruction: string | undefined;
    };
    /**
     * The routing scope children to this scope are added to. If this routing
     * scope has scope, this scope property equals this scope itself. If it
     * doesn't have scope this property equals the owning scope. Using this
     * ensures that routing scopes that don't have a their own scope aren't
     * part of the owner/owning hierarchy.
     */
    get scope(): RoutingScope;
    get endpoint(): Endpoint;
    get isViewport(): boolean;
    get isViewportScope(): boolean;
    get type(): string;
    get enabled(): boolean;
    get passThroughScope(): boolean;
    get pathname(): string;
    get path(): string;
    toString(recurse?: boolean): string;
    toStringOwning(recurse?: boolean): string;
    get enabledChildren(): RoutingScope[];
    get hoistedChildren(): RoutingScope[];
    get ownedScopes(): RoutingScope[];
    get routingInstruction(): RoutingInstruction | null;
    getOwnedScopes(includeDisabled?: boolean): RoutingScope[];
    findInstructions(instructions: RoutingInstruction[], useDirectRouting: boolean, useConfiguredRoutes: boolean): FoundRoute;
    /**
     * Match the instructions to available endpoints within, and with the help of, their scope.
     *
     * @param instructions - The instructions to matched
     * @param alreadyFound - The already found matches
     * @param disregardViewports - Whether viewports should be ignored when matching
     */
    matchEndpoints(instructions: RoutingInstruction[], alreadyFound: RoutingInstruction[], disregardViewports?: boolean): {
        matchedInstructions: RoutingInstruction[];
        remainingInstructions: RoutingInstruction[];
    };
    addEndpoint(type: EndpointTypeName, name: string, connectedCE: IConnectedCustomElement | null, options?: IViewportOptions | IViewportScopeOptions): Viewport | ViewportScope;
    removeEndpoint(step: Step | null, endpoint: Endpoint, connectedCE: IConnectedCustomElement | null): boolean;
    addChild(scope: RoutingScope): void;
    removeChild(scope: RoutingScope): void;
    allScopes(includeDisabled?: boolean): RoutingScope[];
    reparentRoutingInstructions(): RoutingInstruction[] | null;
    getChildren(timestamp: number): RoutingScope[];
    getAllRoutingScopes(timestamp: number): RoutingScope[];
    getOwnedRoutingScopes(timestamp: number): RoutingScope[];
    getRoutingInstructions(timestamp: number): RoutingInstruction[] | null;
    canUnload(coordinator: NavigationCoordinator, step: Step<boolean> | null): boolean | Promise<boolean>;
    unload(coordinator: NavigationCoordinator, step: Step<void> | null): Step<void>;
    matchScope(instructions: RoutingInstruction[], deep?: boolean): RoutingInstruction[];
    findMatchingRoute(path: string, parameters: Parameters): FoundRoute;
    private findMatchingRouteInRoutes;
    private ensureProperRoute;
}
//# sourceMappingURL=routing-scope.d.ts.map