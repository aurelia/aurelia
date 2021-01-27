import { Constructable, ResourceType, IContainer, IResourceKind, ResourceDefinition, Key, IResolver, Resolved, IFactory, Transformer, IModule } from '@aurelia/kernel';
import { CustomElementDefinition, ICustomElementController } from '@aurelia/runtime-html';
import { RecognizedRoute } from '@aurelia/route-recognizer';
import { RouteDefinition } from './route-definition.js';
import { ViewportAgent, ViewportRequest } from './viewport-agent.js';
import { ComponentAgent } from './component-agent.js';
import { RouteNode } from './route-tree.js';
import { ResolutionMode } from './router.js';
import { IViewport } from './resources/viewport.js';
import { Routeable } from './route.js';
export interface IRouteContext extends RouteContext {
}
export declare const IRouteContext: import("@aurelia/kernel").InterfaceSymbol<IRouteContext>;
/**
 * Holds the information of a component in the context of a specific container. May or may not have statically configured routes.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteDefinition and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteDefinition` for a type is overridden manually via `Route.define`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
export declare class RouteContext implements IContainer {
    readonly parent: IRouteContext | null;
    readonly component: CustomElementDefinition;
    readonly definition: RouteDefinition;
    readonly parentContainer: IContainer;
    private readonly childViewportAgents;
    readonly root: IRouteContext;
    get isRoot(): boolean;
    /**
     * The path from the root RouteContext up to this one.
     */
    readonly path: readonly IRouteContext[];
    get depth(): number;
    /**
     * The stringified path from the root RouteContext up to this one, consisting of the component names they're associated with, separated by slashes.
     *
     * Mainly for debugging/introspection purposes.
     */
    readonly friendlyPath: string;
    /**
     * The (fully resolved) configured child routes of this context's `RouteDefinition`
     */
    readonly childRoutes: (RouteDefinition | Promise<RouteDefinition>)[];
    private _resolved;
    private _allResolved;
    private prevNode;
    private _node;
    get node(): RouteNode;
    set node(value: RouteNode);
    private _vpa;
    /**
     * The viewport hosting the component associated with this RouteContext.
     * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
     */
    get vpa(): ViewportAgent;
    set vpa(value: ViewportAgent);
    private readonly moduleLoader;
    private readonly logger;
    private readonly container;
    private readonly hostControllerProvider;
    private readonly recognizer;
    constructor(viewportAgent: ViewportAgent | null, parent: IRouteContext | null, component: CustomElementDefinition, definition: RouteDefinition, parentContainer: IContainer);
    /**
     * Create a new `RouteContext` and register it in the provided container.
     *
     * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
     *
     * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
     */
    static setRoot(container: IContainer): void;
    static resolve(root: IRouteContext, context: unknown): IRouteContext;
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
    register(...params: unknown[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T>;
    registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void;
    createChild(): IContainer;
    disposeResolvers(): void;
    find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null;
    create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null;
    dispose(): void;
    resolveViewportAgent(req: ViewportRequest): ViewportAgent;
    getAvailableViewportAgents(resolution: ResolutionMode): readonly ViewportAgent[];
    /**
     * Create a component based on the provided viewportInstruction.
     *
     * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
     * @param routeNode - The routeNode that describes the component + state.
     */
    createComponentAgent(hostController: ICustomElementController, routeNode: RouteNode): ComponentAgent;
    registerViewport(viewport: IViewport): ViewportAgent;
    unregisterViewport(viewport: IViewport): void;
    recognize(path: string): $RecognizedRoute | null;
    addRoute(routeable: Promise<IModule>): Promise<void>;
    addRoute(routeable: Exclude<Routeable, Promise<IModule>>): void | Promise<void>;
    private $addRoute;
    resolveLazy(promise: Promise<IModule>): Promise<CustomElementDefinition> | CustomElementDefinition;
    toString(): string;
    private printTree;
}
export declare class $RecognizedRoute {
    readonly route: RecognizedRoute<RouteDefinition | Promise<RouteDefinition>>;
    readonly residue: string | null;
    constructor(route: RecognizedRoute<RouteDefinition | Promise<RouteDefinition>>, residue: string | null);
}
//# sourceMappingURL=route-context.d.ts.map