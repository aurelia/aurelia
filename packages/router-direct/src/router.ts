/* eslint-disable prefer-template */
/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { DI, IContainer, Registration, IEventAggregator, IDisposable, Protocol, ILogger, resolve } from '@aurelia/kernel';
import { CustomElementType, ICustomElementViewModel, IAppRoot, ICustomElementController } from '@aurelia/runtime-html';
import { LoadInstruction } from './interfaces';
import { Navigator, NavigatorNavigateEvent } from './navigator';
import { arrayUnique } from './utilities/utils';
import { Viewport } from './endpoints/viewport';
import { IViewportOptions } from './endpoints/viewport-options';
import { RoutingInstruction } from './instructions/routing-instruction';
import { RoutingScope } from './routing-scope';
import { ViewportScope } from './endpoints/viewport-scope';
import { BrowserViewerStore, NavigatorStateChangeEvent } from './browser-viewer-store';
import { Navigation } from './navigation';
import { Endpoint, EndpointTypeName, IConnectedCustomElement } from './endpoints/endpoint';
import { NavigationCoordinator } from './navigation-coordinator';
import { Runner, Step } from './utilities/runner';
import { Title } from './title';
import { RoutingHook } from './routing-hook';
import { IRouterConfiguration } from './index';
import { ErrorNames, createMappedError } from './errors';
import { Separators } from './router-options';

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

  /**
   * Whether the browser (url, history navigation) is the cause of the
   * navigation.
   *
   * @internal
   */
  fromBrowser?: boolean;
  /**
   * Whether the navigation should replace the current one in navigation
   * (and browser) history. If true, overrides `replace`. Default: false
   *
   * @internal
   */
  replacing?: boolean;
}

export const IRouter = /*@__PURE__*/DI.createInterface<IRouter>('IRouter', x => x.singleton(Router));
export interface IRouter extends Router { }

export class Router implements IRouter {

  public static readonly closestEndpointKey = Protocol.annotation.keyFor('closest-endpoint');

  /**
   * The root viewport scope.
   */
  public rootScope: ViewportScope | null = null;

  /**
   * The active navigation.
   */
  public activeNavigation!: Navigation;

  /**
   * The active routing instructions.
   */
  public activeComponents: RoutingInstruction[] = [];

  /**
   * Instructions that are appended between navigations and should be appended
   * to next navigation. (This occurs during startup, when there's no navigation
   * to append viewport default instructions to.)
   */
  public appendedInstructions: RoutingInstruction[] = [];

  /**
   * Whether the router is active/started
   */
  public isActive: boolean = false;

  /**
   * The currently active coordinators (navigations)
   */
  private readonly coordinators: NavigationCoordinator[] = [];

  /**
   * Whether the first load has happened
   */
  private loadedFirst: boolean = false;

  /** @internal */
  private _navigatorStateChangeEventSubscription!: IDisposable;
  /** @internal */
  private _navigatorNavigateEventSubscription!: IDisposable;

  /**
   * Is processing navigation
   *
   * @internal
   */
  private _isProcessingNav: boolean = false;
  /**
   * Pending navigation
   *
   * @internal
   */
  private _pendingNavigation?: NavigatorNavigateEvent;
  /** @internal */
  private readonly _logger = resolve(ILogger);

  /**
   * @internal
   */
  public readonly container = resolve(IContainer);
  private readonly ea = resolve(IEventAggregator);

  /**
   * The navigator that manages navigation queue and history
   *
   * @internal
   */
  public navigator = resolve(Navigator);

  /**
   * The viewer (browser) that displays url, navigation buttons
   */
  public viewer = resolve(BrowserViewerStore);

  /**
   * The store (browser) that stores navigations
   */
  public store = resolve(BrowserViewerStore);

  /**
   * The router configuration
   */
  public configuration = resolve(IRouterConfiguration);

  /**
   * Whether the router is currently navigating.
   */
  public get isNavigating(): boolean {
    return this.coordinators.length > 0;
  }

  /**
   * Whether the router has a navigation that's open for more
   * instructions to be appended.
   */
  public get hasOpenNavigation(): boolean {
    return this.coordinators.filter(coordinator => !coordinator.closed).length > 0;
  }

