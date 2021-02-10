import { LifecycleFlags, ICompiledRenderContext, CustomElement, IHydratedController, IHydratedParentController } from '@aurelia/runtime-html';
import { ComponentAppellation, IRouteableComponent, ReentryBehavior, RouteableComponentType, LoadInstruction } from './interfaces.js';
import { IRouter } from './router.js';
import { arrayRemove } from './utilities/utils.js';
import { ViewportContent } from './viewport-content.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { NextContentAction, RoutingScope } from './routing-scope.js';
import { Navigation } from './navigation.js';
import { NavigationCoordinator } from './navigation-coordinator.js';
import { Runner, Step } from './utilities/runner.js';
import { Routes } from './decorators/routes.js';
import { Route } from './route.js';
import { Endpoint, IEndpointOptions, IRoutingController, IConnectedCustomElement } from './endpoints/endpoint.js';
import { RouterConfiguration } from './index.js';

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
export interface IViewportOptions extends IEndpointOptions {
  /**
   * Whether the viewport has its own scope (owns other endpoints)
   */
  scope?: boolean;

  /**
   * A list of components that is using the viewport. These components
   * can only be loaded into this viewport and this viewport can't
   * load any other components.
   */
  usedBy?: string | string[];

  /**
   * The default component that's loaded if the viewport is created
   * without having a component specified (in that navigation).
   */
  default?: string;

  /**
   * The component loaded if the viewport can't load the specified
   * component. The component is passed as a parameter to the fallback.
   */
  fallback?: string;

  /**
   * The viewport doesn't add its content to the Location URL.
   */
  noLink?: boolean;

  /**
   * The viewport doesn't add a title to the browser window title.
   */
  noTitle?: boolean;

  /**
   * The viewport's content is stateful.
   */
  stateful?: boolean;

  /**
   * The viewport is always added to the routing instruction.
   */
  forceDescription?: boolean;
}

export class Viewport extends Endpoint {
  public static lastTransitionId = 0;

  /**
   * The current content of the viewport.
   */
  public content: ViewportContent;
  /**
   * The next, to be transitioned in, content of the viewport.
   */
  public nextContent: ViewportContent | null = null;

  /**
   * Whether the viewport content should be cleared and removed,
   * regardless of statefulness (and hooks).
   */
  public forceRemove: boolean = false;

  /**
   * If set by viewport content, it's resolved when viewport has
   * been actived/started binding.
   */
  public activeResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;

  /**
   * If set, it's resolved when viewport custom element has been
   * connected to the viewport endpoint/router.
   */
  private connectionResolve?: ((value?: void | PromiseLike<void>) => void) | null = null;

  /**
   * Whether the viewport is being cleared in the transaction.
   * TODO: Replace `clear` with state of next content routing instruction
   */
  private clear: boolean = false;

  /**
   * Stores the current state before navigation starts so that it can be restored
   * if navigation is cancelled/interrupted.
   * TODO: Look into using viewport content fully for this
   */
  private previousViewportState: Viewport | null = null;

  /**
   * The viewport content cache used for statefulness.
   */
  private cache: ViewportContent[] = [];

  /**
   * The viewport content cache used for history statefulness.
   */
  private historyCache: ViewportContent[] = [];

  /**
   * Store the navigation/transition coordinator for debug purposes.
   * TODO: Remove
   */
  private coordinator?: NavigationCoordinator;

  public constructor(
    router: IRouter,

    /**
     * The name of the viewport
     */
    name: string,

    /**
     * The connected ViewportCustomElement (if any)
     */
    connectedCE: IConnectedCustomElement | null,

    /**
     * The routing scope the viewport belongs to/is owned by.
     */
    private readonly _owningScope: RoutingScope,

    /**
     * The viewport's routing scope, containing endpoints it owns.
     *
     * TODO(alpha): Investigate merging/removing this
     */
    private readonly _scope: boolean,

    /**
     * The viewport options.
     */
    public options: IViewportOptions = {}
  ) {
    super(router, name, connectedCE, _owningScope, _scope);
    this.content = new ViewportContent(router, this, _owningScope, _scope);
  }

