/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable prefer-template */
/* eslint-disable max-lines-per-function */
import { DI, IContainer, Registration, Key, EventAggregator, IEventAggregator, IDisposable, Protocol } from '@aurelia/kernel';
import { CustomElementType, ICustomElementViewModel, IAppRoot, ICustomElementController } from '@aurelia/runtime-html';
import { LoadInstruction } from './interfaces.js';
import { Navigator, NavigatorNavigateEvent } from './navigator.js';
import { arrayRemove, arrayUnique } from './utilities/utils.js';
import { Viewport } from './endpoints/viewport.js';
import { IViewportOptions } from './endpoints/viewport-options.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { FoundRoute } from './found-route.js';
import { RoutingScope } from './routing-scope.js';
import { ViewportScope } from './endpoints/viewport-scope.js';
import { BrowserViewerStore, NavigatorStateChangeEvent } from './browser-viewer-store.js';
import { Navigation } from './navigation.js';
import { Endpoint, EndpointTypeName, IConnectedCustomElement, IEndpoint } from './endpoints/endpoint.js';
import { NavigationCoordinator } from './navigation-coordinator.js';
import { Runner, Step } from './utilities/runner.js';
import { Title } from './title.js';
import { RoutingHook } from './routing-hook.js';
import { IRouterConfiguration, ViewportCustomElement } from './index.js';

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
 * The load options.
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
   * Whether the instructions should be appended to a current navigation
   * in progress (if any). If no current navigation is in progress, the
   * instructions will be treated as a new navigation. Default: false
   */
  append?: boolean;

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

export const IRouter = DI.createInterface<IRouter>('IRouter', x => x.singleton(Router));
export interface IRouter extends Router { }

export class Router implements IRouter {
  public static get inject(): Key[] { return [IContainer, IEventAggregator, Navigator, BrowserViewerStore, BrowserViewerStore, IRouterConfiguration]; }

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

  // /**
  //  * The currently processed navigation.
  //  */
  // public processingNavigation: Navigation | null = null;

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

  /**
   * The previous navigation.
   */
  // private lastNavigation: Navigation | null = null;

  private navigatorStateChangeEventSubscription!: IDisposable;
  private navigatorNavigateEventSubscription!: IDisposable;

  public constructor(
    /**
     * @internal
     */
    public readonly container: IContainer,
    private readonly ea: EventAggregator,

    /**
     * The navigator that manages navigation queue and history
     *
     * @internal
     */
    public navigator: Navigator,

    /**
     * The viewer (browser) that displays url, navigation buttons
     */
    public viewer: BrowserViewerStore,

    /**
     * The store (browser) that stores navigations
     */
    public store: BrowserViewerStore,

    /**
     * The router configuration
     */
    public configuration: IRouterConfiguration,
  ) { }

  /**
   * Whether the router is currently navigating.
   */
  public get isNavigating(): boolean {
    return this.coordinators.length > 0;
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
      throw new Error('Router has already been started');
    }
    this.isActive = true;

    const root = this.container.get(IAppRoot);
    // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
    this.rootScope = new ViewportScope(this, 'rootScope', root.controller.viewModel as IConnectedCustomElement, null, true, root.config.component as CustomElementType);

    this.navigator.start({
      store: this.store,
      viewer: this.viewer,
      statefulHistoryLength: this.configuration.options.statefulHistoryLength,
    });

    this.navigatorStateChangeEventSubscription = this.ea.subscribe(NavigatorStateChangeEvent.eventName, this.handleNavigatorStateChangeEvent);
    this.navigatorNavigateEventSubscription = this.ea.subscribe(NavigatorNavigateEvent.eventName, this.handleNavigatorNavigateEvent);
    this.viewer.start({ useUrlFragmentHash: this.configuration.options.useUrlFragmentHash });

