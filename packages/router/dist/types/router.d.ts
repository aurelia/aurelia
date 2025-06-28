import { IContainer } from '@aurelia/kernel';
import { CustomElementDefinition } from '@aurelia/runtime-html';
import { IRouteContext, RouteConfigContext } from './route-context';
import { ManagedState, RoutingTrigger } from './router-events';
import { RouteConfig, RouteType } from './route';
import { IRouteViewModel } from './component-agent';
import { RouteTree } from './route-tree';
import { IViewportInstruction, NavigationInstruction, RouteContextLike, ViewportInstructionTree } from './instructions';
import { type ViewportAgent } from './viewport-agent';
import { INavigationOptions, NavigationOptions, type RouterOptions } from './options';
export declare function isManagedState(state: {} | null): state is ManagedState;
export declare function toManagedState(state: {} | null, navId: number): ManagedState;
export declare class Transition {
    readonly id: number;
    readonly prevInstructions: ViewportInstructionTree;
    readonly instructions: ViewportInstructionTree;
    finalInstructions: ViewportInstructionTree;
    readonly instructionsChanged: boolean;
    readonly trigger: RoutingTrigger;
    readonly options: NavigationOptions;
    readonly managedState: ManagedState | null;
    readonly previousRouteTree: RouteTree;
    routeTree: RouteTree;
    readonly promise: Promise<boolean> | null;
    readonly resolve: ((success: boolean) => void) | null;
    readonly reject: ((err: unknown) => void) | null;
    guardsResult: boolean | ViewportInstructionTree;
    error: unknown;
    get erredWithUnknownRoute(): boolean;
    private constructor();
    toString(): string;
}
export interface IRouter extends Router {
}
export declare const IRouter: import("@aurelia/kernel").InterfaceSymbol<IRouter>;
export declare class Router {
    get routeTree(): RouteTree;
    get currentTr(): Transition;
    get isNavigating(): boolean;
    readonly options: Readonly<RouterOptions>;
    constructor();
    start(performInitialNavigation: boolean): void | Promise<boolean>;
    stop(): void;
    /**
     * Loads the provided path.
     *
     * Examples:
     *
     * ```ts
     * // Load the route 'product-detail', as a child of the current component, with child route '37'.
     * router.load('product-detail/37', { context: this });
     * ```
     */
    load(path: string, options?: INavigationOptions): Promise<boolean>;
    /**
     * Loads the provided paths as siblings.
     *
     * Examples:
     *
     * ```ts
     * router.load(['category/50/product/20', 'widget/30']);
     * ```
     */
    load(paths: readonly string[], options?: INavigationOptions): Promise<boolean>;
    /**
     * Loads the provided component type. Must be a custom element.
     *
     * Examples:
     *
     * ```ts
     * router.load(ProductList);
     * router.load(CustomElement.define({ name: 'greeter', template: 'Hello!' }));
     * ```
     */
    load(componentType: RouteType, options?: INavigationOptions): Promise<boolean>;
    /**
     * Loads the provided component types. Must be custom elements.
     *
     * Examples:
     *
     * ```ts
     * router.load([MemberList, OrganizationList]);
     * ```
     */
    load(componentTypes: readonly RouteType[], options?: INavigationOptions): Promise<boolean>;
    /**
     * Loads the provided component instance.
     *
     * Examples:
     *
     * ```ts
     * // Given an already defined custom element named Greeter
     * const greeter = new Greeter();
     * Controller.$el(container, greeter, host);
     * router.load(greeter);
     * ```
     */
    load(componentInstance: IRouteViewModel, options?: INavigationOptions): Promise<boolean>;
    /**
     * Loads the provided ViewportInstruction, with component specified in any of the ways as described
     * in the other method overloads, and optional additional properties.
     *
     * Examples:
     *
     * ```ts
     * router.load({ component: 'product-detail', parameters: { id: 37 } })
     * router.load({ component: ProductDetail, parameters: { id: 37 } })
     * router.load({ component: 'category', children: ['product(id=20)'] })
     * router.load({ component: 'category', children: [{ component: 'product', parameters: { id: 20 } }] })
     * ```
     */
    load(viewportInstruction: IViewportInstruction, options?: INavigationOptions): boolean | Promise<boolean>;
    load(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], options?: INavigationOptions): boolean | Promise<boolean>;
    isActive(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], context: RouteContextLike): boolean;
    private readonly _routeConfigLookup;
    private readonly _vpaLookup;
    /**
     * Retrieve the RouteContext, which contains statically configured routes combined with the customElement metadata associated with a type.
     *
     * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
     *
     * @param viewportAgent - The ViewportAgent hosting the component associated with this RouteContext. If the RouteContext for the component+viewport combination already exists, the ViewportAgent will be updated in case it changed.
     * @param componentDefinition - The custom element definition.
     * @param container - The `controller.container` of the component hosting the viewport that the route will be loaded into.
     *
     */
    getRouteContext(viewportAgent: ViewportAgent | null, componentDefinition: CustomElementDefinition, componentInstance: IRouteViewModel | null, container: IContainer, parentRouteConfig: RouteConfig | null, parentContext: IRouteContext | null, $rdConfig: RouteConfig | null): IRouteContext | Promise<IRouteContext>;
    getRouteConfigContext($rdConfig: RouteConfig | null, componentDefinition: CustomElementDefinition, componentInstance: IRouteViewModel | null, container: IContainer, parentRouteConfig: RouteConfig | null, parentRouteConfigContext: RouteConfigContext | null): RouteConfigContext | Promise<RouteConfigContext>;
    /**
     * Generate a path from the provided instructions.
     *
     * @param instructionOrInstructions - The navigation instruction(s) to generate the path for.
     * @param context - The context to use for relative navigation. If not provided, the root context is used.
     */
    generatePath(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], context?: RouteContextLike): string | Promise<string>;
    createViewportInstructions(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], options: INavigationOptions | null): ViewportInstructionTree;
    createViewportInstructions(instructionOrInstructions: NavigationInstruction | NavigationInstruction[], options: INavigationOptions | null, traverseChildren: true): ViewportInstructionTree | Promise<ViewportInstructionTree>;
    updateTitle(tr?: Transition): string;
}
//# sourceMappingURL=router.d.ts.map