  /**
   * The routing scope that's currently, based on content, connected
   * to the viewport. The scope used when finding next scope endpoints
   * and configured routes.
   *
   * TODO(alpha): Investigate merging/removing this
   */
  public get scope(): RoutingScope {
    return this.connectedScope.scope;
  }

  /**
   * The routing scope that currently, based on content, owns the viewport.
   *
   * TODO(alpha): Investigate merging/removing this
   */
  public get owningScope(): RoutingScope {
    return this.connectedScope.owningScope!;
  }

  /**
   * The connected custom element's controller.
   */
  public get connectedController(): IRoutingController | null {
    return this.connectedCE?.controller ?? null;
  }

  /**
   * The parent viewport.
   */
  public get parentViewport(): Viewport | null {
    let scope = this.connectedScope;
    while (scope.parent !== null) {
      scope = scope.parent;
      if (scope.endpoint.isViewport) {
        return scope.endpoint as Viewport;
      }
    }
    return null;
  }

  /**
   * This is a viewport.
   */
  public get isViewport(): boolean {
    return true;
  }

  /**
   * Whether the viewport (content) is empty.
   */
  public get isEmpty(): boolean {
    return this.content.componentInstance === null;
  }

  /**
   * Whether the viewport content should be cleared and removed,
   * regardless of statefulness (and hooks). If a parent should
   * be removed, the viewport should as well.
   */
  public get doForceRemove(): boolean {
    let scope: RoutingScope | null = this.connectedScope;
    while (scope !== null) {
      if (scope.isViewport && (scope.endpoint as Viewport).forceRemove) {
        return true;
      }
      scope = scope.parent;
    }
    return false;
  }

  /**
   * For debug purposes.
   */
  public toString(): string {
    const contentName = this.content?.instruction.component.name ?? '';
    const nextContentName = this.nextContent?.instruction.component.name ?? '';
    return `v:${this.name}[${contentName}->${nextContentName}]`;
  }

  /**
   * Set the next content for the viewport. Returns the action that the viewport
   * will take when the navigation coordinator starts the transition. Note that a
   * swap isn't guaranteed, current component configuration can result in a skipped
   * transition.
   *
   * @param routingInstruction - The routing instruction describing the next content
   * @param navigation - The navigation that requests the content change
   */
  public setNextContent(routingInstruction: RoutingInstruction, navigation: Navigation): NextContentAction {
    routingInstruction.viewport.set(this);
    this.clear = routingInstruction.isClear;

    // Can have a (resolved) type or a string (to be resolved later)
    this.nextContent = new ViewportContent(this.router, this, this._owningScope, this._scope, !this.clear ? routingInstruction : void 0, navigation, this.connectedCE ?? null);

    this.nextContent.fromHistory = this.nextContent.componentInstance && navigation.navigation
      ? !!navigation.navigation.back || !!navigation.navigation.forward
      : false;

    if (this.options.stateful) {
      // TODO: Add a parameter here to decide required equality
      const cached = this.cache.find((item) => this.nextContent!.isCacheEqual(item));
      if (cached) {
        this.nextContent = cached;
        this.nextContent.fromCache = true;
      } else {
        this.cache.push(this.nextContent);
      }
    }

    // If we get the same _instance_, don't do anything (happens with cached and history)
    if (this.nextContent.componentInstance !== null && this.content.componentInstance === this.nextContent.componentInstance) {
      this.nextContent.delete();
      this.nextContent = null;
      return this.nextContentAction = 'skip'; // false;
    }

    if (!this.content.equalComponent(this.nextContent) ||
      navigation.navigation.refresh || // Navigation 'refresh' performed
      this.content.reentryBehavior() === ReentryBehavior.refresh // ReentryBehavior 'refresh' takes precedence
    ) {
      return this.nextContentAction = 'swap';
    }

    // Component is the same name/type

    // Explicitly don't allow navigation back to the same component again
    if (this.content.reentryBehavior() === ReentryBehavior.disallow) {
      this.nextContent.delete();
      this.nextContent = null;
      return this.nextContentAction = 'skip';
    }

    // Explicitly re-load same component again
    // TODO(alpha): NEED TO CHECK THIS TOWARDS activeContent REGARDING scope
    if (this.content.reentryBehavior() === ReentryBehavior.load) {
      this.content.reentry = true;

      this.nextContent.instruction.component.set(this.content.componentInstance!);
      this.nextContent.contentStates = this.content.contentStates.clone();
      this.nextContent.reentry = this.content.reentry;
      return this.nextContentAction = 'reload'; // true;
    }

    // ReentryBehavior is now 'default'

    // Requires updated parameters if viewport stateful
    if (this.options.stateful &&
      this.content.equalParameters(this.nextContent)) {
      this.nextContent.delete();
      this.nextContent = null;
      return this.nextContentAction = 'skip';
    }

    if (!this.content.equalParameters(this.nextContent)) {
      // TODO: Fix a config option for this
      // eslint-disable-next-line no-constant-condition
      if (false) { // Re-use component, only reload with new parameters
        this.content.reentry = true;
        this.nextContent!.instruction.component.set(this.content.componentInstance!);
        this.nextContent!.contentStates = this.content.contentStates.clone();
        this.nextContent!.reentry = this.content.reentry;
        return this.nextContentAction = 'reload';
      } else { // Perform a full swap
        return this.nextContentAction = 'swap';
      }
    }

    // Default is to do nothing
    this.nextContent.delete();
    this.nextContent = null;
    return this.nextContentAction = 'skip';

    // Default is to trigger a refresh (without a check of parameters)
    // return this.nextContentAction = 'reload';
  }

