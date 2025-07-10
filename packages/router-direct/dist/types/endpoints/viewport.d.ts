import { IHydratedController, IHydratedParentController } from '@aurelia/runtime-html';
import { ComponentAppellation, IRouteableComponent, LoadInstruction } from '../interfaces';
import { IRouter } from '../router';
import { ViewportContent } from './viewport-content';
import { RoutingInstruction } from '../instructions/routing-instruction';
import { TransitionAction, RoutingScope } from '../routing-scope';
import { Navigation } from '../navigation';
import { NavigationCoordinator } from '../navigation-coordinator';
import { Step } from '../utilities/runner';
import { Route } from '../route';
import { Endpoint, IConnectedCustomElement } from './endpoint';
import { IViewportOptions, ViewportOptions } from './viewport-options';
/**
 * The viewport is an endpoint that encapsulates an au-viewport custom element
 * instance. It always has at least one viewport content -- the current and also
 * the next when the viewport is in a transition -- even though the viewport
 * content can be empty.
 *
 * If a routing instruction is matched to a viewport during a navigation, the
 * router will ask the viewport if the navigation is approved (based on the state
 * of the current content, next content authorization and so on) and if it is,
 * instruct the navigation coordinator to start the viewport's transition when
 * appropriate. The viewport will then orchestrate, with coordination help from
 * the navigation coordinator, the transition between the current content and
 * the next, including calling relevant routing and lifecycle hooks.
 *
 * In addition to the above, the viewport also serves as the router's interface
 * to the loaded content/component and its configuration such as title and
 * configured routes.
 */
