import { IContainer } from '@aurelia/kernel';
import { CustomElement, IHydratedController, IHydratedParentController, ICustomElementController } from '@aurelia/runtime-html';
import { ComponentAppellation, IRouteableComponent, ReloadBehavior, RouteableComponentType, LoadInstruction } from '../interfaces';
import { IRouter } from '../router';
import { arrayRemove } from '../utilities/utils';
import { ViewportContent } from './viewport-content';
import { RoutingInstruction } from '../instructions/routing-instruction';
import { TransitionAction, RoutingScope } from '../routing-scope';
import { Navigation } from '../navigation';
import { NavigationCoordinator } from '../navigation-coordinator';
import { Runner, Step } from '../utilities/runner';
import { Routes } from '../decorators/routes';
import { Route } from '../route';
import { Endpoint, IConnectedCustomElement } from './endpoint';
import { IViewportOptions, ViewportOptions } from './viewport-options';
import { LifecycleFlags } from '@aurelia/runtime';

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

export class Viewport extends Endpoint {
  /**
   * The contents of the viewport. New contents are pushed to this, making
   * the last one the active one. It always holds at least one content, so
   * that there's always a current content.
   */
  public contents: ViewportContent[] = [];

  /**
   * Whether the viewport content should be cleared and removed,
   * regardless of statefulness (and hooks).
   */
  public forceRemove: boolean = false;

  /**
   * The viewport options.
   */
  public options: ViewportOptions = new ViewportOptions();

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
   */
  private clear: boolean = false;

  /**
   * The coordinators that have transitions on the viewport.
   * Wheneve a new coordinator is pushed, any previous are
   * considered inactive and skips actual transition activities.
   */
  private readonly coordinators: NavigationCoordinator[] = [];

  /**
   * Stores the current state before navigation starts so that it can be restored
   * if navigation is cancelled/interrupted.
   * TODO(post-alpha): Look into using viewport content fully for this
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
    options?: IViewportOptions,
  ) {
    super(router, name, connectedCE);
    this.contents.push(new ViewportContent(router, this, owningScope, hasScope));
    this.contents[0].completed = true;

    if (options !== void 0) {
      this.options.apply(options);
    }
  }

  /**
   * The current content of the endpoint
   */
  public getContent(): ViewportContent {
    // If there's only one content, it's always content
    if (this.contents.length === 1) {
      return this.contents[0];
    }
    let content!: ViewportContent;
    // Go through all contents looking for last completed
    for (let i = 0, ii = this.contents.length; i < ii; i++) {
      if (this.contents[i].completed ?? false) {
        content = this.contents[i];
      } else {
        break;
      }
    }
    return content;
  }

  /**
   * The next, to be transitioned in, content of the endpoint
   */
  public getNextContent(): ViewportContent | null {
    // If there's only one content, it's always content
    if (this.contents.length === 1) {
      return null;
    }
    const lastCompleted = this.contents.indexOf(this.getContent());
    return this.contents.length > lastCompleted ? this.contents[lastCompleted + 1] : null;
  }

  /**
   * The content of the viewport at a specific timestamp.
   *
   * @param timestamp - The timestamp
   */
  public getTimeContent(timestamp: number): ViewportContent | null {
    let content: ViewportContent | null = null;
    // Go through all contents looking for last completed
    for (let i = 0, ii = this.contents.length; i < ii; i++) {
      if (this.contents[i].navigation.timestamp > timestamp) {
        break;
      }
      content = this.contents[i];
    }
    return content;
  }

  /**
   * The content for a specific navigation (or coordinator)
   */
  public getNavigationContent(navigation: NavigationCoordinator | Navigation): ViewportContent | null {
    return super.getNavigationContent(navigation) as ViewportContent | null;
  }

  /**
   * The parent viewport.
   */
  public get parentViewport(): Viewport | null {
    let scope = this.connectedScope;
    while (scope?.parent != null) {
      scope = scope.parent;
      if (scope.endpoint.isViewport) {
        return scope.endpoint as Viewport;
      }
    }
    return null;
  }