  /**
   * Whether navigations are restricted/synchronized beyond the minimum.
   */
  public get isRestrictedNavigation(): boolean {
    const syncStates = this.configuration.options.navigationSyncStates;
    return syncStates.includes('guardedLoad') ||
      syncStates.includes('unloaded') ||
      syncStates.includes('loaded') ||
      syncStates.includes('guarded') ||
      syncStates.includes('routed');
  }

  /**
   * Whether navigation history is stateful
   *
   * @internal
   */
  public get statefulHistory(): boolean {
    return this.configuration.options.statefulHistoryLength !== void 0 && this.configuration.options.statefulHistoryLength > 0;
  }

  /**
   * Start the router, activing the event listeners.
   */
  public start(): void {
    if (this.isActive) {
      throw createMappedError(ErrorNames.router_started);
    }
    this.isActive = true;

    const root = this.container.get(IAppRoot);
    // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
    this.rootScope = new ViewportScope(this, 'rootScope', root.controller.viewModel as IConnectedCustomElement, null, true, root.config.component as CustomElementType);

    const options = this.configuration.options;
    // If base path isn't configured...
    if (options.basePath === null) {
      // ...get it from baseURI (base element href)
      const url = new URL(root.host.baseURI);
      options.basePath = url.pathname;
    }
    // Base path shouldn't end with '/' (to differentiate absolutes from relative)
    if (options.basePath.endsWith('/')) {
      options.basePath = options.basePath.slice(0, -1);
    }

    this.navigator.start({
      store: this.store,
      viewer: this.viewer,
      statefulHistoryLength: this.configuration.options.statefulHistoryLength,
    });

    this._navigatorStateChangeEventSubscription = this.ea.subscribe(NavigatorStateChangeEvent.eventName, this.handleNavigatorStateChangeEvent);
    this._navigatorNavigateEventSubscription = this.ea.subscribe(NavigatorNavigateEvent.eventName, this.handleNavigatorNavigateEvent);
    this.viewer.start({ useUrlFragmentHash: this.configuration.options.useUrlFragmentHash });

    this.ea.publish(RouterStartEvent.eventName, RouterStartEvent.create());
  }

  /**
   * Stop the router.
   */
  public stop(): void {
    if (!this.isActive) {
      throw createMappedError(ErrorNames.router_not_started);
    }
    this.ea.publish(RouterStopEvent.eventName, RouterStopEvent.create());
    this.navigator.stop();
    this.viewer.stop();

    this._navigatorStateChangeEventSubscription.dispose();
    this._navigatorNavigateEventSubscription.dispose();
  }

  /**
   * Perform the initial load, using the current url.
   *
   * @internal
   */
  public async initialLoad(): Promise<boolean | void> {
    const { instruction, hash } = this.viewer.viewerState;
    const result = this.load(
      instruction,
      {
        fragment: hash,
        replacing: true,
        fromBrowser: false
      });
    this.loadedFirst = true;
    return result;
  }

  /**
   * Handle the navigator's navigate event.
   *
   * @param event - The event to handle
   *
   * @internal
   */
  private readonly handleNavigatorNavigateEvent = (event: NavigatorNavigateEvent): void => {
    void this._doHandleNavigatorNavigateEvent(event);
  };

  /** @internal */
  private async _doHandleNavigatorNavigateEvent(event: NavigatorNavigateEvent): Promise<void> {
    // TODO: Fix the fast-switch multiple navigations issue without this throttle
    if (this._isProcessingNav) {
      // We prevent multiple navigation at the same time, but we store the last navigation requested.
      if (this._pendingNavigation) {
        // This pending navigation is cancelled
        this._pendingNavigation.navigation.process?.resolve(false);
      }
      this._pendingNavigation = event;
      return;
    }
    this._isProcessingNav = true;

    try {
      await this.processNavigation(event.navigation);
    } catch (error) {
      event.navigation.process?.reject(error);
    } finally {
      this._isProcessingNav = false;
    }

    if (this._pendingNavigation) {
      const pending = this._pendingNavigation;
      this._pendingNavigation = undefined;
      await this._doHandleNavigatorNavigateEvent(pending);
    }
  }

