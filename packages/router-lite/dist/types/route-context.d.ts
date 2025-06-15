import { type IContainer } from '@aurelia/kernel';
import { RecognizedRoute } from '@aurelia/route-recognizer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '@aurelia/runtime-html';
import { IRouteViewModel } from './component-agent';
import { IExtendedViewportInstruction, NavigationInstruction, Params, ViewportInstruction, ViewportInstructionTree } from './instructions';
import { IChildRouteConfig, INavigationOptions } from './options';
import { RouteConfig, RouteType } from './route';
import type { RouteNode } from './route-tree';
import { IRouter } from './router';
import { ViewportAgent } from './viewport-agent';
import { ILocationManager } from './location-manager';
export interface IRouteContext extends RouteContext {
}
export declare const IRouteContext: import("@aurelia/kernel").InterfaceSymbol<IRouteContext>;
type PathGenerationResult = {
    vi: ViewportInstruction;
    query: Record<string, string | string[]>;
};
type EagerInstruction = {
    component: string | RouteConfig | PartialCustomElementDefinition | IRouteViewModel | IChildRouteConfig | RouteType;
    params: Params;
    children?: EagerInstruction[];
};
export declare function createEagerInstructions(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[]): EagerInstruction[];
/**
 * Holds the information of a component in the context of a specific container.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteConfig and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteConfig` for a type is overridden manually via `Route.configure`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
export declare class RouteContext {
    readonly parent: IRouteContext | null;
    private readonly _router;
    readonly routeConfigContext: IRouteConfigContext;
    private readonly _locationMgr;
    readonly root: IRouteContext;
    get isRoot(): boolean;
    get node(): RouteNode;
    /**
     * The viewport hosting the component associated with this RouteContext.
     * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
     */
    get vpa(): ViewportAgent;
    readonly container: IContainer;
    constructor(viewportAgent: ViewportAgent | null, parent: IRouteContext | null, parentContainer: IContainer, _router: IRouter, routeConfigContext: IRouteConfigContext, _locationMgr: ILocationManager);
    /**
     * Create a new `RouteContext` and register it in the provided container.
     *
     * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
     *
     * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
     */
    static setRoot(container: IContainer): void | Promise<void>;
    static resolve(root: IRouteContext, context: unknown): IRouteContext;
    dispose(): void;
    getAvailableViewportAgents(): readonly ViewportAgent[];
    getFallbackViewportAgent(name: string): ViewportAgent | null;
    /**
     * Generates a path that is rooted to the application.
     */
    generateRootedPath(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[]): string | Promise<string>;
    /**
     * Generates a path that is relative to the this context.
     */
    generateRelativePath(instructionOrInstructions: NavigationInstruction | NavigationInstruction[]): string | Promise<string>;
    createViewportInstructions(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], options: INavigationOptions | null): ViewportInstructionTree;
    createViewportInstructions(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], options: INavigationOptions | null, traverseChildren: true): ViewportInstructionTree | Promise<ViewportInstructionTree>;
    toString(): string;
}
export interface IRouteConfigContext extends RouteConfigContext {
}
export declare class RouteConfigContext {
    readonly parent: IRouteConfigContext | null;
    readonly component: CustomElementDefinition;
    readonly config: RouteConfig;
    private readonly _router;
    readonly container: IContainer;
    readonly root: IRouteConfigContext;
    get isRoot(): boolean;
    /**
     * The path from the root RouteContext up to this one.
     */
    readonly path: readonly IRouteConfigContext[];
    get depth(): number;
    get navigationModel(): INavigationModel | null;
    /**
     * The (fully resolved) configured child routes of this context's `RouteConfig`
     */
    readonly childRoutes: (RouteConfig | Promise<RouteConfig>)[];
    get allResolved(): Promise<void> | null;
    constructor(parent: IRouteConfigContext | null, component: CustomElementDefinition, config: RouteConfig, parentContainer: IContainer, _router: IRouter);
    _generateViewportInstruction(instruction: {
        component: string;
        params: Params;
    }): PathGenerationResult | null;
    _generateViewportInstruction(instruction: NavigationInstruction | EagerInstruction | IExtendedViewportInstruction): PathGenerationResult | null;
    _generateViewportInstruction(instruction: NavigationInstruction | EagerInstruction | IExtendedViewportInstruction, traverseChildren: true): PathGenerationResult | Promise<PathGenerationResult> | null;
    recognize(path: string, searchAncestor?: boolean): $RecognizedRoute | null;
    dispose(): void;
}
export declare class $RecognizedRoute {
    readonly route: RecognizedRoute<RouteConfig | Promise<RouteConfig>>;
    readonly residue: string | null;
    constructor(route: RecognizedRoute<RouteConfig | Promise<RouteConfig>>, residue: string | null);
    toString(): string;
}
export interface INavigationModel {
    /**
     * Collection of routes.
     */
    readonly routes: readonly INavigationRoute[];
    /**
     * Wait for async route configurations.
     */
    resolve(): Promise<void> | void;
}
export interface INavigationRoute {
    readonly id: string | null;
    readonly path: string[];
    readonly title: string | ((node: RouteNode) => string | null) | null;
    readonly data: Record<string, unknown>;
    readonly isActive: boolean;
}
export {};
//# sourceMappingURL=route-context.d.ts.map