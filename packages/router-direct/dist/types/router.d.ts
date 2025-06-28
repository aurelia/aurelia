import { ICustomElementViewModel, ICustomElementController } from '@aurelia/runtime-html';
import { LoadInstruction } from './interfaces';
import { Viewport } from './endpoints/viewport';
import { RoutingInstruction } from './instructions/routing-instruction';
import { RoutingScope } from './routing-scope';
import { ViewportScope } from './endpoints/viewport-scope';
import { BrowserViewerStore } from './browser-viewer-store';
import { Navigation } from './navigation';
import { Endpoint, EndpointTypeName, IConnectedCustomElement } from './endpoints/endpoint';
import { NavigationCoordinator } from './navigation-coordinator';
import { Step } from './utilities/runner';
import { IRouterConfiguration } from './index';
/**
 * The router is the "main entry point" into routing. Its primary responsibilities are
 * - provide configuration api
 * - provide api for adding and finding endpoints (viewport and viewport scope)
 * - provide api for connecting endpoint custom elements to endpoints
 * - provide navigation/load api and inform the navigator about navigation/load instructions
 * - provide informational api regarding ongoing navigation
 * - receive a navigation (instruction) from the navigator and process it
 * - invoke routing hooks when appropriate
 *
 * All navigations roughly follows the same flow:
 * 1) A user action (link click, browser navigation, api call) results in a set of
 * LoadInstructions to the Router, prepared by the corresponding handler (LinkHandler,
 * BrowserViewerStore and Router respectively).
 * 2) The Router enriches the LoadInstruction(s) into a Navigation that's sent to the Navigator.
 * 3) The Navigator enriches the Navigation further, queues it and sends it to the Router for
 * processing.
 * 4) The Router turns, with help from the RoutingScopes, the Navigation into a set of
 * RoutingInstructions.
 * 5) The RoutingInstructions are then, again with the help of the RoutingScopes, matched
 * to the appropriate Endpoints.
 * 6) The Endpoints are informed of their RoutingInstructions.
 * 7) If one of the Endpoints disapprove of their RoutingInstructions (based on the state of
 * their current content, authorization and so on) the Navigation is cancelled.
 * 8) If the Navigation is approved, the Endpoints are instructed to perform their transitions.
 * 9) Once all transitions are completed, the Router informs the Navigatior about the success
 * and the new, complete state.
 * 10) The Navigator saves the new state in the right place (if any) in history and informs
 * the BrowserViewerStore about the new current state.
 * 11) The BrowserViewerStore sends the new state to the browser's Viewer (browser Location url
 * and title) and Store (browser History).
 */
/**
 * Options for loading new routing instructions.
 */
