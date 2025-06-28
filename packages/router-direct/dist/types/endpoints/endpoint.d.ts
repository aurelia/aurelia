import { IContainer } from '@aurelia/kernel';
import { ICustomElementController, ICustomElementViewModel } from '@aurelia/runtime-html';
import { LoadInstruction, IRouter, TransitionAction, RoutingScope, Step, Route, RoutingInstruction, Navigation, NavigationCoordinator, IViewportOptions, IViewportScopeOptions, EndpointContent, Viewport, ViewportScope, NavigationFlags } from '../index';
/**
 * An endpoint is anything that can receive and process a routing instruction.
 */
/**
 * Additional properties for endpoint custom elements.
 */
export interface IConnectedCustomElement extends ICustomElementViewModel {
    element: HTMLElement;
    container: IContainer;
    controller: ICustomElementController;
    setActivity?: (state: string | NavigationFlags, active: boolean) => void;
}
export interface IEndpointOptions {
    /**
     * The transitions in the endpoint shouldn't be added to the navigation history
     */
    noHistory?: boolean;
}
export type EndpointType = Viewport | ViewportScope;
export type EndpointTypeName = 'Viewport' | 'ViewportScope';
export interface IEndpoint extends Endpoint {
}
export declare class Endpoint {
    readonly router: IRouter;
    /**
     * The endpoint name
     */
    name: string;
    /**
     * The custom element connected to this endpoint
     */
    connectedCE: IConnectedCustomElement | null;
    options: IEndpointOptions;
    /**
     * The contents of the endpoint. New contents are pushed to this, making
     * the last one the active one.
     */
    contents: EndpointContent[];
    /**
     * The action (to be) performed by the transition
     */
    transitionAction: TransitionAction;
    /**
     * The configured route path to this endpoint
     */
    path: string | null;
    constructor(router: IRouter, 
    /**
     * The endpoint name
     */
    name: string, 
    /**
     * The custom element connected to this endpoint
     */
    connectedCE: IConnectedCustomElement | null, options?: IEndpointOptions);
    /**
     * The current content of the endpoint
     */
    getContent(): EndpointContent;
    /**
     * The next, to be transitioned in, content of the endpoint
     */
    getNextContent(): EndpointContent | null;
    /**
     * The content of the endpoint from a specific time (index)
     */
    getTimeContent(_timestamp?: number): EndpointContent | null;
    /**
     * The content for a specific navigation (or coordinator)
     */
    getNavigationContent(navigation: NavigationCoordinator | Navigation): EndpointContent | null;
    /**
     * The active content, next or current.
     */
    get activeContent(): EndpointContent;
    /**
     * The routing scope that's currently, based on content, connected
     * to the endpoint. This is always the actually connected scope.
     */
    get connectedScope(): RoutingScope;
    /**
     * The current, based on content, routing scope for the endpoint.
     * The scope used when finding next scope endpoints and configured routes.
     */
    get scope(): RoutingScope;
    /**
     * The routing scope that currently, based on content, owns the viewport.
     */
    get owningScope(): RoutingScope;
    /**
     * The connected custom element's controller.
     */
    get connectedController(): ICustomElementController | null;
    /**
     * Whether the endpoint is a Viewport.
     */
    get isViewport(): boolean;
    /**
     * Whether the endpoint is a ViewportScope.
     */
    get isViewportScope(): boolean;
    /**
     * Whether the endpoint is empty. Overloaded with proper check
     * by Viewport and ViewportScope.
     */
    get isEmpty(): boolean;
    /**
     * For debug purposes.
     */
    get pathname(): string;
    /**
     * For debug purposes.
     */
    toString(): string;
    /**
     * Set the next content for the endpoint. Returns the action that the endpoint
     * will take when the navigation coordinator starts the transition.
     *
     * @param _instruction - The routing instruction describing the next content
     * @param _navigation - The navigation that requests the content change
     */
    setNextContent(_instruction: RoutingInstruction, _navigation: Navigation): TransitionAction;
    /**
     * Connect an endpoint CustomElement to this endpoint, applying options
     * while doing so.
     *
     * @param _connectedCE - The custom element to connect
     * @param _options - The options to apply
     */
    setConnectedCE(_connectedCE: IConnectedCustomElement, _options: IViewportOptions | IViewportScopeOptions): void;
    /**
     * Transition from current content to the next.
     *
     * @param _coordinator - The coordinator of the navigation
     */
    transition(_coordinator: NavigationCoordinator): void;
    /**
     * Finalize the change of content by making the next content the current
     * content. The previously current content is deleted.
     */
    finalizeContentChange(_coordinator: NavigationCoordinator, _step: Step<void> | null): void;
    /**
     * Abort the change of content. The next content is freed/discarded.
     *
     * @param _step - The previous step in this transition Run
     */
    cancelContentChange(_coordinator: NavigationCoordinator, _noExitStep?: Step<void> | null): void | Step<void>;
    /**
     * Get any configured routes in the relevant content's component type.
     */
    getRoutes(): Route[];
    /**
     * Get the title for the content.
     *
     * @param navigation - The navigation that requests the content change
     */
    getTitle(_navigation: Navigation): string;
    /**
     * Remove the endpoint, deleting its contents.
     *
     * @param _step - The previous step in this transition Run
     * @param _connectedCE - The custom element that's being removed
     */
    removeEndpoint(_step: Step | null, _connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean>;
    /**
     * Check if the next content can be unloaded.
     *
     * @param step - The previous step in this transition Run
     */
    canUnload(_coordinator: NavigationCoordinator, _step: Step<boolean> | null): boolean | Promise<boolean>;
    /**
     * Check if the next content can be loaded.
     *
     * @param step - The previous step in this transition Run
     */
    canLoad(_coordinator: NavigationCoordinator, _step: Step<boolean>): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
    /**
     * Unload the next content.
     *
     * @param step - The previous step in this transition Run
     */
    unload(_coordinator: NavigationCoordinator, _step: Step<void> | null): void | Step<void>;
    /**
     * Load the next content.
     *
     * @param step - The previous step in this transition Run
     */
    load(_coordinator: NavigationCoordinator, _step: Step<void>): Step<void> | void;
}
//# sourceMappingURL=endpoint.d.ts.map