  /**
   * Is processing navigation
   *
   * @internal
   */
  public get isProcessingNav(): boolean {
    return this._isProcessingNav || this._pendingNavigation != null;
  }

  /**
   * Handle the navigator's state change event.
   *
   * @param event - The event to handle
   *
   * @internal
   */
  private readonly handleNavigatorStateChangeEvent = (event: NavigatorStateChangeEvent): void => {
    // It's already a proper navigation (browser history or cache), go
    // directly to navigate
    if (event.state?.navigationIndex != null) {
      const entry = Navigation.create(event.state.navigations[event.state.navigationIndex]);
      entry.instruction = event.viewerState.instruction;
      entry.fromBrowser = true;
      this.navigator.navigate(entry).catch(error => { throw error; });
    } else {
      this.load(
        event.viewerState.instruction,
        { fromBrowser: true }
      ).catch(error => { throw error; });
    }
  };

  /**
   * Processes the route/instructions in a (queued) navigation.
   *
   * @param evNavigation - The navigation to process
   *
   * @internal
   */
  public processNavigation = async (navigation: Navigation): Promise<void> => {
    // To avoid race condition double triggering at refresh
    this.loadedFirst = true;

    const options = this.configuration.options;

    // Get and initialize a navigation coordinator that will keep track of all endpoint's progresses
    // and make sure they're in sync when they are supposed to be (no `canLoad` before all `canUnload`
    // and so on).
    const coordinator = NavigationCoordinator.create(this, navigation, { syncStates: this.configuration.options.navigationSyncStates });
    this.coordinators.push(coordinator);

    // If there are instructions appended between/before any navigation,
    // append them to this navigation. (This happens with viewport defaults
    // during startup.)
    coordinator.appendInstructions(this.appendedInstructions.splice(0));

    this.ea.publish(RouterNavigationStartEvent.eventName, RouterNavigationStartEvent.create(navigation));

    // Invoke the transformFromUrl hook if it exists
    let transformedInstruction;
    // If we're using full state instruction, use that...
    if (navigation.useFullStateInstruction) {
      // ...and extract query and fragment from it
      transformedInstruction = navigation.fullStateInstruction;
      let options: ILoadOptions = {};
      ({ instructions: transformedInstruction, options } = this._extractFragmentAndQuery(transformedInstruction, options) as { instructions: string; options: ILoadOptions });
      navigation.fragment = options.fragment ?? navigation.fragment;
      navigation.query = options.query ?? navigation.query;
      navigation.parameters = (options.parameters as Record<string, unknown>) ?? navigation.parameters;
    } else {
      // If we're not using full state instruction, transform the instruction, invoking
      // the transformFromUrl hook if it exists
      transformedInstruction = typeof navigation.instruction === 'string'
        ? await RoutingHook.invokeTransformFromUrl(navigation.instruction, coordinator.navigation)
        : navigation.instruction;
    }

    // If app uses a base path remove it if present (unless we're using fragment hash)
    const basePath = options.basePath;
    if (basePath !== null &&
      typeof transformedInstruction === 'string' && transformedInstruction.startsWith(basePath) &&
      !options.useUrlFragmentHash) {
      transformedInstruction = transformedInstruction.slice(basePath.length);
    }

    // TODO: Review this
    if (transformedInstruction === '/') {
      transformedInstruction = '';
    }

    if (typeof transformedInstruction === 'string') {
      if (transformedInstruction === '') {
        transformedInstruction = [new RoutingInstruction('')]; // Make sure empty route is also processed
        transformedInstruction[0].default = true;
      } else if (transformedInstruction === '-') {
        transformedInstruction = [new RoutingInstruction('-'), new RoutingInstruction('')]; // Make sure clean all plus empty route is also processed
        transformedInstruction[1].default = true;
      } else {
        transformedInstruction = RoutingInstruction.parse(this, transformedInstruction);
      }
    }

    // The instruction should have a scope so use rootScope if it doesn't
    navigation.scope ??= this.rootScope!.scope;

    // TODO(return): Only use navigation.scope for string and instructions without their own scope

    coordinator.appendInstructions(transformedInstruction);

    // If router options defaults to navigations being complete state navigation (containing the
    // complete set of routing instructions rather than just the ones that change), ensure
    // that there's an instruction to clear all non-specified viewports in all the scopes of
    // the top instructions. With viewports left and right containing components Alpha and Beta
    // respectively, doing 'gamma@left' as a complete state navigation would load Gamma in left and
    // unload Beta in right. In a partial navigation, Gamme would still be loaded but right would
    // be left as is.
    if (options.completeStateNavigations) {
      arrayUnique(transformedInstruction, false)
        .map(instr => instr.scope!)
        .forEach(scope => coordinator.ensureClearStateInstruction(scope));
    }

    let guard = 100;
    do {
      if (!guard--) { // Guard against endless loop
        this.unresolvedInstructionsError(navigation, coordinator.instructions);
      }
      // eslint-disable-next-line no-await-in-loop
      await coordinator.processInstructions();
    } while (coordinator.instructions.length > 0);

    // TODO: Look into adding everything above as well
    return Runner.run('processNavigation',
      () => {
        // console.log('### processNavigation DONE', coordinator.navigation.instruction, coordinator.navigation, coordinator);
        coordinator.closed = true;
        coordinator.finalEndpoint();
        return coordinator.waitForSyncState('completed');
      },
      () => {
        coordinator.finalize();
        return this.updateNavigation(navigation);
      },
      () => {
        // Remove history entry if no history endpoint updated
        if (navigation.navigation.new && !navigation.navigation.first && !navigation.repeating && coordinator.changedEndpoints.every(endpoint => endpoint.options.noHistory)) {
          navigation.untracked = true;
        }
        // TODO: Review this when adding noHistory back
        // return this.navigator.finalize(navigation, this.coordinators.length === 1);
      },
      async () => {
        while (this.coordinators.length > 0 && this.coordinators[0].completed) {
          const coord = this.coordinators.shift() as NavigationCoordinator;

          // await this.updateNavigation(coord.navigation);
          // eslint-disable-next-line no-await-in-loop
          await this.navigator.finalize(coord.navigation, false /* this.coordinators.length === 0 */);

          this.ea.publish(RouterNavigationCompleteEvent.eventName, RouterNavigationCompleteEvent.create(coord.navigation));
          this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(coord.navigation));

          coord.navigation.process?.resolve(true);
        }
      },

    ) as void | Promise<void>;
  };

  /**
   * Get a named endpoint of a specific type.
   *
   * @param type - The type of endpoint to get
   * @param name - The name of the endpoint to get
   */
  public getEndpoint(type: EndpointTypeName, name: string): Endpoint | null {
    return this.allEndpoints(type).find(endpoint => endpoint.name === name) ?? null;
  }

  /**
   * Get all endpoints of a specific type.
   *
   * @param type - The type of the endpoints to get
   * @param includeDisabled - Whether disabled/non-active endpoints should be included
   * @param includeReplaced - Whether replaced endpoints should be included
   */
  public allEndpoints(type: EndpointTypeName | null, includeDisabled: boolean = false): Viewport[] {
    return this.rootScope!.scope
      .allScopes(includeDisabled)
      .filter(scope => type === null || scope.type === type)
      .map(scope => scope.endpoint) as Viewport[];
  }
  /**
   * Public API (not yet implemented)
   */
  public addEndpoint(_type: EndpointTypeName, ..._args: unknown[]): unknown {
    throw createMappedError(ErrorNames.method_not_implemented, 'addEndPoint');
  }

  /**
   * Connect an endpoint custom element to an endpoint. Called from the custom
   * elements of endopints.
   *
   * @param endpoint - An already connected endpoint
   * @param type - The type of the endpoint
   * @param connectedCE - The endpoint custom element
   * @param name - The name of the endpoint
   * @param options - The custom element options
   *
   * @internal
   */
  public connectEndpoint(endpoint: Viewport | ViewportScope | null, type: EndpointTypeName, connectedCE: IConnectedCustomElement, name: string, options?: IViewportOptions): Viewport | ViewportScope {
    const container = connectedCE.container;
    const closestEndpoint: Endpoint = container.has(Router.closestEndpointKey, true)
      ? container.get<Endpoint>(Router.closestEndpointKey)
      : this.rootScope!;
    const parentScope = closestEndpoint.connectedScope;

    if (endpoint === null) {
      endpoint = parentScope.addEndpoint(type, name, connectedCE, options);
      Registration.instance(Router.closestEndpointKey, endpoint).register(container);
    }
    return endpoint;
  }

  /**
   * Disconnect an custom element endpoint from an endpoint. Called from the
   * custom elements of endpoints.
   *
   * @param step - The previous step in this transition Run
   * @param endpoint - The endpoint to disconnect from
   * @param connectedCE - The custom element to disconnect
   */
  public disconnectEndpoint(step: Step | null, endpoint: Viewport | ViewportScope, connectedCE: IConnectedCustomElement): void {
    if (!endpoint.connectedScope.parent!.removeEndpoint(step, endpoint, connectedCE)) {
      throw createMappedError(ErrorNames.router_remove_endpoint_failure, endpoint.name);
    }
  }

  /**
   * Load navigation instructions.
   *
   * @param instructions - The instructions to load
   * @param options - The options to use when loading the instructions
   */
  public async load(instructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions): Promise<boolean | void> {
    ({ instructions, options } = this._extractFragmentAndQuery(instructions, options ?? {}));

    let scope: RoutingScope | null = null;
    ({ instructions, scope } = this.applyLoadOptions(instructions, options));

    const append = options.append ?? false;
    if (append !== false) {
      if (append instanceof NavigationCoordinator) {
        if (!append.closed) {
          instructions = RoutingInstruction.from(this, instructions);
          this.appendInstructions(instructions as RoutingInstruction[], scope, append);
          // Can't return current navigation promise since it can lead to deadlock in load
          return Promise.resolve();
        }
      } else {
        if (!this.loadedFirst || this.hasOpenNavigation) {
          instructions = RoutingInstruction.from(this, instructions);
          this.appendInstructions(instructions as RoutingInstruction[], scope);
          // Can't return current navigation promise since it can lead to deadlock in load
          return Promise.resolve();
        }
      }
    }

    const entry = Navigation.create({
      instruction: instructions as RoutingInstruction[],
      fullStateInstruction: '',
      scope: scope,
      title: options.title,
      data: options.data,
      query: options.query,
      fragment: options.fragment,
      parameters: options.parameters as Record<string, unknown>,
      replacing: (options.replacing ?? false) || options.replace,
      repeating: (options.append ?? false) !== false,
      fromBrowser: options.fromBrowser ?? false,
      origin: options.origin,
      completed: false,
    });
    return this.navigator.navigate(entry);
  }

  /**
   * Apply the load options on the instructions.
   *
   * @param loadInstructions - The instructions to load
   * @param options - The load options to apply when loading the instructions
   * @param keepString - Whether the load instructions should remain as a string (if it's a string)
   *
   */
  public applyLoadOptions(loadInstructions: LoadInstruction | LoadInstruction[], options: ILoadOptions, keepString = true): { instructions: string | RoutingInstruction[]; scope: RoutingScope | null } {
    options = options ?? {};
    if ('origin' in options && !('context' in options)) {
      options.context = options.origin;
    }

    const { scope, instruction } = RoutingScope.for(options.context ?? null, typeof loadInstructions === 'string' ? loadInstructions : undefined);
    if (typeof loadInstructions === 'string') {
      if (!keepString) {
        loadInstructions = RoutingInstruction.from(this, instruction as string);
        for (const loadInstruction of loadInstructions as RoutingInstruction[]) {
          if (loadInstruction.scope === null) {
            loadInstruction.scope = scope;
          }
        }
      } else {
        loadInstructions = instruction as string;
      }
    } else {
      loadInstructions = RoutingInstruction.from(this, loadInstructions);
      for (const loadInstruction of loadInstructions as RoutingInstruction[]) {
        if (loadInstruction.scope === null) {
          loadInstruction.scope = scope;
        }
      }
    }

    return {
      instructions: loadInstructions as string | RoutingInstruction[],
      scope,
    };
  }

  /**
   * Refresh/reload the current navigation
   */
  public refresh(): Promise<boolean | void> {
    return this.navigator.refresh();
  }

  /**
   * Go one step back in navigation history.
   */
  public back(): Promise<boolean | void> {
    return this.navigator.go(-1);
  }

  /**
   * Go one step forward in navigation history.
   */
  public forward(): Promise<boolean | void> {
    return this.navigator.go(1);
  }

  /**
   * Go a specified amount of steps back or forward in navigation history.
   *
   * @param delta - The amount of steps to go. A positive number goes
   * forward, a negative goes backwards.
   */
  public go(delta: number): Promise<boolean | void> {
    return this.navigator.go(delta);
  }

  /**
   * Check whether a set of instructions are active. All instructions need
   * to be active for the condition to be true.
   *
   * @param instructions - The instructions to check
   * @param options - The load options to apply to the instructions to check
   */
  public checkActive(instructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions): boolean {
    // TODO: Look into allowing strings/routes as well
    if (typeof instructions === 'string') {
      throw createMappedError(ErrorNames.router_check_activate_string_error, instructions);
    }
    options = options ?? {};

    // Make sure we have proper routing instructions
    ({ instructions } = this.applyLoadOptions(instructions, options));
    // If no scope is set, use the root scope
    (instructions as RoutingInstruction[]).forEach((instruction: RoutingInstruction) => instruction.scope ??= this.rootScope!.scope);

    // Get all unique involved scopes.
    const scopes = arrayUnique((instructions as RoutingInstruction[]).map(instruction => instruction.scope));

    // Go through all the scopes and for each scope...
    for (const scope of scopes as RoutingScope[]) {
      // ...get the matching (top/entry level) instructions...
      const scopeInstructions = scope.matchScope(instructions as RoutingInstruction[], false);
      // ...and active instructions (on any level) and...
      const scopeActives = scope.matchScope(this.activeComponents, true);

      // ...if any instruction, including next scope instructions, isn't found...
      if (!RoutingInstruction.contains(this, scopeActives, scopeInstructions, true)) {
        // ...the instructions are not considered active.
        return false;
      }
    }
    return true;
  }

  /**
   * Deal with/throw an unresolved instructions error.
   *
   * @param navigation - The failed navigation
   * @param instructions - The unresovled instructions
   */
  public unresolvedInstructionsError(navigation: Navigation, instructions: RoutingInstruction[]): void {
    this.ea.publish(RouterNavigationErrorEvent.eventName, RouterNavigationErrorEvent.create(navigation));
    this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
    throw createUnresolvedinstructionsError(instructions, this._logger);
  }

  /**
   * Cancel a navigation (without it being an error).
   *
   * @param navigation - The navigation to cancel
   * @param coordinator - The coordinator for the navigation
   */
  public cancelNavigation(navigation: Navigation, coordinator: NavigationCoordinator): void {
    coordinator.cancel();
    this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.create(navigation));
    this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
  }

  /**
   * Append instructions to the current navigation.
   *
   * @param instructions - The instructions to append
   * @param scope - The scope of the instructions
   */
  public appendInstructions(instructions: RoutingInstruction[], scope: RoutingScope | null = null, coordinator: NavigationCoordinator | null = null): void {
    if (scope === null) {
      scope = this.rootScope!.scope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    if (coordinator === null) {
      for (let i = this.coordinators.length - 1; i >= 0; i--) {
        if (!this.coordinators[i].closed) {
          coordinator = this.coordinators[i];
          break;
        }
      }
    }
    if (coordinator === null) {
      // If we haven't loaded the first instruction, the append is from
      // viewport defaults so we add them to router's appendInstructions
      // so they are added to the first navigation.
      if (!this.loadedFirst) {
        this.appendedInstructions.push(...instructions);
      } else {
        throw createMappedError(ErrorNames.router_failed_appending_routing_instructions);
      }
    }
    coordinator?.appendInstructions(instructions);
  }

  /**
   * Update the navigation with full state, url, query string and title. The
   * appropriate hooks are called. The `activeComponents` are also set.
   *
   * @param navigation - The navigation to update
   */
  private async updateNavigation(navigation: Navigation): Promise<void> {
    // Make sure instructions added not from root scope are properly parented
    // up to root scope
    (this.rootScope as ViewportScope).scope.reparentRoutingInstructions();

    const instructions = (this.rootScope as ViewportScope).scope.getRoutingInstructions(navigation.timestamp) as RoutingInstruction[];

    // The following makes sure right viewport/viewport scopes are set and update
    // whether viewport name is necessary or not
    let { matchedInstructions } = this.rootScope!.scope.matchEndpoints(instructions, [], true);
    let guard = 100;
    while (matchedInstructions.length > 0) {
      // Guard against endless loop
      if (guard-- === 0) {
        throw createMappedError(ErrorNames.router_failed_finding_viewport_when_updating_viewer_path);
      }
      matchedInstructions = matchedInstructions.map(instruction => {
        const { matchedInstructions } = instruction.endpoint.instance!.scope.matchEndpoints(instruction.nextScopeInstructions ?? [], [], true);
        return matchedInstructions;
      }).flat();
    }

    if (navigation.timestamp >= (this.activeNavigation?.timestamp ?? 0)) {
      this.activeNavigation = navigation;
      this.activeComponents = instructions;
    }

    // const fullViewportStates: RoutingInstruction[] = [];
    // // Handle default / root page, because "-" + "" = "-" (so just a "clear")
    // const targetRoute = instructions.length === 1 ? instructions[0].route : null;
    // if (!(targetRoute != null && ((typeof targetRoute === 'string' && targetRoute === '') || ((targetRoute as FoundRoute).matching === '')))) {
    //   fullViewportStates.push(RoutingInstruction.create(RoutingInstruction.clear(this)) as RoutingInstruction);
    // }

    // fullViewportStates.push(...RoutingInstruction.clone(instructions, this.statefulHistory));
    // navigation.fullStateInstruction = fullViewportStates;

    // First invoke with viewport instructions (should it perhaps get full state?)
    let state = await RoutingHook.invokeTransformToUrl(instructions, navigation);
    if (typeof state !== 'string') {
      // Convert to string if necessary
      state = RoutingInstruction.stringify(this, state, { endpointContext: true });
    }
    // Invoke again with string
    state = await RoutingHook.invokeTransformToUrl(state, navigation);

    // Specified query has precedence over parameters
    if (navigation.query == null && navigation.parameters != null) {
      const search = new URLSearchParams();
      for (let [key, values] of Object.entries(navigation.parameters)) {
        key = encodeURIComponent(key);
        if (!Array.isArray(values)) {
          values = [values];
        }
        for (const value of values as string[]) {
          search.append(key, encodeURIComponent(value));
        }
      }
      navigation.query = search.toString();
    }

    // Add base path...
    let basePath = `${this.configuration.options.basePath as string}/`;
    // ...unless it's not set or we've got an absolute state/path (or we're using fragment hash)
    if ((state !== '' && state[0] === '/') ||
      this.configuration.options.useUrlFragmentHash) {
      basePath = '';
    }

    const query = ((navigation.query?.length ?? 0) > 0 ? "?" + (navigation.query as string) : '');
    const fragment = ((navigation.fragment?.length ?? 0) > 0 ? "#" + (navigation.fragment as string) : '');
    navigation.path = basePath + (state as string) + query + fragment;

    const path = navigation.path.slice(basePath.length);
    navigation.fullStateInstruction = RoutingInstruction.clear(this) + (path.length > 0 ? Separators.for(this).sibling : '') + path;

    if ((navigation.title ?? null) === null) {
      const title = await Title.getTitle(instructions, navigation, this.configuration.options.title);
      if (title !== null) {
        // eslint-disable-next-line require-atomic-updates
        navigation.title = title;
      }
    }

    return Promise.resolve();
  }

  /**
   * Extract and setup the fragment and query from instructions or options.
   *
   * @param instructions - The string instructions to extract from
   * @param options - The options containing the fragment and query
   *
   * TODO: Review query extraction; different pos for path and fragment
   *
   * @internal
   */
  private _extractFragmentAndQuery(instructions: LoadInstruction | LoadInstruction[], options: ILoadOptions): { instructions: LoadInstruction | LoadInstruction[]; options: ILoadOptions } {
    options = { ...options };

    // If instructions is a string and contains a fragment, extract it
    if (typeof instructions === 'string' && options.fragment == null) {
      const [path, fragment] = instructions.split('#');
      instructions = path;
      options.fragment = fragment;
    }

    // If instructions is a string and contains a query string, extract it
    if (typeof instructions === 'string' && options.query == null) {
      const [path, search] = instructions.split('?');
      instructions = path;
      options.query = search;
    }
    // If parameters is a string, it's really a query string so move it
    if (typeof options.parameters === 'string' && options.query == null) {
      options.query = options.parameters;
      options.parameters = void 0;
    }

    if (typeof (options.query) === 'string' && options.query.length > 0) {
      options.parameters ??= {};
      const searchParams = new URLSearchParams(options.query);
      searchParams.forEach((value: string, key: string) => {
        key = decodeURIComponent(key);
        value = decodeURIComponent(value);

        if (key in (options.parameters as Record<string, unknown>)) {
          if (!Array.isArray((options.parameters as Record<string, unknown>)[key])) {
            (options.parameters as Record<string, unknown>)[key] = [(options.parameters as Record<string, unknown>)[key] as string];
          }
          ((options.parameters as Record<string, unknown>)[key] as string[]).push(value);
        } else {
          (options.parameters as Record<string, unknown>)[key] = value;
        }
      });
    }

    return { instructions, options };
  }
}