  /**
   * Connect a ViewportCustomElement to this viewport endpoint, applying options
   * while doing so.
   *
   * @param connectedCE - The custom element to connect
   * @param options - The options to apply
   */
  public setConnectedCE(connectedCE: IConnectedCustomElement, options: IViewportOptions): void {
    options = options || {};
    if (this.connectedCE !== connectedCE) {
      // TODO: Restore this state on navigation cancel
      this.previousViewportState = { ...this };
      this.clearState();
      this.connectedCE = connectedCE;
      if (options.usedBy) {
        this.options.usedBy = options.usedBy;
      }
      if (options.default) {
        this.options.default = options.default;
      }
      if (options.fallback) {
        this.options.fallback = options.fallback;
      }
      if (options.noLink) {
        this.options.noLink = options.noLink;
      }
      if (options.noTitle) {
        this.options.noTitle = options.noTitle;
      }
      if (options.noHistory) {
        this.options.noHistory = options.noHistory;
      }
      if (options.stateful) {
        this.options.stateful = options.stateful;
      }
      if (this.connectionResolve) {
        this.connectionResolve();
      }
    }

    if (!this.content.componentInstance && (!this.nextContent || !this.nextContent.componentInstance) && this.options.default) {
      const instructions = RoutingInstruction.parse(this.options.default);
      for (const instruction of instructions) {
        // Set to name to be delayed one turn (refactor: not sure why, so changed it)
        instruction.viewport.set(this);
        instruction.scope = this.owningScope;
        instruction.default = true;
      }
      this.router.load(instructions, { append: true }).catch(error => { throw error; });
    }
  }

  // TODO(alpha): Look into this!
  public remove(step: Step | null, connectedCE: IConnectedCustomElement | null): boolean | Promise<boolean> {
    // TODO: Review this: should it go from promise to value somewhere?
    if (this.connectedCE === connectedCE) {
      return Runner.run(step,
        (step: Step<void>) => {
          if (this.content.componentInstance) {
            return this.content.freeContent(
              step,
              this.connectedCE,
              (this.nextContent ? this.nextContent.navigation : null),
              this.historyCache,
              this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful
            ); // .catch(error => { throw error; });
          }
        },
        (step: Step<void>) => {
          if (this.doForceRemove) {
            const removes = [];
            for (const content of this.historyCache) {
              removes.push((step: Step<void>) => content.freeContent(
                step,
                null,
                null,
                this.historyCache,
                false,
              ));
            }
            removes.push(() => { this.historyCache = []; });
            return Runner.run(step,
              ...removes,
            );
          }
          return true;
        }
      ) as boolean | Promise<boolean>;
    }
    return false;
  }