export interface ILoadOptions {
    /**
     * The title to use for this load
     */
    title?: string;
    /**
     * The query string to use/set with this load
     */
    query?: string;
    /**
     * The fragment to use/set with this load
     */
    fragment?: string;
    /**
     * The parameters to use for this load. If specified and no `query` is
     * specified, `query` will be created and set based on this.
     */
    parameters?: string | Record<string, unknown>;
    /**
     * Data that's passed along (untouched) with the navigation
     */
    data?: Record<string, unknown>;
    /**
     * Whether the navigation should replace the current one in navigation
     * (and browser) history. Default: false
     */
    replace?: boolean;
    /**
     * Whether the instructions should be appended to a navigation coordinator,
     * the coordinator of the current navigation in progress (if any). If no
     * current navigation is in progress, the instructions will be treated as
     * a new navigation. Default: false
     */
    append?: boolean | NavigationCoordinator;
    /**
     * The origin of the navigation. Will also be used as context if no
     * context is specified.
     */
    origin?: ICustomElementViewModel | Element;
    /**
     * The (starting) context of the navigation. If no context is specified,
     * origin, if specified, will be used instead.
     */
    context?: ICustomElementViewModel | Element | Node | ICustomElementController;
    /**
     * Modifies that (starting) scope, based on `context`, by either going up
     * `../` or to root `/`.
     */
    scopeModifier?: string;
}
export declare const IRouter: import("@aurelia/kernel").InterfaceSymbol<IRouter>;
export interface IRouter extends Router {
}
export declare class Router implements IRouter {
    static readonly closestEndpointKey: string;
    /**
     * The root viewport scope.
     */
    rootScope: ViewportScope | null;
    /**
     * The active navigation.
     */
    activeNavigation: Navigation;
    /**
     * The active routing instructions.
     */
    activeComponents: RoutingInstruction[];
    /**
     * Instructions that are appended between navigations and should be appended
     * to next navigation. (This occurs during startup, when there's no navigation
     * to append viewport default instructions to.)
     */
    appendedInstructions: RoutingInstruction[];
    /**
     * Whether the router is active/started
     */
    isActive: boolean;
    /**
     * The currently active coordinators (navigations)
     */
    private readonly coordinators;
    /**
     * Whether the first load has happened
     */
    private loadedFirst;
    private readonly ea;
    /**
     * The viewer (browser) that displays url, navigation buttons
     */
    viewer: BrowserViewerStore;
    /**
     * The store (browser) that stores navigations
     */
    store: BrowserViewerStore;
    /**
     * The router configuration
     */
    configuration: IRouterConfiguration;
    /**
     * Whether the router is currently navigating.
     */
    get isNavigating(): boolean;
    /**
     * Whether the router has a navigation that's open for more
     * instructions to be appended.
     */
    get hasOpenNavigation(): boolean;
    /**
     * Whether navigations are restricted/synchronized beyond the minimum.
     */
    get isRestrictedNavigation(): boolean;
    /**
     * Start the router, activing the event listeners.
     */
    start(): void;
    /**
     * Stop the router.
     */
    stop(): void;
    /**
     * Get a named endpoint of a specific type.
     *
     * @param type - The type of endpoint to get
     * @param name - The name of the endpoint to get
     */
    getEndpoint(type: EndpointTypeName, name: string): Endpoint | null;
    /**
     * Get all endpoints of a specific type.
     *
     * @param type - The type of the endpoints to get
     * @param includeDisabled - Whether disabled/non-active endpoints should be included
     * @param includeReplaced - Whether replaced endpoints should be included
     */
    allEndpoints(type: EndpointTypeName | null, includeDisabled?: boolean): Viewport[];
    /**
     * Public API (not yet implemented)
     */
    addEndpoint(_type: EndpointTypeName, ..._args: unknown[]): unknown;
    /**
     * Disconnect an custom element endpoint from an endpoint. Called from the
     * custom elements of endpoints.
     *
     * @param step - The previous step in this transition Run
     * @param endpoint - The endpoint to disconnect from
     * @param connectedCE - The custom element to disconnect
     */
    disconnectEndpoint(step: Step | null, endpoint: Viewport | ViewportScope, connectedCE: IConnectedCustomElement): void;
    /**
     * Load navigation instructions.
     *
     * @param instructions - The instructions to load
     * @param options - The options to use when loading the instructions
     */
    load(instructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions): Promise<boolean | void>;
    /**
     * Apply the load options on the instructions.
     *
     * @param loadInstructions - The instructions to load
     * @param options - The load options to apply when loading the instructions
     * @param keepString - Whether the load instructions should remain as a string (if it's a string)
     *
     */
    applyLoadOptions(loadInstructions: LoadInstruction | LoadInstruction[], options: ILoadOptions, keepString?: boolean): {
        instructions: string | RoutingInstruction[];
        scope: RoutingScope | null;
    };
    /**
     * Refresh/reload the current navigation
     */
    refresh(): Promise<boolean | void>;
    /**
     * Go one step back in navigation history.
     */
    back(): Promise<boolean | void>;
    /**
     * Go one step forward in navigation history.
     */
    forward(): Promise<boolean | void>;
    /**
     * Go a specified amount of steps back or forward in navigation history.
     *
     * @param delta - The amount of steps to go. A positive number goes
     * forward, a negative goes backwards.
     */
    go(delta: number): Promise<boolean | void>;
    /**
     * Check whether a set of instructions are active. All instructions need
     * to be active for the condition to be true.
     *
     * @param instructions - The instructions to check
     * @param options - The load options to apply to the instructions to check
     */
    checkActive(instructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions): boolean;
    /**
     * Deal with/throw an unresolved instructions error.
     *
     * @param navigation - The failed navigation
     * @param instructions - The unresovled instructions
     */
    unresolvedInstructionsError(navigation: Navigation, instructions: RoutingInstruction[]): void;
    /**
     * Cancel a navigation (without it being an error).
     *
     * @param navigation - The navigation to cancel
     * @param coordinator - The coordinator for the navigation
     */
    cancelNavigation(navigation: Navigation, coordinator: NavigationCoordinator): void;
    /**
     * Append instructions to the current navigation.
     *
     * @param instructions - The instructions to append
     * @param scope - The scope of the instructions
     */
    appendInstructions(instructions: RoutingInstruction[], scope?: RoutingScope | null, coordinator?: NavigationCoordinator | null): void;
    /**
     * Update the navigation with full state, url, query string and title. The
     * appropriate hooks are called. The `activeComponents` are also set.
     *
     * @param navigation - The navigation to update
     */
    private updateNavigation;
}
export declare class RouterEvent {
    readonly eventName: string;
    constructor(eventName: string);
}
export declare class RouterStartEvent extends RouterEvent {
    static eventName: 'au:router:router-start';
    static create(): RouterStartEvent;
}
export declare class RouterStopEvent extends RouterEvent {
    static eventName: 'au:router:router-stop';
    static create(): RouterStopEvent;
}
export declare class RouterNavigationEvent {
    readonly eventName: string;
    readonly navigation: Navigation;
    constructor(eventName: string, navigation: Navigation);
}
export declare class RouterNavigationStartEvent extends RouterNavigationEvent {
    static readonly eventName: 'au:router:navigation-start';
    static create(navigation: Navigation): RouterNavigationStartEvent;
}
export declare class RouterNavigationEndEvent extends RouterNavigationEvent {
    static readonly eventName: 'au:router:navigation-end';
    static create(navigation: Navigation): RouterNavigationEndEvent;
}
export declare class RouterNavigationCancelEvent extends RouterNavigationEvent {
    static readonly eventName: 'au:router:navigation-cancel';
    static create(navigation: Navigation): RouterNavigationCancelEvent;
}
export declare class RouterNavigationCompleteEvent extends RouterNavigationEvent {
    static readonly eventName: 'au:router:navigation-complete';
    static create(navigation: Navigation): RouterNavigationCompleteEvent;
}
export declare class RouterNavigationErrorEvent extends RouterNavigationEvent {
    static readonly eventName: 'au:router:navigation-error';
    static create(navigation: Navigation): RouterNavigationErrorEvent;
}
//# sourceMappingURL=router.d.ts.map