  /**
   * Whether the viewport (content) is empty.
   */
  public get isEmpty(): boolean {
    return this.getContent().componentInstance === null;
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
   * Whether a coordinator handles the active navigation.
   *
   * @param coordinator - The coordinator to check
   */
  public isActiveNavigation(coordinator: NavigationCoordinator): boolean {
    return this.coordinators[this.coordinators.length - 1] === coordinator;
  }

  /**
   * For debug purposes.
   */
  public toString(): string {
    const contentName = this.getContent()?.instruction.component.name ?? '';
    const nextContentName = this.getNextContent()?.instruction.component.name ?? '';
    return `v:${this.name}[${contentName}->${nextContentName}]`;
  }

  /**
   * Set the next content for the viewport. Returns the action that the viewport
   * will take when the navigation coordinator starts the transition. Note that a
   * swap isn't guaranteed, current component configuration can result in a skipped
   * transition.
   *
   * @param instruction - The routing instruction describing the next content
   * @param navigation - The navigation that requests the content change
   */
  public setNextContent(instruction: RoutingInstruction, navigation: Navigation): TransitionAction {
    instruction.endpoint.set(this);
    this.clear = instruction.isClear(this.router);

    const content = this.getContent();
    // Can have a (resolved) type or a string (to be resolved later)
    const nextContent = new ViewportContent(this.router, this, this.owningScope, this.scope.hasScope, !this.clear ? instruction : void 0, navigation, this.connectedCE ?? null);
    this.contents.push(nextContent);

    nextContent.fromHistory = nextContent.componentInstance !== null && navigation.navigation
      ? !!navigation.navigation.back || !!navigation.navigation.forward
      : false;

    if (this.options.stateful) {
      // TODO: Add a parameter here to decide required equality
      const cached = this.cache.find((item) => nextContent.isCacheEqual(item));
      if (cached !== void 0) {
        this.contents.splice(this.contents.indexOf(nextContent), 1, cached);
        nextContent.fromCache = true;
      } else {
        this.cache.push(nextContent);
      }
    }

    // If we get the same _instance_, don't do anything (happens with cached and history)
    if (nextContent.componentInstance !== null && content.componentInstance === nextContent.componentInstance) {
      nextContent.delete();
      this.contents.splice(this.contents.indexOf(nextContent), 1);
      return this.transitionAction = 'skip';
    }

    if (!content.equalComponent(nextContent) ||
      navigation.navigation.refresh || // Navigation 'refresh' performed
      content.reloadBehavior === ReloadBehavior.refresh // ReloadBehavior 'refresh' takes precedence
    ) {
      return this.transitionAction = 'swap';
    }

    // If we got here, component is the same name/type

    // Explicitly don't allow navigation back to the same component again
    if (content.reloadBehavior === ReloadBehavior.disallow) {
      nextContent.delete();
      this.contents.splice(this.contents.indexOf(nextContent), 1);
      return this.transitionAction = 'skip';
    }

    // Explicitly re-load same component again
    // TODO(alpha): NEED TO CHECK THIS TOWARDS activeContent REGARDING scope
    if (content.reloadBehavior === ReloadBehavior.reload) {
      content.reload = true;

      nextContent.instruction.component.set(content.componentInstance);
      nextContent.contentStates = content.contentStates.clone();
      nextContent.reload = content.reload;
      return this.transitionAction = 'reload';
    }

    // ReloadBehavior is now 'default'

    // Requires updated parameters if viewport stateful
    if (this.options.stateful &&
      content.equalParameters(nextContent)) {
      nextContent.delete();
      this.contents.splice(this.contents.indexOf(nextContent), 1);
      return this.transitionAction = 'skip';
    }

    if (!content.equalParameters(nextContent)) {
      // TODO: Fix a config option for this
      // eslint-disable-next-line no-constant-condition
      if (false) { // Re-use component, only reload with new parameters
        content.reload = true;
        nextContent.instruction.component.set(content.componentInstance);
        nextContent.contentStates = content.contentStates.clone();
        nextContent.reload = content.reload;
        return this.transitionAction = 'reload';
      } else { // Perform a full swap
        return this.transitionAction = 'swap';
      }
    }

    // Default is to do nothing
    nextContent.delete();
    this.contents.splice(this.contents.indexOf(nextContent), 1);
    return this.transitionAction = 'skip';
  }

  /**
   * Connect a ViewportCustomElement to this viewport endpoint, applying options
   * while doing so.
   *
   * @param connectedCE - The custom element to connect
   * @param options - The options to apply
   */
  public setConnectedCE(connectedCE: IConnectedCustomElement, options: IViewportOptions): void {
    options = options ?? {};
    if (this.connectedCE !== connectedCE) {
      // TODO: Restore this state on navigation cancel
      this.previousViewportState = { ...this };
      this.clearState();
      this.connectedCE = connectedCE;
      this.options.apply(options);
      if (this.connectionResolve != null) {
        this.connectionResolve();
      }
    }

    const parentDefaultRoute = (this.scope.parent?.endpoint.getRoutes() ?? [])
      .filter(route => (Array.isArray(route.path) ? route.path : [route.path]).includes(''))
      .length > 0;
    if (this.getContent().componentInstance === null && this.getNextContent()?.componentInstance == null && (this.options.default || parentDefaultRoute)) {
      const instructions = RoutingInstruction.parse(this.router, this.options.default ?? '');
      if (instructions.length === 0 && parentDefaultRoute) {
        const foundRoute = this.scope.parent?.findInstructions([RoutingInstruction.create('') as RoutingInstruction], false, this.router.configuration.options.useConfiguredRoutes);
        if (foundRoute?.foundConfiguration) {
          instructions.push(...foundRoute.instructions);
        }
      }
      for (const instruction of instructions) {
        // Set to name to be delayed one turn (refactor: not sure why, so changed it)
        instruction.endpoint.set(this);
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
        (innerStep: Step<void>) => {
          if (this.getContent().componentInstance !== null) {
            return this.getContent().freeContent(
              innerStep,
              this.connectedCE,
              (this.getNextContent()?.navigation ?? null),
              this.historyCache,
              this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful
            ); // .catch(error => { throw error; });
          }
        },
        (innerStep: Step<void>) => {
          if (this.doForceRemove) {
            const removes = [];
            for (const content of this.historyCache) {
              removes.push((innerInnerStep: Step<void>) => content.freeContent(
                innerInnerStep,
                null,
                null,
                this.historyCache,
                false,
              ));
            }
            removes.push(() => { this.historyCache = []; });
            return Runner.run(innerStep,
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
  public async transition(coordinator: NavigationCoordinator): Promise<void> {
    const navigatingPrefix = this.router.configuration.options.indicators.viewportNavigating;

    this.coordinators.push(coordinator);
    // If this isn't the first coordinator, a navigation is already in process...
    while (this.coordinators[0] !== coordinator) {
      // ...so first wait for it to finish.
      await this.coordinators[0].waitForSyncState('completed');
    }

    // Get the parent viewport...
    let actingParentViewport = this.parentViewport;
    // ...but not if it's not acting (reloading or swapping)
    if (actingParentViewport !== null
      && actingParentViewport.transitionAction !== 'reload'
      && actingParentViewport.transitionAction !== 'swap'
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
      (step: Step<boolean>) => {
        if (this.isActiveNavigation(coordinator)) {
          return this.canUnload(coordinator, step);
        }
      },

      (step: Step<boolean>) => {
        if (this.isActiveNavigation(coordinator)) {
          if (!(step.previousValue as boolean)) { // canUnloadResult: boolean
            // step.cancel();
            coordinator.cancel();
          } else {
            if (this.router.isRestrictedNavigation) { // Create the component early if restricted navigation
              const routerOptions = this.router.configuration.options;
              this.getNavigationContent(coordinator)!.createComponent(
                this.connectedCE!,
                this.options.fallback || routerOptions.fallback,
                this.options.fallbackAction || routerOptions.fallbackAction);
            }
          }
        }
        coordinator.addEndpointState(this, 'guardedUnload');
      },
      () => coordinator.waitForSyncState('guardedUnload', this), // Awaits all `canUnload` hooks
      () => actingParentViewport !== null ? coordinator.waitForEndpointState(actingParentViewport, 'guardedLoad') : void 0, // Awaits parent `canLoad`

      (step: Step<boolean>) => {
        if (this.isActiveNavigation(coordinator)) {
          return this.canLoad(coordinator, step) as boolean | LoadInstruction | LoadInstruction[];
        }
      },

      (step: Step) => {
        if (this.isActiveNavigation(coordinator)) {
          let canLoadResult = step.previousValue as boolean | LoadInstruction | LoadInstruction[];
          if (typeof canLoadResult === 'boolean') { // canLoadResult: boolean | LoadInstruction | LoadInstruction[],
            if (!canLoadResult) {
              step.cancel();
              coordinator.cancel();
              this.getNavigationContent(coordinator)!.instruction.nextScopeInstructions = null;
              return;
            }
          } else { // Denied and (probably) redirected
            this.getNavigationContent(coordinator)!.instruction.nextScopeInstructions = null;
            if (typeof canLoadResult === 'string') {
              const scope = this.scope;
              const options = this.router.configuration.options;
              let instructions = RoutingInstruction.parse(this.router, canLoadResult);
              const foundRoute = scope.parent?.findInstructions(instructions, options.useDirectRouting, options.useConfiguredRoutes);
              if (foundRoute?.foundConfiguration || foundRoute?.foundInstructions) {
                instructions = foundRoute.instructions;
              }
              for (const instruction of instructions) {
                instruction.endpoint.set(this);
                instruction.scope = scope.owningScope;
              }
              canLoadResult = instructions;
            }
            return Runner.run(step,
              (innerStep: Step<void>) => this.cancelContentChange(coordinator, innerStep),
              (innerStep: Step<void>) => {
                void this.router.load(canLoadResult, { append: true });
                return innerStep.exit();
              },
            );
          }
        }
        coordinator.addEndpointState(this, 'guardedLoad');
        coordinator.addEndpointState(this, 'guarded');
      },
    ];

    // The transition routing hooks, unloading and loading
    const routingSteps = [
      () => coordinator.waitForSyncState('guarded', this),
      (step: Step<void>) => {
        if (this.isActiveNavigation(coordinator)) {
          return this.unload(coordinator, step);
        }
      },
      () => coordinator.addEndpointState(this, 'unloaded'),

      () => coordinator.waitForSyncState('unloaded', this),
      () => actingParentViewport !== null ? coordinator.waitForEndpointState(actingParentViewport, 'loaded') : void 0,
      (step: Step<void>) => {
        if (this.isActiveNavigation(coordinator)) {
          return this.load(coordinator, step);
        }
      },
      () => coordinator.addEndpointState(this, 'loaded'),
      () => coordinator.addEndpointState(this, 'routed'),
    ];

    // The lifecycle hooks, with order and parallelism based on configuration
    const lifecycleSteps: ((step: Step<void | void[]>) => Step<void> | Promise<void> | void)[] = [
      () => coordinator.waitForSyncState('routed', this),
      () => coordinator.waitForEndpointState(this, 'routed'),
    ];

    const swapOrder = this.router.configuration.options.swapOrder;
    switch (swapOrder) {
      case 'detach-current-attach-next':
        lifecycleSteps.push(
          (step) => { if (this.isActiveNavigation(coordinator)) { return this.removeContent(step as Step<void>, coordinator); } },
          (step) => { if (this.isActiveNavigation(coordinator)) { return this.addContent(step as Step<void>, coordinator); } },
        );
        break;
      case 'attach-next-detach-current':
        lifecycleSteps.push(
          (step) => { if (this.isActiveNavigation(coordinator)) { return this.addContent(step as Step<void>, coordinator); } },
          (step) => { if (this.isActiveNavigation(coordinator)) { return this.removeContent(step as Step<void>, coordinator); } },
        );
        break;
      case 'detach-attach-simultaneously':
        lifecycleSteps.push((step): Step<void> =>
          Runner.runParallel(step,
            (innerStep: Step<void>) => { if (this.isActiveNavigation(coordinator)) { return this.removeContent(innerStep, coordinator); } },
            (innerStep: Step<void>) => { if (this.isActiveNavigation(coordinator)) { return this.addContent(innerStep, coordinator); } },
          ) as Step<void>,
        );
        break;
      case 'attach-detach-simultaneously':
        lifecycleSteps.push((step): Step<void> =>
          Runner.runParallel(step,
            (innerStep: Step<void>) => { if (this.isActiveNavigation(coordinator)) { return this.addContent(innerStep, coordinator); } },
            (innerStep: Step<void>) => { if (this.isActiveNavigation(coordinator)) { return this.removeContent(innerStep, coordinator); } },
          ) as Step<void>,
        );
        break;
    }

    lifecycleSteps.push(() => coordinator.addEndpointState(this, 'swapped'));

    // Set activity indicator (class) on the connected custom element
    this.connectedCE?.setActivity?.(navigatingPrefix, true);
    this.connectedCE?.setActivity?.(coordinator.navigation.navigation, true);

    // Run the steps and do the transition
    const result = Runner.run(null,
      (step: Step<void>) => coordinator.setEndpointStep(this, step.root),
      ...guardSteps,
      ...routingSteps,
      ...lifecycleSteps,
      () => coordinator.addEndpointState(this, 'completed'),
      () => coordinator.waitForSyncState('bound'),
      () => {
        this.connectedCE?.setActivity?.(navigatingPrefix, false);
        this.connectedCE?.setActivity?.(coordinator.navigation.navigation, false);
      },
    );

    if (result instanceof Promise) {
      result.catch(_err => { /* Happens when unload or load is prevented. TODO: React? */ });
    }
  }

  /**
   * Check if the current content can be unloaded.
   *
   * @param step - The previous step in this transition Run
   */
  public canUnload(coordinator: NavigationCoordinator, step: Step<boolean> | null): boolean | Promise<boolean> {
    return Runner.run(step,
      (innerStep: Step<boolean>) => {
        return this.getContent().connectedScope.canUnload(coordinator, innerStep);
      },
      (innerStep: Step<boolean>) => {
        if (!(innerStep.previousValue as boolean)) { // canUnloadChildren
          return false;
        }
        return this.getContent().canUnload(coordinator.navigation);
      },
    ) as boolean | Promise<boolean>;
  }

  /**
   * Check if the next content can be loaded.
   *
   * @param step - The previous step in this transition Run
   */
  public canLoad(coordinator: NavigationCoordinator, step: Step<boolean>): boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]> {
    if (this.clear) {
      return true;
    }

    return Runner.run(step,
      () => this.waitForConnected(),
      () => {
        const routerOptions = this.router.configuration.options;
        const navigationContent = this.getNavigationContent(coordinator)!;
        navigationContent.createComponent(
          this.connectedCE!,
          this.options.fallback || routerOptions.fallback,
          this.options.fallbackAction || routerOptions.fallbackAction);

        return navigationContent.canLoad();
      },
    ) as boolean | LoadInstruction | LoadInstruction[] | Promise<boolean | LoadInstruction | LoadInstruction[]>;
  }

  /**
   * Load the next content.
   *
   * @param step - The previous step in this transition Run
   */
  public load(coordinator: NavigationCoordinator, step: Step<void>): Step<void> | void {
    if (this.clear) {
      return;
    }

    return this.getNavigationContent(coordinator)!.load(step);
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
      // TODO: This also needs to be added when coordinator isn't active (and
      // this method isn't called)
      () => coordinator.addEndpointState(this, 'bound'),
      () => coordinator.waitForSyncState('bound'),
      (innerStep: Step<void>) => this.deactivate(
        innerStep,
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
        () => (this.activeContent as ViewportContent).canLoad(), // Only acts if not already checked
        (innerStep: Step<void>) => (this.activeContent as ViewportContent).load(innerStep), // Only acts if not already loaded
        (innerStep: Step<void>) => (this.activeContent as ViewportContent).activateComponent(
          innerStep,
          initiator,
          parent as ICustomElementController,
          flags,
          this.connectedCE!,
          // TODO: This also needs to be added when coordinator isn't active (and
          // this method isn't called)
          () => coordinator?.addEndpointState(this, 'bound'),
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
  public deactivate(step: Step<void> | null, initiator: IHydratedController | null, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    const content = this.getContent();
    if (content?.componentInstance != null &&
      !content.reload &&
      content.componentInstance !== this.getNextContent()?.componentInstance) {

      return content.deactivateComponent(
        step,
        initiator,
        parent as ICustomElementController,
        flags,
        this.connectedCE!,
        this.router.statefulHistory || this.options.stateful
      ) as Promise<void>;
    }
  }

  /**
   * Unload the current content.
   *
   * @param step - The previous step in this transition Run
   */
  public unload(coordinator: NavigationCoordinator, step: Step<void> | null): void | Step<void> {
    return Runner.run(step,
      (unloadStep: Step<void>) => this.getContent().connectedScope.unload(coordinator, unloadStep),
      () => this.getContent().componentInstance != null ? this.getContent().unload(coordinator.navigation ?? null) : void 0,
    ) as Step<void>;
  }

  /**
   * Dispose the current content.
   */
  public dispose(): void {
    if (this.getContent().componentInstance !== null &&
      !this.getContent().reload &&
      this.getContent().componentInstance !== this.getNextContent()?.componentInstance) {
      this.getContent().disposeComponent(
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
  public finalizeContentChange(coordinator: NavigationCoordinator, step: Step<void> | null): void | Step<void> {
    const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
    let nextContent = this.contents[nextContentIndex];
    const previousContent = this.contents[nextContentIndex - 1];
    // const previousContents = this.contents.slice(0, nextContentIndex);

    if (this.clear) {
      const emptyContent = new ViewportContent(this.router, this, this.owningScope, this.scope.hasScope, void 0, nextContent.navigation);
      this.contents.splice(nextContentIndex, 1, emptyContent);
      nextContent.delete();
      nextContent = emptyContent;
    } else {
      nextContent.reload = false;
    }

    previousContent.delete();

    // TODO: Fix this so that multiple removes work!
    // const freeSteps = [];
    // for (const previousContent of previousContents) {
    //   freeSteps.push(
    //     (innerStep: Step<void>) => {
    //       // return previousContent.freeContent(
    //       //   innerStep,
    //       //   this.connectedCE,
    //       //   previousContent.navigation,
    //       //   this.historyCache,
    //       //   this.router.statefulHistory || this.options.stateful)
    //     },
    //     () => previousContent.delete(),
    //   );
    // }

    // return Runner.run(step,
    //   ...freeSteps,
    //   () => {
    // if (nextContent !== null) {
    nextContent.completed = true;
    // }
    this.transitionAction = '';

    nextContent.contentStates.delete('checkedUnload');
    nextContent.contentStates.delete('checkedLoad');

    this.previousViewportState = null;

    const navigatingPrefix = this.router.configuration.options.indicators.viewportNavigating;
    this.connectedCE?.setActivity?.(navigatingPrefix, false);
    this.connectedCE?.setActivity?.(coordinator.navigation.navigation, false);

    let removeable = 0;
    for (let i = 0, ii = nextContentIndex; i < ii; i++) {
      if (!(this.contents[0].navigation.completed ?? false)) {
        break;
      }
      removeable++;
    }
    this.contents.splice(0, removeable);

    arrayRemove(this.coordinators, (coord => coord === coordinator));
    //   }
    // ) as Step<void>;
  }

  /**
   * Cancel the change of content. The next content is freed/discarded.
   *
   * @param step - The previous step in this transition Run
   */
  public cancelContentChange(coordinator: NavigationCoordinator, noExitStep: Step<void> | null = null): void | Step<void> {
    // First cancel content change in all children
    [...new Set(this.scope.children.map(scope => scope.endpoint))].forEach(child => child.cancelContentChange(coordinator, noExitStep));

    const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
    if (nextContentIndex < 0) {
      return;
    }

    const step = coordinator.getEndpointStep(this)?.current ?? null;
    const nextContent = this.contents[nextContentIndex];
    const previousContent = this.contents[nextContentIndex - 1];

    nextContent.instruction.cancelled = true;

    return Runner.run(step,
      (innerStep: Step<void>) => {
        return nextContent.freeContent(
          innerStep,
          this.connectedCE,
          nextContent.navigation,
          this.historyCache,
          this.router.statefulHistory || this.options.stateful);
      },
      () => {
        if (this.previousViewportState) {
          Object.assign(this, this.previousViewportState);
        }
        nextContent?.delete();
        if (nextContent !== null) {
          this.contents.splice(this.contents.indexOf(nextContent), 1);
        }
        this.transitionAction = '';

        previousContent?.contentStates.delete('checkedUnload');
        previousContent?.contentStates.delete('checkedLoad');

        const navigatingPrefix = this.router.configuration.options.indicators.viewportNavigating;
        this.connectedCE?.setActivity?.(navigatingPrefix, false);
        this.connectedCE?.setActivity?.(coordinator.navigation.navigation, false);

        coordinator.removeEndpoint(this);

        arrayRemove(this.coordinators, (coord => coord === coordinator));
      },
      () => {
        if (step !== noExitStep) {
          return step?.exit();
        }
      }
    ) as Step<void>;
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
    return this.options.usedBy.includes(component as string);
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
    const usedBy = this.options.usedBy;
    if (usedBy.length === 0) {
      return true;
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
  public getRoutes(): Route[] {
    const routes = [];
    let componentType = this.getComponentType();
    if (componentType != null) {
      componentType = componentType.constructor === componentType.constructor.constructor
        ? componentType
        : componentType.constructor as RouteableComponentType;

      routes.push(...(Routes.getConfiguration(componentType) ?? []));
    }
    return routes;
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
    } else if (this.router.configuration.options.title.useComponentNames) {
      let name = this.getContentInstruction()!.component.name ?? '';
      // TODO(alpha): Allow list of component prefixes
      const prefix = (this.router.configuration.options.title.componentPrefix ?? '') as string;
      if (name.startsWith(prefix)) {
        name = name.slice(prefix.length);
      }
      name = name.replace('-', ' ');
      title = name.slice(0, 1).toLocaleUpperCase() + name.slice(1);
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
      componentType = (controller.container as
        IContainer & { componentType: RouteableComponentType })
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
    return this.getNextContent()?.instruction ?? this.getContent().instruction ?? null;
  }

  /**
   * Clear the viewport state.
   *
   * TODO: Investigate the need.
   */
  private clearState(): void {
    this.options = ViewportOptions.create();

    const owningScope = this.owningScope;
    const hasScope = this.scope.hasScope;
    this.getContent().delete();
    this.contents.shift(); if (this.contents.length < 1) { throw new Error('no content!'); }
    this.contents.push(new ViewportContent(this.router, this, owningScope, hasScope));
    this.cache = [];
  }

  /**
   * If necessary, get a promise to await until a custom element connects.
   */
  private waitForConnected(): void | Promise<void> {
    if (this.connectedCE === null) {
      return new Promise((resolve) => {
        this.connectionResolve = resolve;
      });
    }
  }
}