interface UnresolvedInstructionsError extends Error {
  remainingInstructions: RoutingInstruction[];
}

function createUnresolvedinstructionsError(remainingInstructions: RoutingInstruction[], logger: ILogger): UnresolvedInstructionsError {
  // TODO: Improve error message, including suggesting solutions
  const error = createMappedError(ErrorNames.router_infinite_instruction, remainingInstructions.length) as Partial<UnresolvedInstructionsError>;
  error.remainingInstructions = remainingInstructions;
  logger.warn(error, error.remainingInstructions);
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(error, error.remainingInstructions);
  }
  return error as UnresolvedInstructionsError;
}

export class RouterEvent {
  public constructor(
    public readonly eventName: string,
  ) { }
}
export class RouterStartEvent extends RouterEvent {
  public static eventName: 'au:router:router-start' = 'au:router:router-start';
  public static create(): RouterStartEvent {
    return new RouterStartEvent(this.eventName);
  }
}
export class RouterStopEvent extends RouterEvent {
  public static eventName: 'au:router:router-stop' = 'au:router:router-stop';
  public static create(): RouterStopEvent {
    return new RouterStopEvent(this.eventName);
  }
}

export class RouterNavigationEvent {
  public constructor(
    public readonly eventName: string,
    public readonly navigation: Navigation,
  ) { }
}
export class RouterNavigationStartEvent extends RouterNavigationEvent {
  public static readonly eventName: 'au:router:navigation-start' = 'au:router:navigation-start';
  public static create(navigation: Navigation): RouterNavigationStartEvent {
    return new RouterNavigationStartEvent(this.eventName, navigation);
  }
}
export class RouterNavigationEndEvent extends RouterNavigationEvent {
  public static readonly eventName: 'au:router:navigation-end' = 'au:router:navigation-end';
  public static create(navigation: Navigation): RouterNavigationEndEvent {
    return new RouterNavigationEndEvent(this.eventName, navigation);
  }
}
export class RouterNavigationCancelEvent extends RouterNavigationEvent {
  public static readonly eventName: 'au:router:navigation-cancel' = 'au:router:navigation-cancel';
  public static create(navigation: Navigation): RouterNavigationCancelEvent {
    return new RouterNavigationCancelEvent(this.eventName, navigation);
  }
}
export class RouterNavigationCompleteEvent extends RouterNavigationEvent {
  public static readonly eventName: 'au:router:navigation-complete' = 'au:router:navigation-complete';
  public static create(navigation: Navigation): RouterNavigationCompleteEvent {
    return new RouterNavigationCompleteEvent(this.eventName, navigation);
  }
}
export class RouterNavigationErrorEvent extends RouterNavigationEvent {
  public static readonly eventName: 'au:router:navigation-error' = 'au:router:navigation-error';
  public static create(navigation: Navigation): RouterNavigationErrorEvent {
    return new RouterNavigationErrorEvent(this.eventName, navigation);
  }
}