  /**
   * Transition from current content to the next.
   *
   * @param coordinator - The coordinator of the navigation
   */
  public transition(coordinator: NavigationCoordinator): void {
    this.coordinator = coordinator;
    // console.log('Viewport transition', transitionId, this.toString());

    // Get the parent viewport...
    let actingParentViewport = this.parentViewport;
    // ...but not if it's not acting (reloading or swapping)
    if (actingParentViewport !== null
      && actingParentViewport.nextContentAction !== 'reload'
      && actingParentViewport.nextContentAction !== 'swap'
    ) {
      actingParentViewport = null;
    }
    // If actingParentViewport has a value, that viewport's routing
    // hooks needs to be awaited before starting this viewport's
    // corresponding routing hook.

    // First create a list with the steps that should run in the order
    // they should run and then, at the end, run them. Each hook step
    // registers its completeness with the navigation coordinator, which
    // keeps track of entity/endpoint transition states and restrictions
    // as well as pausing continuation if needed.

    // The transition guard hooks, canUnload and canLoad, both of which
    // can cancel the entire navigation
    const guardSteps = [
      (step: Step<boolean>) => this.canUnload(step),
      (step: Step<boolean>) => {
        if (!(step.previousValue as boolean)) { // canUnloadResult: boolean
          step.cancel();
          coordinator.cancel();
        } else {
          if (this.router.isRestrictedNavigation) { // Create the component early if restricted navigation
            this.nextContent!.createComponent(this.connectedCE!, this.options.fallback);
          }
        }
        coordinator.addEntityState(this, 'guardedUnload');
      },
      () => coordinator.waitForSyncState('guardedUnload', this), // Awaits all `canUnload` hooks
      () => actingParentViewport !== null ? coordinator.waitForEntityState(actingParentViewport, 'guardedLoad') : void 0, // Awaits parent `canLoad`

      (step: Step<boolean>) => this.canLoad(step) as boolean | LoadInstruction | LoadInstruction[],
      (step: Step) => {
        const canLoadResult = step.previousValue as boolean | LoadInstruction | LoadInstruction[];
        if (typeof canLoadResult === 'boolean') { // canLoadResult: boolean | LoadInstruction | LoadInstruction[],
          if (!canLoadResult) {
            step.cancel();
            coordinator.cancel();
            return;
          }
          coordinator.addEntityState(this, 'guardedLoad');
          coordinator.addEntityState(this, 'guarded');
        } else { // Denied and (probably) redirected
          return Runner.run(step,
            () => this.router.load(canLoadResult, { append: true }),
            (innerStep: Step<void>) => this.abortContentChange(innerStep),
          );
        }
      },
    ];

    // The transition routing hooks, unload and load
    const routingSteps = [
      () => coordinator.waitForSyncState('guarded', this),
      (step: Step<void>) => this.unload(step),
      () => coordinator.addEntityState(this, 'unloaded'),

      () => coordinator.waitForSyncState('unloaded', this),
      () => actingParentViewport !== null ? coordinator.waitForEntityState(actingParentViewport, 'loaded') : void 0,
      (step: Step<void>) => this.load(step),
      () => coordinator.addEntityState(this, 'loaded'),
      () => coordinator.addEntityState(this, 'routed'),
    ];

    // The lifecycle hooks, with order and parallelism based on configuration
    const lifecycleSteps: ((step: Step<void | void[]>) => Step<void> | Promise<void> | void)[] = [
      () => coordinator.waitForSyncState('routed', this),
      () => coordinator.waitForEntityState(this, 'routed'),
    ];

    const swapOrder = RouterConfiguration.options.swapStrategy;
    switch (swapOrder) {
      case 'remove-first-sequential':
        lifecycleSteps.push(
          (step: Step<void | void[]>) => this.removeContent(step as Step<void>, coordinator),
          (step: Step<void | void[]>) => this.addContent(step as Step<void>, coordinator),
        );
        break;
      case 'add-first-sequential':
        lifecycleSteps.push(
          (step: Step<void | void[]>) => this.addContent(step as Step<void>, coordinator),
          (step: Step<void | void[]>) => this.removeContent(step as Step<void>, coordinator),
        );
        break;
      case 'remove-first-parallel':
        lifecycleSteps.push((step: Step<void | void[]>): Step<void> =>
          Runner.runParallel(step as Step<void>,
            (innerStep: Step<void>) => this.removeContent(innerStep, coordinator),
            (innerStep: Step<void>) => this.addContent(innerStep, coordinator),
          ) as Step<void>,
        );
        break;
      case 'add-first-parallel':
        lifecycleSteps.push((step: Step<void | void[]>): Step<void> =>
          Runner.runParallel(step as Step<void>,
            (innerStep: Step<void>) => this.addContent(innerStep, coordinator),
            (innerStep: Step<void>) => this.removeContent(innerStep, coordinator),
          ) as Step<void>,
        );
        break;
    }

    lifecycleSteps.push(() => coordinator.addEntityState(this, 'swapped'));

    // Set activity indicator (class) on the connected custom element
    this.connectedCE?.setActive?.(true);

    // Run the steps and do the transition
    Runner.run(null,
      ...guardSteps,
      ...routingSteps,
      ...lifecycleSteps,
      () => coordinator.addEntityState(this, 'completed'),
      () => coordinator.waitForSyncState('bound'),
      () => this.connectedCE?.setActive?.(false),
    );
  }