    this.ea.publish(RouterStartEvent.eventName, RouterStartEvent.create());
  }

  /**
   * Stop the router.
   */
  public stop(): void {
    if (!this.isActive) {
      throw new Error('Router has not been started');
    }
    this.ea.publish(RouterStopEvent.eventName, RouterStopEvent.create());
    this.navigator.stop();
    this.viewer.stop();
    // this.configuration.apply({}, true); // TODO: Look into removing this

    this.navigatorStateChangeEventSubscription.dispose();
    this.navigatorNavigateEventSubscription.dispose();
  }

  /**
   * Perform the initial load, using the current url.
   *
   * @internal
   */
  public async initialLoad(): Promise<boolean | void> {
    // const entry = Navigation.create({
    //   ...this.navigation.viewerState,
    //   ...{
    //     fullStateInstruction: '',
    //     replacing: true,
    //     fromBrowser: false,
    //   }
    // });
    // const result = this.navigator.navigate(entry);
    const result = this.load(
      this.viewer.viewerState.instruction,
      { replacing: true, fromBrowser: false });
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
  public handleNavigatorNavigateEvent = (event: NavigatorNavigateEvent): void => {
    // Instructions extracted from queue, one at a time
    this.processNavigation(event.navigation).catch(error => {
      // event.navigation.reject?.();
      throw error;
    });
  };

  /**
   * Handle the navigator's state change event.
   *
   * @param event - The event to handle
   *
   * @internal
   */
  public handleNavigatorStateChangeEvent = (event: NavigatorStateChangeEvent): void => {
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
    const options = this.configuration.options;
    // this.processingNavigation = navigation;

    // // TODO: This can now probably be removed. Investigate!
    // this.pendingConnects.clear();

    // Get and initialize a navigation coordinator that will keep track of all endpoint's progresses
    // and make sure they're in sync when they are supposed to be (no `canLoad` before all `canUnload`
    // and so on).
    const coordinator = NavigationCoordinator.create(this, navigation, { syncStates: this.configuration.options.navigationSyncStates }) as NavigationCoordinator;
    this.coordinators.push(coordinator);

    // If there are instructions appended between/before any navigation,
    // append them to this navigation. (This happens with viewport defaults
    // during startup.)
    coordinator.appendedInstructions.push(
      ...this.appendedInstructions.splice(0, this.appendedInstructions.length)
    );

    this.ea.publish(RouterNavigationStartEvent.eventName, RouterNavigationStartEvent.create(navigation));

    // Invoke the transformFromUrl hook if it exists
    let transformedInstruction = typeof navigation.instruction === 'string' && !navigation.useFullStateInstruction
      ? await RoutingHook.invokeTransformFromUrl(navigation.instruction, coordinator.navigation)
      : navigation.instruction;
    // TODO: Review this
    if (transformedInstruction === '/') {
      transformedInstruction = '';
    }

    // The instruction should have a scope so use rootScope if it doesn't
    navigation.scope ??= this.rootScope!.scope;
    // Ask the scope for routing instructions. The result will be either that there's a configured
    // route (which in turn contain routing instructions) or a list of routing instructions
    let foundRoute = navigation.scope.findInstructions(transformedInstruction, options.useDirectRouting, options.useConfiguredRoutes);
    let configuredRoutePath: string | null = null;

    // Make sure we got routing instructions...
    if (navigation.instruction.length > 0 && !foundRoute.foundConfiguration && !foundRoute.foundInstructions) {
      // ...call unknownRoute hook if we didn't...
      // TODO: Add unknownRoute hook here and put possible result in instructions
      this.unknownRoute(foundRoute.remaining);
    }
    // ...and use the found routing instructions.
    let instructions = foundRoute.instructions;

    // If it's a configured route...
    if (foundRoute.foundConfiguration) {
      // ...trim leading slash and ...
      navigation.path = (navigation.instruction as string).replace(/^\//, '');
      // ...store the matching route.
      configuredRoutePath = (configuredRoutePath ?? '') + foundRoute.matching;
      this.rootScope!.path = configuredRoutePath;
    }
    // TODO: Used to have an early exit if no instructions. Restore it?

    // If there are any unresolved components (promises), resolve into components
    const unresolved = instructions.filter(instr => instr.component.isPromise());
    if (unresolved.length > 0) {
      // TODO(alpha): Fix type here
      await Promise.all(unresolved.map(instr => instr.component.resolve() as Promise<any>));
    }

    // If router options defaults to navigations being full state navigation (containing the
    // complete set of routing instructions rather than just the ones that change), ensure
    // that there's an instruction to clear all non-specified viewports in the same scope as
    // the first routing instruction.
    // TODO: There should be a clear all instruction in all the scopes of the top instructions
    if (!this.configuration.options.additiveInstructionDefault) {
      instructions = this.ensureClearStateInstruction(instructions);
    }

    // Get all endpoints affected by any clear all routing instructions and then remove those
    // routing instructions.
    let clearEndpoints: Endpoint[] = [];
    ({ clearEndpoints, instructions } = this.getClearAllEndpoints(instructions));

    // Make sure "add all" instructions have the correct name and scope
    for (const addInstruction of instructions.filter(instr => instr.isAddAll(this))) {
      addInstruction.endpoint.set(addInstruction.scope!.endpoint.name);
      addInstruction.scope = addInstruction.scope!.owningScope!;
    }

    // Mark all as top instructions ("children"/next scope instructions are in a property on
    // routing instruction) that will get assured parallel lifecycle swaps
    // TODO(alpha): Look into refactoring so this isn't used
    for (const instr of instructions) {
      instr.topInstruction = true;
    }

    const allChangedEndpoints: IEndpoint[] = [];
    let earlierMatchedInstructions: RoutingInstruction[] = [];

    // Match the instructions to available endpoints within, and with the help of, their scope
    let { matchedInstructions: matchedInstructions, remainingInstructions } = this.matchEndpoints(instructions, earlierMatchedInstructions);
    let guard = 100;
    do {
      if (!guard--) { // Guard against endless loop

        this.ea.publish(RouterNavigationErrorEvent.eventName, RouterNavigationErrorEvent.create(navigation));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
        throw createUnresolvedinstructionsError(remainingInstructions);
      }
      const changedEndpoints: IEndpoint[] = [];

      // Get all the scopes of matched instructions...
      const matchedScopes = matchedInstructions.map(instr => instr.scope);
      // ...and all the endpoints...
      const matchedEndpoints = matchedInstructions.map(instr => instr.endpoint.instance);
      // ...and create and add clear instructions for all endpoints in
      // any of those scopes that aren't already in an instruction.
      matchedInstructions.push(...clearEndpoints
        .filter(endpoint => matchedScopes.includes(endpoint.owningScope) && !matchedEndpoints.includes(endpoint))
        .map(endpoint => RoutingInstruction.createClear(this, endpoint)));

      // TODO: Review whether this await poses a problem (it's currently necessary for new viewports to load)
      const hooked = await RoutingHook.invokeBeforeNavigation(matchedInstructions, navigation);
      if (hooked === false) {
        coordinator.cancel();
        this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.create(navigation));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
        return;
      } else if (hooked !== true && hooked !== matchedInstructions) {
        // TODO: Do a full findInstructions again with a new FoundRoute so that this
        // hook can return other values as well
        const skipped = RoutingInstruction.flat(matchedInstructions);
        remainingInstructions = remainingInstructions.filter(instr => !skipped.includes(instr));
        matchedInstructions = hooked;
        foundRoute.remaining = '';
      }

      for (const matchedInstruction of matchedInstructions) {
        const endpoint = matchedInstruction.endpoint.instance;
        if (endpoint !== null) {
          // Set endpoint path to the configured route path so that it knows it's part
          // of a configured route.
          endpoint.path = configuredRoutePath;
          // Inform endpoint of new content and retrieve the action it'll take
          const action = endpoint.setNextContent(matchedInstruction, navigation);
          if (action !== 'skip') {
            // Add endpoint to changed endpoints this iteration and to the coordinator's purview
            changedEndpoints.push(endpoint);
            coordinator.addEndpoint(endpoint);
          }
          // We're doing something, so don't clear this endpoint...
          const dontClear = [endpoint];
          if (action === 'swap') {
            // ...and none of it's _current_ children if we're swapping them out.
            dontClear.push(...endpoint.getContent().connectedScope.allScopes(true).map(scope => scope.endpoint));
          }
          // Exclude the endpoints to not clear from the ones to be cleared...
          arrayRemove(clearEndpoints, clear => dontClear.includes(clear));
          // ...as well as already matched clear instructions (but not itself).
          arrayRemove(matchedInstructions, matched => matched !== matchedInstruction
            && matched.isClear(this) && dontClear.includes(matched.endpoint.instance!));
          // And also exclude the routing instruction's parent viewport scope...
          if (!matchedInstruction.isClear(this) && matchedInstruction.scope?.parent?.isViewportScope) {
            // ...from clears...
            arrayRemove(clearEndpoints, clear => clear === matchedInstruction.scope!.parent!.endpoint);
            // ...and already matched clears.
            arrayRemove(matchedInstructions, matched => matched !== matchedInstruction
              && matched.isClear(this) && matched.endpoint.instance === matchedInstruction.scope!.parent!.endpoint);
          }
          // If the endpoint has been changed/swapped the next scope instructions
          // need to be moved into the new endpoint content scope
          if (action !== 'skip' && matchedInstruction.hasNextScopeInstructions) {
            for (const nextScopeInstruction of matchedInstruction.nextScopeInstructions!) {
              nextScopeInstruction.scope = endpoint.scope;
            }
          }
        }
      }

      // In order to make sure all relevant canUnload are run on the first run iteration
      // we only run once all (top) instructions are doing something/there are no skip
      // action instructions.
      // If all first iteration instructions now do something the transitions can start
      const skipping = matchedInstructions.filter(instr => instr.endpoint.instance?.transitionAction === 'skip');
      const skippingWithMore = skipping.filter(instr => instr.hasNextScopeInstructions);
      if (skipping.length === 0 || (skippingWithMore.length === 0 && !foundRoute.hasRemaining)) {
        // if (skipping.length > 0 && (skippingWithMore.length > 0 || foundRoute.hasRemaining)) {
        //   console.log('Skipped endpoint actions, NO run', matchedInstructions.map(i => `${i.endpoint?.toString()}:${i.endpoint?.transitionAction}`));
        // } else {
        //   if (skipping.length > 0) {
        //     console.log('Skipped endpoints actions, but nothing remaining, run anyway.', instruction.instruction, matchedInstructions.map(i => `${i.endpoint?.toString()}:${i.endpoint?.transitionAction}`));
        //   }
        // If navigation is unrestricted (no other syncing done than on canUnload) we can tell
        // the navigation coordinator to instruct endpoints to transition
        if (!this.isRestrictedNavigation) {
          coordinator.finalEndpoint();
        }
        coordinator.run();

        // Wait for ("blocking") canUnload to finish
        if (coordinator.hasAllEndpoints) {
          const guardedUnload = coordinator.waitForSyncState('guardedUnload');
          if (guardedUnload instanceof Promise) {
            // console.log('>>> Waiting for guardedUnload', (coordinator as any).entities.map((ent: any) => ent.entity.toString()).join(','));
            await guardedUnload;
            // console.log('<<< Waited for guardedUnload');
          }
        }
      }

      // If, for whatever reason, this navigation got cancelled, stop processing
      if (coordinator.cancelled) {
        this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.create(navigation));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
        return;
      }

      // Add this iteration's changed endpoints (inside the loop) to the total of all
      // updated endpoints (outside the loop)
      for (const changedEndpoint of changedEndpoints) {
        if (allChangedEndpoints.every(endpoint => endpoint !== changedEndpoint)) {
          allChangedEndpoints.push(changedEndpoint);
        }
      }

      // Make sure these endpoints in these instructions stays unavailable
      earlierMatchedInstructions.push(...matchedInstructions.splice(0));

      // TODO: Fix multi level recursiveness?
      // Endpoints have now (possibly) been added or removed, so try and match
      // any remaining instructions
      if (remainingInstructions.length > 0) {
        ({ matchedInstructions, remainingInstructions } = this.matchEndpoints(remainingInstructions, earlierMatchedInstructions));
      }

      // If this isn't a restricted ("static") navigation everything will run as soon as possible
      // and then we need to wait for new viewports to be loaded before continuing here (but of
      // course only if we're running)
      // TODO: Use a better solution here (by checking and waiting for relevant viewports)
      if (!this.isRestrictedNavigation &&
        (matchedInstructions.length > 0 || remainingInstructions.length > 0) &&
        coordinator.running) {
        // const waitForSwapped = coordinator.waitForSyncState('bound');
        // if (waitForSwapped instanceof Promise) {
        // //   console.log('>>> AWAIT waitForBound');
        //   await waitForSwapped;
        // //   console.log('<<< AWAIT waitForBound');
        // }
        const waitForSwapped = coordinator.waitForSyncState('swapped');
        if (waitForSwapped instanceof Promise) {
          // console.log('>>> AWAIT waitForSwapped');
          await waitForSwapped;
          // console.log('<<< AWAIT waitForSwapped');
        }
      }

      // Look for child routes (configured) and instructions (once we've loaded everything so far?)
      if (foundRoute.hasRemaining &&
        matchedInstructions.length === 0 &&
        remainingInstructions.length === 0) {

        // // If this isn't a restricted ("static") navigation everything will run as soon as possible
        // // and then we need to wait for new viewports to be loaded before continuing here
        // // TODO: Use a better solution here (by checking and waiting for relevant viewports)
        // if (!this.isRestrictedNavigation) {
        //   // const waitForSwapped = coordinator.waitForSyncState('bound');
        //   // if (waitForSwapped instanceof Promise) {
        //   //   console.log('AWAIT waitForBound');
        //   //   await waitForSwapped;
        //   // }
        //   const waitForSwapped = coordinator.waitForSyncState('swapped');
        //   if (waitForSwapped instanceof Promise) {
        //     console.log('AWAIT waitForSwapped');
        //     await waitForSwapped;
        //   }
        // }

        // Get child route (configured) and instructions (if any)
        const { foundChildRoute, configuredChildRoutePath } = this.findChildRoute(earlierMatchedInstructions, foundRoute, configuredRoutePath);

        // Proceed with found child route...
        if (foundChildRoute.foundInstructions) {
          // ...by making it the current route...
          foundRoute = foundChildRoute;
          // ...and the current configured route path...
          configuredRoutePath = configuredChildRoutePath;
          // ...and add the instructions to processing...
          this.appendInstructions(foundChildRoute.instructions);
        } else { // ...or deal with unknown route
          // TODO: Add unknownRoute hook here and put possible result in instructions
          this.unknownRoute(foundChildRoute.remaining);
        }
      }

      // Don't add defaults when it's a full state navigation (since it's complete state)
      if (navigation.useFullStateInstruction) {
        coordinator.appendedInstructions = coordinator.appendedInstructions.filter(instr => !instr.default);
      }

      // If there are any unresolved components (promises) to be appended, resolve them
      const unresolved = coordinator.appendedInstructions.filter(instr => instr.component.isPromise());
      if (unresolved.length > 0) {
        // TODO(alpha): Fix type here
        await Promise.all(unresolved.map(instr => instr.component.resolve() as Promise<any>));
      }

      // Dequeue any instructions appended to the coordinator and add to either matched or
      // remaining. Default instructions aren't added if there's already a non-default
      ({ matchedInstructions, earlierMatchedInstructions, remainingInstructions } =
        coordinator.dequeueAppendedInstructions(matchedInstructions, earlierMatchedInstructions, remainingInstructions));

      // Once done with all explicit instructions...
      if (matchedInstructions.length === 0 && remainingInstructions.length === 0) {
        // ...check if we've got pending children (defaults that hasn't connected yet)...
        const pendingEndpoints = earlierMatchedInstructions
          .map(instr => (instr.endpoint.instance?.connectedCE as ViewportCustomElement).pendingPromise?.promise)
          .filter(promise => promise != null);
        // ...and await first one...
        if (pendingEndpoints.length > 0) {
          await Promise.any(pendingEndpoints);
          // ...and dequeue them.
          ({ matchedInstructions, earlierMatchedInstructions, remainingInstructions } =
            coordinator.dequeueAppendedInstructions(matchedInstructions, earlierMatchedInstructions, remainingInstructions));
        } else {
          // ...or create the (remaining) implicit clear instructions (if any).
          matchedInstructions = clearEndpoints.map(endpoint => RoutingInstruction.createClear(this, endpoint));
        }
      }
    } while (matchedInstructions.length > 0 || remainingInstructions.length > 0);

    // TODO: Look into adding everything above as well
    return Runner.run(null,
      () => {
        coordinator.finalEndpoint();
        return coordinator.waitForSyncState('completed');
      },
      () => {
        coordinator.finalize();
        return this.updateNavigation(navigation);
      },
      () => {
        // Remove history entry if no history endpoint updated
        if (navigation.navigation.new && !navigation.navigation.first && !navigation.repeating && allChangedEndpoints.every(endpoint => endpoint.options.noHistory)) {
          navigation.untracked = true;
        }
        // TODO: Review this when adding noHistory back
        // this.lastNavigation = this.processingNavigation;
        // if (this.lastNavigation?.repeating ?? false) {
        //   this.lastNavigation!.repeating = false;
        // }
        // return this.navigator.finalize(navigation, this.coordinators.length === 1);
      },
      async () => {
        // this.processingNavigation = null;
        while (this.coordinators.length > 0 && this.coordinators[0].completed) {
          const coord = this.coordinators.shift() as NavigationCoordinator;

          // await this.updateNavigation(coord.navigation);
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
    throw new Error('Not implemented');
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
    const container = (connectedCE.container as IContainer & { parent: IContainer });
    const closestEndpoint = (container.has(Router.closestEndpointKey, true) ? container.get<Endpoint>(Router.closestEndpointKey) : this.rootScope) as Endpoint;
    const parentScope = closestEndpoint.connectedScope;
    if (endpoint === null) {
      endpoint = parentScope.addEndpoint(type, name, connectedCE, options);
      Registration.instance(Router.closestEndpointKey, endpoint).register(container);
      //   if (!this.isRestrictedNavigation) {
      //     this.pendingConnects.set(connectedCE, new OpenPromise());
      //   }
      // } else {
      //   this.pendingConnects.get(connectedCE)?.resolve();
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
      throw new Error("Failed to remove endpoint: " + endpoint.name);
    }
  }

  /**
   * Load navigation instructions.
   *
   * @param instructions - The instructions to load
   * @param options - The options to use when loading the instructions
   */
  public async load(instructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions): Promise<boolean | void> {
    options = options ?? {};
    instructions = this.extractQuery(instructions, options);

    let scope: RoutingScope | null = null;
    ({ instructions, scope } = this.applyLoadOptions(instructions, options));

    if ((options.append ?? false) && (!this.loadedFirst || this.isNavigating)) {
      instructions = RoutingInstruction.from(instructions);
      this.appendInstructions(instructions as RoutingInstruction[], scope);
      // Can't return current navigation promise since it can lead to deadlock in load
      return Promise.resolve();
    }

    const entry = Navigation.create({
      instruction: instructions as RoutingInstruction[],
      fullStateInstruction: '',
      scope: scope,
      title: options.title,
      data: options.data,
      query: options.query,
      parameters: options.parameters as Record<string, unknown>,
      replacing: (options.replacing ?? false) || options.replace,
      repeating: options.append,
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
   * @param keepString - Whether the load instructions should remain as a
   * string (if it's a string)
   */
  public applyLoadOptions(loadInstructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions, keepString = true): { instructions: string | RoutingInstruction[]; scope: RoutingScope | null } {
    options = options ?? {};
    if ('origin' in options && !('context' in options)) {
      options.context = options.origin;
    }
    // let scope = router.findScope((options as IRoutingInstructionsOptions).context ?? null);
    let scope = RoutingScope.for(options.context ?? null) ?? /* router.rootScope!.scope ?? */ null;
    if (typeof loadInstructions === 'string') {
      // If it's not from scope root, figure out which scope
      if (!(loadInstructions).startsWith('/')) {
        // Scope modifications
        if ((loadInstructions).startsWith('.')) {
          // The same as no scope modification
          if ((loadInstructions).startsWith('./')) {
            loadInstructions = (loadInstructions).slice(2);
          }
          // Find out how many scopes upwards we should move
          while ((loadInstructions as string).startsWith('../')) {
            scope = scope?.parent ?? scope;
            loadInstructions = (loadInstructions as string).slice(3);
          }
        }
        if (scope?.path != null) {
          loadInstructions = `${scope.path}/${loadInstructions as string}`;
          scope = null; // router.rootScope!.scope;
        }
      } else { // Specified root scope with /
        scope = null; // router.rootScope!.scope;
      }
      if (!keepString) {
        loadInstructions = RoutingInstruction.from(loadInstructions);
        for (const instruction of loadInstructions as RoutingInstruction[]) {
          if (instruction.scope === null) {
            instruction.scope = scope;
          }
        }
      }
    } else {
      loadInstructions = RoutingInstruction.from(loadInstructions);
      for (const instruction of loadInstructions as RoutingInstruction[]) {
        if (instruction.scope === null) {
          instruction.scope = scope;
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
      throw new Error(`Parameter instructions to checkActivate can not be a string ('${instructions}')!`);
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
      if (!RoutingInstruction.contains(scopeActives, scopeInstructions, true)) {
        // ...the instructions are not considered active.
        return false;
      }
    }
    return true;
  }

  /**
   * Append instructions to the current navigation.
   *
   * @param instructions - The instructions to append
   * @param scope - The scope of the instructions
   */
  private appendInstructions(instructions: RoutingInstruction[], scope: RoutingScope | null = null): void {
    if (scope === null) {
      scope = this.rootScope!.scope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    let coordinator: NavigationCoordinator | null = null;
    for (let i = this.coordinators.length - 1; i >= 0; i--) {
      if (!this.coordinators[i].completed) {
        coordinator = this.coordinators[i];
        break;
      }
    }
    if (coordinator === null) {
      // If we haven't loaded the first instruction, the append is from
      // viewport defaults so we add them to router's appendInstructions
      // so they are added to the first navigation.
      if (!this.loadedFirst) {
        this.appendedInstructions.push(...instructions);
      } else {
        throw Error('Failed to append routing instructions to coordinator');
      }
    }
    // coordinator?.appendedInstructions.push(...instructions);
    coordinator?.enqueueAppendedInstructions(instructions);
  }

  /**
   * Deal with/throw an unknown route error.
   *
   * @param route - The failing route
   */
  private unknownRoute(route: string) {
    if (typeof route !== 'string' || route.length === 0) {
      return;
    }
    if (this.configuration.options.useConfiguredRoutes && this.configuration.options.useDirectRouting) {
      // TODO: Add missing/unknown route handling
      throw new Error("No matching configured route or component found for '" + route + "'");
    } else if (this.configuration.options.useConfiguredRoutes) {
      // TODO: Add missing/unknown route handling
      throw new Error("No matching configured route found for '" + route + "'");
    } else {
      // TODO: Add missing/unknown route handling
      throw new Error("No matching route/component found for '" + route + "'");
    }
  }

  /**
   * Ensure that there's a clear all instruction present in instructions.
   */
  private ensureClearStateInstruction(instructions: RoutingInstruction[]): RoutingInstruction[] {
    if (instructions.length > 0) {
      const instruction = instructions[0];
      if (!instruction.isAddAll(this) && !instruction.isClearAll(this)) {
        const clearAll = RoutingInstruction.create(RoutingInstruction.clear(this)) as RoutingInstruction;
        clearAll.scope = instruction.scope;
        return [clearAll, ...instructions];
      }
    }
    return instructions;
  }

  /**
   * Get all endpoints affected by any clear all routing instructions and then remove those
   * routing instructions.
   *
   * @param instructions - The instructions to process
   */
  private getClearAllEndpoints(instructions: RoutingInstruction[]): { clearEndpoints: Endpoint[]; instructions: RoutingInstruction[] } {
    let clearEndpoints: Endpoint[] = [];
    // For each clear all routing instruction...
    for (const clearInstruction of instructions.filter(instruction => instruction.isClearAll(this))) {
      // ... get the routing scope...
      const clearScope = clearInstruction.scope!;
      // ...and mark all endpoints in the scope to be cleared unless it's specified for something
      // else in the navigation...
      clearEndpoints = clearScope.allScopes()  // TODO(alpha): Verfiy the need for rootScope check below
        .filter(scope => !scope.endpoint.isEmpty && scope !== this.rootScope?.connectedScope)
        .map(scope => scope.endpoint);
    }
    // Remove the clear all instructions
    return { clearEndpoints, instructions: instructions.filter(instruction => !instruction.isClearAll(this)) };
  }

  /**
   * Match the instructions to available endpoints within, and with the help of, their scope.
   *
   * @param instructions - The instructions to matched
   * @param alreadyFound - The already found matches
   * @param withoutViewports - Whether viewports should be ignored when matching
   */
  private matchEndpoints(instructions: RoutingInstruction[], alreadyFound: RoutingInstruction[], withoutViewports: boolean = false): { matchedInstructions: RoutingInstruction[]; remainingInstructions: RoutingInstruction[] } {
    const allMatchedInstructions: RoutingInstruction[] = [];
    const allRemainingInstructions: RoutingInstruction[] = [];

    while (instructions.length) {
      const currInstruction = instructions[0];
      if (currInstruction.scope === null) {
        currInstruction.scope = this.rootScope!.scope;
      }
      const scope: RoutingScope = currInstruction.scope;
      const { matchedInstructions, remainingInstructions } = scope.matchEndpoints(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
      allMatchedInstructions.push(...matchedInstructions);
      allRemainingInstructions.push(...remainingInstructions);
      instructions = instructions.filter(instruction => instruction.scope !== scope);
    }
    return { matchedInstructions: allMatchedInstructions.slice(), remainingInstructions: allRemainingInstructions };
  }

  /**
   * Find child route (configured) and instructions (if any).
   *
   * @param alreadyMatchedInstructions - The already matched instructions
   * @param configuredRoute - The previous found configured route
   * @param configuredRoutePath - The previous configured route path
   */
  private findChildRoute(alreadyMatchedInstructions: RoutingInstruction[], configuredRoute: FoundRoute, configuredRoutePath: string | null) {
    const options = this.configuration.options;
    let foundChildRoute = new FoundRoute();
    let configuredChildRoutePath = configuredRoutePath ?? '';

    // Get the first occurrence of all endpoints that are a part of the
    // currently processed configured route path
    const routeEndpoints = alreadyMatchedInstructions
      .filter(instr => instr.endpoint.instance?.path === configuredRoutePath) // currently processed route path
      .map(instr => instr.endpoint.instance!) // endpoints
      .filter((value, index, arr) => arr.indexOf(value) === index); // first occurrence

    // Go through all endpoints...
    for (const endpoint of routeEndpoints) {
      // ...looking for instructions...
      foundChildRoute = endpoint.scope.findInstructions(configuredRoute.remaining, options.useDirectRouting, options.useConfiguredRoutes);
      // ...and use first configured route if we find one
      if (foundChildRoute.foundConfiguration) {
        break;
      }
    }
    if (foundChildRoute.foundInstructions) {
      configuredChildRoutePath += `/${configuredRoute.matching}`;
    }

    return { foundChildRoute, configuredChildRoutePath };
  }

  /**
   * Update the navigation with full state, url, query string and title. The
   * appropriate hooks are called. The `activeComponents` are also set.
   *
   * @param navigation - The navigation to update
   */
  private async updateNavigation(navigation: Navigation): Promise<void> {
    // TODO: Investigate if this can be removed
    (this.rootScope as ViewportScope).scope.reparentRoutingInstructions();

    const instructions = (this.rootScope as ViewportScope).scope.getRoutingInstructions(navigation.timestamp) as RoutingInstruction[];

    // The following makes sure right viewport/viewport scopes are set and update
    // whether viewport name is necessary or not
    const alreadyFound: RoutingInstruction[] = [];
    let { matchedInstructions: found, remainingInstructions: remaining } = this.matchEndpoints(instructions, alreadyFound, true);
    let guard = 100;
    while (remaining.length > 0) {
      // Guard against endless loop
      if (guard-- === 0) {
        throw new Error('Failed to find viewport when updating viewer paths.');
      }
      alreadyFound.push(...found);
      ({ matchedInstructions: found, remainingInstructions: remaining } = this.matchEndpoints(remaining, alreadyFound, true));
    }

    if (navigation.timestamp >= (this.activeNavigation?.timestamp ?? 0)) {
      this.activeNavigation = navigation;
      this.activeComponents = instructions;
      // this.activeRoute = navigation.route;
    }

    // First invoke with viewport instructions (should it perhaps get full state?)
    let state = await RoutingHook.invokeTransformToUrl(instructions, navigation);
    if (typeof state !== 'string') {
      // Convert to string if necessary
      state = RoutingInstruction.stringify(this, state, false, true);
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
    const query = (navigation.query && navigation.query.length ? "?" + navigation.query : '');
    // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
    navigation.path = state + query;
    // }

    const fullViewportStates = [RoutingInstruction.create(RoutingInstruction.clear(this)) as RoutingInstruction];
    fullViewportStates.push(...RoutingInstruction.clone(instructions, this.statefulHistory));
    navigation.fullStateInstruction = fullViewportStates;

    if ((navigation.title ?? null) === null) {
      const title = await Title.getTitle(instructions, navigation, this.configuration.options.title);
      if (title !== null) {
        navigation.title = title;
      }
    }

    return Promise.resolve();
  }

  /**
   * Extract and setup the query and parameters from instructions or options.
   *
   * @param instructions - The instructions to extract the query from
   * @param options - The options containing query and/or parameters
   *
   * TODO: Review query extraction; different pos for path and fragment
   */
  private extractQuery(instructions: LoadInstruction | LoadInstruction[], options: ILoadOptions): LoadInstruction | LoadInstruction[] {
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
      // eslint-disable-next-line compat/compat
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

    return instructions;
  }
}

interface UnresolvedInstructionsError extends Error {
  remainingInstructions: RoutingInstruction[];
}

function createUnresolvedinstructionsError(remainingInstructions: RoutingInstruction[]): UnresolvedInstructionsError {
  // TODO: Improve error message, including suggesting solutions
  const error: Partial<UnresolvedInstructionsError> =
    new Error(`${remainingInstructions.length} remaining instructions after 100 iterations; there is likely an infinite loop.`);
  error.remainingInstructions = remainingInstructions;
  console.log(error, error.remainingInstructions);
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