export declare class Viewport extends Endpoint {
    /**
     * The contents of the viewport. New contents are pushed to this, making
     * the last one the active one. It always holds at least one content, so
     * that there's always a current content.
     */
    contents: ViewportContent[];
    /**
     * Whether the viewport content should be cleared and removed,
     * regardless of statefulness (and hooks).
     */
    forceRemove: boolean;
    /**
     * The viewport options.
     */
    options: ViewportOptions;
    /**
     * If set by viewport content, it's resolved when viewport has
     * been actived/started binding.
     */
    activeResolve?: ((value?: void | PromiseLike<void>) => void) | null;
    /**
     * If set, it's resolved when viewport custom element has been
     * connected to the viewport endpoint/router.
     */
    private connectionResolve?;
    /**
     * Whether the viewport is being cleared in the transaction.
     */
    private clear;
    /**
     * The coordinators that have transitions on the viewport.
     * Wheneve a new coordinator is pushed, any previous are
     * considered inactive and skips actual transition activities.
     */
    private readonly coordinators;
    /**
     * Stores the current state before navigation starts so that it can be restored
     * if navigation is cancelled/interrupted.
     * TODO(post-alpha): Look into using viewport content fully for this
     */
    private previousViewportState;
    /**
     * The viewport content cache used for statefulness.
     */
    private cache;
    /**
     * The viewport content cache used for history statefulness.
     */
    private historyCache;
    constructor(router: IRouter, 
    /**
     * The name of the viewport
     */
    name: string, 
    /**
     * The connected ViewportCustomElement (if any)
     */
    connectedCE: IConnectedCustomElement | null, 
    /**
     * The routing scope the viewport belongs to/is owned by
     */
    owningScope: RoutingScope, 
    /**
     * Whether the viewport has its own routing scope, containing
     * endpoints it owns
     */
    hasScope: boolean, 
    /**
     * The viewport options.
     */
    options?: IViewportOptions);
    /**
     * The current content of the endpoint
     */
    getContent(): ViewportContent;
    /**
     * The next, to be transitioned in, content of the endpoint
     */
    getNextContent(): ViewportContent | null;
    /**
     * The content of the viewport at a specific timestamp.
     *
     * @param timestamp - The timestamp
     */
    getTimeContent(timestamp: number): ViewportContent | null;
    /**
     * The content for a specific navigation (or coordinator)
     */
    getNavigationContent(navigation: NavigationCoordinator | Navigation): ViewportContent | null;
    /**
     * The parent viewport.
     */
    get parentViewport(): Viewport | null;
    /**
     * Whether the viewport (content) is empty.
     */
    get isEmpty(): boolean;
    /**
     * Whether the viewport content should be cleared and removed,
     * regardless of statefulness (and hooks). If a parent should
     * be removed, the viewport should as well.
     */
    get doForceRemove(): boolean;
    /**
     * Whether a coordinator handles the active navigation.
     *
     * @param coordinator - The coordinator to check
     */
    isActiveNavigation(coordinator: NavigationCoordinator): boolean;
    /**
     * For debug purposes.
     */
    toString(): string;
    /**
     * Set the next content for the viewport. Returns the action that the viewport
     * will take when the navigation coordinator starts the transition. Note that a
     * swap isn't guaranteed, current component configuration can result in a skipped
     * transition.
     *
     * @param instruction - The routing instruction describing the next content
     * @param navigation - The navigation that requests the content change
     */
    setNextContent(instruction: RoutingInstruction, navigation: Navigation): TransitionAction;
    /**
     * Connect a ViewportCustomElement to this viewport endpoint, applying options
     * while doing so.
     *
     * @param connectedCE - The custom element to connect
     * @param options - The options to apply
     */
    setConnectedCE(connectedCE: IConnectedCustomElement, options: IViewportOptions): void;
    remove(step: Step | null, connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean>;
    /**
     * Transition from current content to the next.
     *
     * @param coordinator - The coordinator of the navigation
     */
    transition(coordinator: NavigationCoordinator): Promise<void>;
    /**
     * Check if the current content can be unloaded.
     *
     * @param step - The previous step in this transition Run
     */
    canUnload(coordinator: NavigationCoordinator, step: Step<boolean> | null): boolean | Promise<boolean>;
    /**
     * Check if the next content can be loaded.
     *
     * @param step - The previous step in this transition Run
     */
    canLoad(coordinator: NavigationCoordinator, step: Step<boolean>): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
    /**
     * Load the next content.
     *
     * @param step - The previous step in this transition Run
     */
    load(coordinator: NavigationCoordinator, step: Step<void>): Step<void> | void;
    /**
     * Add (activate) the next content.
     *
     * @param step - The previous step in this transition Run
     * @param coordinator - The navigation coordinator
     */
    addContent(step: Step<void>, coordinator: NavigationCoordinator): void | Step<void>;
    /**
     * Remove (deactivate) the current content.
     *
     * @param step - The previous step in this transition Run
     * @param coordinator - The navigation coordinator
     */
    removeContent(step: Step<void> | null, coordinator: NavigationCoordinator): void | Step<void>;
    /**
     * Activate the next content component, running `load` first. (But it only
     * runs if it's not already run.) Called both when transitioning and when
     * the custom element triggers it.
     *
     * @param step - The previous step in this transition Run
     * @param initiator - The controller that initiates the activate
     * @param parent - The parent controller
     * @param flags - The lifecycle flags for `activate`
     * @param coordinator - The navigation coordinator
     */
    activate(step: Step<void> | null, initiator: IHydratedController | null, parent: IHydratedParentController | null, coordinator: NavigationCoordinator | undefined): void | Step<void>;
    /**
     * Deactivate the current content component. Called both when
     * transitioning and when the custom element triggers it.
     *
     * @param initiator - The controller that initiates the deactivate
     * @param parent - The parent controller
     * @param flags - The lifecycle flags for `deactivate`
     */
    deactivate(step: Step<void> | null, initiator: IHydratedController | null, parent: IHydratedParentController | null): void | Promise<void>;
    /**
     * Unload the current content.
     *
     * @param step - The previous step in this transition Run
     */
    unload(coordinator: NavigationCoordinator, step: Step<void> | null): void | Step<void>;
    /**
     * Dispose the current content.
     */
    dispose(): void;
    /**
     * Finalize the change of content by making the next content the current
     * content. The previously current content is deleted.
     */
    finalizeContentChange(coordinator: NavigationCoordinator, step: Step<void> | null): void | Step<void>;
    /**
     * Cancel the change of content. The next content is freed/discarded.
     *
     * @param step - The previous step in this transition Run
     */
    cancelContentChange(coordinator: NavigationCoordinator, noExitStep?: Step<void> | null): void | Step<void>;
    /**
     * Whether the viewport wants a specific component. Used when
     * matching routing instructions to viewports.
     *
     * @param component - The component to check
     *
     * TODO: Deal with non-string components
     */
    wantComponent(component: ComponentAppellation): boolean;
    /**
     * Whether the viewport accepts a specific component. Used when
     * matching routing instructions to viewports.
     *
     * @param component - The component to check
     *
     * TODO: Deal with non-string components
     */
    acceptComponent(component: ComponentAppellation): boolean;
    /**
     * Free/discard a history cached content containing a specific component.
     *
     * @param step - The previous step in this transition Run
     * @param component - The component to look for
     *
     * TODO: Deal with multiple contents containing the component
     */
    freeContent(step: Step<void> | null, component: IRouteableComponent): void | Promise<void> | Step<void>;
    /**
     * Get any configured routes in the relevant content's component type.
     */
    getRoutes(): Route[];
    /**
     * Get the title for the content.
     *
     * @param navigation - The navigation that requests the content change
     */
    getTitle(navigation: Navigation): string;
    /**
     * Get component type of the relevant, current or next, content.
     */
    private getComponentType;
    /**
     * Get component instance of the relevant, current or next, content.
     */
    private getComponentInstance;
    /**
     * Get routing instruction of the relevant, current or next, content.
     */
    private getContentInstruction;
    /**
     * Clear the viewport state.
     *
     * TODO: Investigate the need.
     */
    private clearState;
    /**
     * If necessary, get a promise to await until a custom element connects.
     */
    private waitForConnected;
}
//# sourceMappingURL=viewport.d.ts.map