  /**
   * Check if the current content can be unloaded.
   *
   * @param step - The previous step in this transition Run
   */
  public canUnload(step: Step<boolean> | null): boolean | Promise<boolean> {
    return Runner.run(step,
      (innerStep: Step<boolean>) => {
        return this.content.connectedScope.canUnload(innerStep);
      },
      (innerStep: Step<boolean>) => {
        if (!(innerStep.previousValue as boolean)) { // canUnloadChildren
          return false;
        }
        return this.content.canUnload(this.nextContent?.navigation ?? null);
      },
    ) as boolean | Promise<boolean>;
  }

  /**
   * Check if the next content can be loaded.
   *
   * @param step - The previous step in this transition Run
   */
  public canLoad(step: Step<boolean>): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    if (this.clear) {
      return true;
    }

    if ((this.nextContent?.instruction ?? null) === null) {
      console.log('===== ERROR: no next content instruction!', this.nextContent, this.clear);
      return true;
    }

    return Runner.run(step,
      () => this.waitForConnected(),
      () => {
        this.nextContent!.createComponent(this.connectedCE!, this.options.fallback);

        return this.nextContent!.canLoad();
      },
    ) as boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
  }

  /**
   * Load the next content.
   *
   * @param step - The previous step in this transition Run
   */
  public load(step: Step<void>): Step<void> | void {
    if (this.clear || (this.nextContent?.componentInstance ?? null) === null) {
      return;
    }

    return this.nextContent?.load(step);
  }

  /**
   * Add (activate) the next content.
   *
   * @param step - The previous step in this transition Run
   * @param coordinator - The navigation coordinator
   */
  public addContent(step: Step<void>, coordinator: NavigationCoordinator): void | Step<void> {
    return this.activate(step, null, this.connectedController, LifecycleFlags.none, coordinator);
  }

  /**
   * Remove (deactivate) the current content.
   *
   * @param step - The previous step in this transition Run
   * @param coordinator - The navigation coordinator
   */
  public removeContent(step: Step<void> | null, coordinator: NavigationCoordinator): void | Step<void> {
    if (this.isEmpty) {
      return;
    }

    const manualDispose = this.router.statefulHistory || (this.options.stateful ?? false);
    return Runner.run(step,
      () => coordinator.addEntityState(this, 'bound'),
      () => coordinator.waitForSyncState('bound'),
      () => this.deactivate(
        null,
        this.connectedController,
        manualDispose ? LifecycleFlags.none : LifecycleFlags.dispose
      ),
      () => manualDispose ? this.dispose() : void 0,
    ) as Step<void>;
  }

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
  public activate(step: Step<void> | null, initiator: IHydratedController | null, parent: IHydratedParentController | null, flags: LifecycleFlags, coordinator: NavigationCoordinator | undefined): void | Step<void> {
    if ((this.activeContent as ViewportContent).componentInstance !== null) {
      return Runner.run(step,
        (innerStep: Step<void>) => (this.activeContent as ViewportContent).load(innerStep), // Only acts if not already loaded
        (innerStep: Step<void>) => (this.activeContent as ViewportContent).activateComponent(
          innerStep,
          this,
          initiator,
          parent as IRoutingController,
          flags,
          this.connectedCE!,
          () => coordinator?.addEntityState(this, 'bound'),
          coordinator?.waitForSyncState('bound'),
        ),
      ) as Step<void>;
    }
  }

  /**
   * Deactivate the current content component. Called both when
   * transitioning and when the custom element triggers it.
   *
   * @param initiator - The controller that initiates the deactivate
   * @param parent - The parent controller
   * @param flags - The lifecycle flags for `deactivate`
   */
  public deactivate(initiator: IHydratedController | null, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.content.componentInstance &&
      !this.content.reentry &&
      this.content.componentInstance !== this.nextContent?.componentInstance) {

      return this.content?.deactivateComponent(
        initiator,
        parent as IRoutingController,
        flags,
        this.connectedCE!,
        this.router.statefulHistory || this.options.stateful
      );
    }
  }

  /**
   * Unload the current content.
   *
   * @param step - The previous step in this transition Run
   */
  public unload(step: Step<void> | null): void | Step<void> {
    return Runner.run(step,
      (unloadStep: Step<void>) => this.content.connectedScope.unload(unloadStep),
      () => this.content.componentInstance != null ? this.content.unload(this.nextContent?.navigation ?? null) : void 0,
    ) as Step<void>;
  }

  /**
   * Dispose the current content.
   */
  public dispose(): void {
    if (this.content.componentInstance &&
      !this.content.reentry &&
      this.content.componentInstance !== this.nextContent?.componentInstance) {
      this.content.disposeComponent(
        this.connectedCE!,
        this.historyCache,
        this.router.statefulHistory || this.options.stateful
      );
    }
  }

  /**
   * Finalize the change of content by making the next content the current
   * content. The previously current content is deleted.
   */
  public finalizeContentChange(): void {
    const previousContent = this.content;
    if (this.nextContent?.componentInstance != null) {
      this.content = this.nextContent;
      this.content.reentry = false;
    }

    if (this.clear) {
      this.content = new ViewportContent(this.router, this, this._owningScope, this._scope, void 0, this.nextContent!.navigation);
      this.nextContent?.delete();
    }
    previousContent.delete();

    this.nextContent = null;
    this.nextContentAction = '';

    this.content.contentStates.delete('checkedUnload');
    this.content.contentStates.delete('checkedLoad');

    this.previousViewportState = null;

    this.connectedCE?.setActive?.(false);
  }

  /**
   * Abort the change of content. The next content is freed/discarded.
   *
   * @param step - The previous step in this transition Run
   */
  public abortContentChange(step: Step<void> | null): void | Step<void> {
    return Runner.run(step,
      (step: Step<void>) => {
        if (this.nextContent != null) {
          return this.nextContent.freeContent(
            step,
            this.connectedCE,
            this.nextContent.navigation,
            this.historyCache,
            this.router.statefulHistory || this.options.stateful);
        }
      },
      () => {
        if (this.previousViewportState) {
          Object.assign(this, this.previousViewportState);
        }
        this.nextContent?.delete();
        this.nextContent = null;
        this.nextContentAction = '';

        this.content.contentStates.delete('checkedUnload');
        this.content.contentStates.delete('checkedLoad');

        this.connectedCE?.setActive?.(false);
      }) as Step<void>;
  }

  /**
   * Whether the viewport wants a specific component. Used when
   * matching routing instructions to viewports.
   *
   * @param component - The component to check
   *
   * TODO: Deal with non-string components
   */
  public wantComponent(component: ComponentAppellation): boolean {
    let usedBy = this.options.usedBy ?? [];
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    return usedBy.includes(component as string);
  }

  /**
   * Whether the viewport accepts a specific component. Used when
   * matching routing instructions to viewports.
   *
   * @param component - The component to check
   *
   * TODO: Deal with non-string components
   */
  public acceptComponent(component: ComponentAppellation): boolean {
    if (component === '-' || component === null) {
      return true;
    }
    let usedBy = this.options.usedBy ?? [];
    if (usedBy.length === 0) {
      return true;
    }
    if (typeof usedBy === 'string') {
      usedBy = usedBy.split(',');
    }
    if (usedBy.includes(component as string)) {
      return true;
    }
    if (usedBy.filter((value) => value.includes('*')).length) {
      return true;
    }
    return false;
  }

  /**
   * Free/discard a history cached content containing a specific component.
   *
   * @param step - The previous step in this transition Run
   * @param component - The component to look for
   *
   * TODO: Deal with multiple contents containing the component
   */
  public freeContent(step: Step<void> | null, component: IRouteableComponent): void | Promise<void> | Step<void> {
    const content = this.historyCache.find(cached => cached.componentInstance === component);
    if (content !== void 0) {
      return Runner.run(step,
        (innerStep: Step<void>) => {
          this.forceRemove = true;
          return content.freeContent(
            innerStep,
            null,
            null,
            this.historyCache,
            false,
          );
        },
        () => {
          this.forceRemove = false;
          arrayRemove(this.historyCache, (cached => cached === content));
        },
      );
    }
  }

  /**
   * Get any configured routes in the relevant content's component type.
   */
  public getRoutes(): Route[] | null {
    let componentType = this.getComponentType();
    if (componentType === null) {
      return null;
    }
    componentType = componentType.constructor === componentType.constructor.constructor
      ? componentType
      : componentType.constructor as RouteableComponentType;

    const routes: Route[] = Routes.getConfiguration(componentType);
    return Array.isArray(routes) ? routes : null;
  }

  /**
   * Get the title for the content.
   *
   * @param navigation - The navigation that requests the content change
   */
  public getTitle(navigation: Navigation): string {
    if (this.options.noTitle) {
      return '';
    }
    const componentType = this.getComponentType();
    if (componentType === null) {
      return '';
    }
    let title = '';
    const typeTitle = componentType.title;
    if (typeTitle !== void 0) {
      if (typeof typeTitle === 'string') {
        title = typeTitle;
      } else {
        const component = this.getComponentInstance();
        title = typeTitle.call(component, component!, navigation);
      }
    } else if (RouterConfiguration.options.title.useComponentNames) {
      let name = this.getContentInstruction()!.component.name ?? '';
      // TODO(alpha): Allow list of component prefixes
      const prefix = (RouterConfiguration.options.title.componentPrefix ?? '') as string;
      if (name.startsWith(prefix)) {
        name = name.slice(prefix.length);
      }
      name = name.replace('-', ' ');
      title = name.slice(0, 1).toLocaleUpperCase() + name.slice(1);
    }
    if (RouterConfiguration.options.title.transformTitle !== void 0) {
      title = RouterConfiguration.options.title.transformTitle.call(this, title, this.getContentInstruction()!);
    }
    return title;
  }

  /**
   * Get component type of the relevant, current or next, content.
   */
  private getComponentType(): RouteableComponentType | null {
    let componentType = this.getContentInstruction()!.component.type ?? null;
    if (componentType === null) {
      const controller = CustomElement.for(this.connectedCE!.element);
      componentType = (controller.context as
        ICompiledRenderContext & { componentType: RouteableComponentType })
        .componentType;
    }
    return componentType ?? null;
  }

  /**
   * Get component instance of the relevant, current or next, content.
   */
  private getComponentInstance(): IRouteableComponent | null {
    return this.getContentInstruction()!.component.instance ?? null;
  }

  /**
   * Get routing instruction of the relevant, current or next, content.
   */
  private getContentInstruction(): RoutingInstruction | null {
    return this.nextContent?.instruction ?? this.content.instruction ?? null;
  }

  /**
   * Clear the viewport state.
   *
   * TODO: Investigate the need.
   */
  private clearState(): void {
    this.options = {};

    this.content.delete();
    this.content = new ViewportContent(this.router, this, this._owningScope, this._scope);
    this.cache = [];
  }

  /**
   * Wait, if necessary, for a custom element to connect.
   */
  private waitForConnected(): void | Promise<void> {
    if (this.connectedCE === null) {
      return new Promise((resolve) => {
        this.connectionResolve = resolve;
      });
    }
  }
}
