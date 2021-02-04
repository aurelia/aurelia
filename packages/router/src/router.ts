/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable prefer-template */
/* eslint-disable max-lines-per-function */
import { DI, IContainer, Registration, IIndexable, Key, EventAggregator, IEventAggregator, IDisposable, Protocol } from '@aurelia/kernel';
import { CustomElementType, ICustomElementViewModel, IAppRoot, ICustomElementController } from '@aurelia/runtime-html';
import { LoadInstruction } from './interfaces.js';
import { Navigator, NavigatorNavigateEvent } from './navigator.js';
import { arrayRemove, arrayUnique } from './utilities/utils.js';
import { IViewportOptions, Viewport } from './viewport.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { FoundRoute } from './found-route.js';
import { RoutingScope } from './routing-scope.js';
import { ViewportScope } from './viewport-scope.js';
import { BrowserViewerStore } from './browser-viewer-store.js';
import { Navigation } from './navigation.js';
import { Endpoint, EndpointType, IConnectedCustomElement, IEndpoint } from './endpoints/endpoint.js';
import { NavigationCoordinator } from './navigation-coordinator.js';
import { IRouterStartOptions, ISeparators, RouterOptions } from './router-options.js';
import { OpenPromise } from './utilities/open-promise.js';
import { NavigatorStateChangeEvent } from './events.js';
import { Runner, Step } from './utilities/runner.js';
import { IRoute } from './route.js';
import { Title } from './title.js';
import { RoutingHook } from './routing-hook.js';

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
 * Public API
 */
export interface ILoadOptions {
  title?: string;
  query?: string;
  data?: Record<string, unknown>;
  replace?: boolean;
  append?: boolean;
  origin?: ICustomElementViewModel | Element;
  context?: ICustomElementViewModel | Element | Node | ICustomElementController;
  scopeModifier?: string;
}

/**
 * Public API
 */
export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));

export interface IRouter extends Router { }

export class Router implements IRouter {
  public static readonly inject: readonly Key[] = [IContainer, IEventAggregator, Navigator, BrowserViewerStore];
  public static readonly closestEndpointKey = Protocol.annotation.keyFor('closest-endpoint');

  public rootScope: ViewportScope | null = null;

  /**
   * Public API
   */
  public activeComponents: RoutingInstruction[] = [];
  /**
   * Public API
   */
  // public activeRoute?: Route;

  /**
   * @internal
   */
  public appendedInstructions: RoutingInstruction[] = [];

  public processingNavigation: Navigation | null = null;
  public isActive: boolean = false;
  public pendingConnects: Map<IConnectedCustomElement, OpenPromise> = new Map<IConnectedCustomElement, OpenPromise>();

  private loadedFirst: boolean = false;

  private lastNavigation: Navigation | null = null;

  private navigatorStateChangeEventSubscription!: IDisposable;
  private navigatorNavigateEventSubscription!: IDisposable;

  public constructor(
    /**
     * @internal
     */
    public readonly container: IContainer,
    @IEventAggregator private readonly ea: EventAggregator,
    /**
     * @internal
     */
    public navigator: Navigator,

    public navigation: BrowserViewerStore, // TODO: Really should separate these
  ) { }

  /**
   * Public API
   */
  public get isNavigating(): boolean {
    return this.processingNavigation !== null;
  }

  public get isRestrictedNavigation(): boolean {
    const syncStates = RouterOptions.navigationSyncStates;
    return syncStates.includes('guardedLoad') ||
      syncStates.includes('unloaded') ||
      syncStates.includes('loaded') ||
      syncStates.includes('guarded') ||
      syncStates.includes('routed');
  }

  /**
   * @internal
   */
  public get statefulHistory(): boolean {
    return RouterOptions.statefulHistoryLength !== void 0 && RouterOptions.statefulHistoryLength > 0;
  }

  // TODO: Switch this to use (probably) an event instead
  public starters: any[] = [];
  /**
   * Public API
   */
  public start(options?: IRouterStartOptions): void {
    if (this.isActive) {
      throw new Error('Router has already been started');
    }

    this.isActive = true;
    options = options ?? {};
    const titleOptions = {
      ...RouterOptions.title,
      ...(typeof options.title === 'string' ? { appTitle: options.title } : options.title),
    };
    options.title = titleOptions;

    const separatorOptions: ISeparators = {
      ...RouterOptions.separators,
      ...(options as IRouterStartOptions & { separators: ISeparators }).separators ?? {},
    };
    (options as IRouterStartOptions & { separators: ISeparators }).separators = separatorOptions;

    if (Array.isArray(options.hooks)) {
      options.hooks.forEach(hook => RoutingHook.add(hook.hook, hook.options));
      delete options['hooks'];
    }

    RouterOptions.apply(options, true);

    // if (Array.isArray(RouterOptions.hooks)) {
    //   RouterOptions.hooks.forEach(hook => RoutingHook.add(hook.hook, hook.options));
    // }

    this.navigator.start({
      store: this.navigation,
      viewer: this.navigation,
      statefulHistoryLength: RouterOptions.statefulHistoryLength,
    });

    this.navigatorStateChangeEventSubscription = this.ea.subscribe(NavigatorStateChangeEvent.eventName, this.handleNavigatorStateChangeEvent);
    this.navigatorNavigateEventSubscription = this.ea.subscribe(NavigatorNavigateEvent.eventName, this.handleNavigatorNavigateEvent);
    this.navigation.start({ useUrlFragmentHash: RouterOptions.useUrlFragmentHash });

    this.ensureRootScope();
    // TODO: Switch this to use (probably) an event instead
    for (const starter of this.starters) {
      starter();
    }
  }

  /**
   * Public API
   */
  public stop(): void {
    if (!this.isActive) {
      throw new Error('Router has not been started');
    }
    this.navigator.stop();
    this.navigation.stop();
    RouterOptions.apply({}, true); // TODO: Look into removing this

    this.navigatorStateChangeEventSubscription.dispose();
    this.navigatorNavigateEventSubscription.dispose();
  }

  /**
   * @internal
   */
  public async loadUrl(): Promise<boolean | void> {
    const entry = Navigation.create({
      ...this.navigation.viewerState,
      ...{
        fullStateInstruction: '',
        replacing: true,
        fromBrowser: false,
      }
    });
    const result = this.navigator.navigate(entry);
    this.loadedFirst = true;
    return result;
  }

  /**
   * @internal
   */
  // TODO: use @bound (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public handleNavigatorNavigateEvent = (event: NavigatorNavigateEvent): void => {
    // Instructions extracted from queue, one at a time
    this.processNavigation(event).catch(error => { throw error; });
  };

  /**
   * @internal
   */
  // TODO: use @bound (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public handleNavigatorStateChangeEvent = (event: NavigatorStateChangeEvent): void => {
    // console.log('handleNavigatorStateChangeEvent', event);
    const entry = Navigation.create(event.state?.lastNavigation);
    entry.instruction = event.instruction;
    entry.fromBrowser = true;
    this.navigator.navigate(entry).catch(error => { throw error; });
  };

  /**
   * @internal
   */
  // TODO: use @bound and improve name (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  /**
   * Processes the route/instructions in a (queued) navigation.
   *
   * @param evNavigation - The navigation to process
   */
  public processNavigation = async (evNavigation: NavigatorNavigateEvent): Promise<void> => {
    const instruction = this.processingNavigation = evNavigation as Navigation;

    this.ea.publish(RouterNavigationStartEvent.eventName, RouterNavigationStartEvent.createEvent(instruction));

    // TODO: This can now probably be removed. Investigate!
    this.pendingConnects.clear();

    // Get and initialize a navigation coordinator that will keep track of all endpoint's progresses
    // and make sure they're in sync when they are supposed to be (no `canLoad` before all `canUnload`
    // and so on).
    const coordinator = NavigationCoordinator.create(this, instruction, { syncStates: RouterOptions.navigationSyncStates }) as NavigationCoordinator;

    // Invoke the transformFromUrl hook if it exists
    let transformedInstruction = typeof instruction.instruction === 'string' && !instruction.useFullStateInstruction
      ? await RoutingHook.invokeTransformFromUrl(instruction.instruction, this.processingNavigation as Navigation)
      : instruction.instruction;
    // TODO: Review this
    if (transformedInstruction === '/') {
      transformedInstruction = '';
    }

    // console.log('NAVIGATION', instruction.instruction);

    // The instruction should have a scope so use rootScope if it doesn't
    instruction.scope ??= this.rootScope!.scope;
    // Ask the scope for routing instructions. The result will be either that there's a configured
    // route (which in turn contain routing instructions) or a list of routing instructions
    let foundRoute = instruction.scope!.findInstructions(transformedInstruction);
    let configuredRoutePath: string | null = null;

    // Make sure we got routing instructions...
    if (instruction.instruction.length > 0 && !foundRoute.foundConfiguration && !foundRoute.foundInstructions) {
      // ...call unknownRoute hook if we didn't...
      // TODO: Add unknownRoute hook here and put possible result in instructions
      this.unknownRoute(foundRoute.remaining);
    }
    // ...and use the found routing instructions.
    let instructions = foundRoute.instructions;

    // If it's a configured route...
    if (foundRoute.foundConfiguration) {
      // ...trim leading slash and ...
      instruction.path = (instruction.instruction as string).replace(/^\//, '');
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
    if (!RouterOptions.additiveInstructionDefault) {
      instructions = this.ensureClearStateInstruction(instructions);
    }

    // Get all endpoints affected by any clear all routing instructions and then remove those
    // routing instructions.
    let clearEndpoints: Endpoint[] = [];
    ({ clearEndpoints, instructions } = this.getClearAllEndpoints(instructions));

    // Make sure "add all" instructions have the correct name and scope
    for (const addInstruction of instructions.filter(instr => instr.isAddAll)) {
      addInstruction.viewport.set(addInstruction.scope!.endpoint.name);
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
        // TODO(alpha): Improve error message
        const err = new Error(remainingInstructions.length + ' remaining instructions after 100 iterations; there is likely an infinite loop.');
        (err as Error & IIndexable)['remainingInstructions'] = remainingInstructions;
        console.log('remainingInstructions', remainingInstructions);

        this.ea.publish(RouterNavigationErrorEvent.eventName, RouterNavigationErrorEvent.createEvent(instruction));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.createEvent(instruction));
        throw err;
      }
      const changedEndpoints: IEndpoint[] = [];

      // Get all the scopes of matched instructions...
      const matchedScopes = matchedInstructions.map(instr => instr.scope);
      // ...and all the endpoints...
      const matchedEndpoints = matchedInstructions.map(instr => instr.endpoint);
      // ...and create and add clear instructions for all endpoints in
      // any of those scopes that aren't already in an instruction.
      matchedInstructions.push(...clearEndpoints
        .filter(endpoint => matchedScopes.includes(endpoint.owningScope) && !matchedEndpoints.includes(endpoint))
        .map(endpoint => RoutingInstruction.createClear(endpoint)));

      // TODO: Review whether this await poses a problem (it's currently necessary for new viewports to load)
      const hooked = await RoutingHook.invokeBeforeNavigation(matchedInstructions, instruction);
      if (hooked === false) {
        coordinator.cancel();
        this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.createEvent(instruction));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.createEvent(instruction));
        return;
      } else if (hooked !== true) {
        // TODO: Possibly update this hook to be able to return other values as well
        matchedInstructions = hooked;
      }

      for (const matchedInstruction of matchedInstructions) {
        const endpoint = matchedInstruction.endpoint;
        if (endpoint !== null) {
          // Set endpoint path to the configured route path so that it knows it's part
          // of a configured route.
          endpoint.path = configuredRoutePath;
          // Inform endpoint of new content and retrieve the action it'll take
          const action = endpoint.setNextContent(matchedInstruction, instruction);
          if (action !== 'skip') {
            // Add endpoint to changed endpoints this iteration and to the coordinator's purview
            changedEndpoints.push(endpoint);
            coordinator.addEntity(endpoint);
          }
          // We're doing something, so don't clear this endpoint...
          const dontClear = [endpoint];
          if (action === 'swap') {
            // ...and none of it's _current_ children if we're swapping them out.
            dontClear.push(...endpoint.content.connectedScope.allScopes(true, true).map(scope => scope.endpoint));
          }
          // Exclude the endpoints to not clear from the ones to be cleared...
          arrayRemove(clearEndpoints, clear => dontClear.includes(clear));
          // ...as well as already matched clear instructions (but not itself).
          arrayRemove(matchedInstructions, matched => matched !== matchedInstruction
            && matched.isClear && dontClear.includes(matched.endpoint!));
          // And also exclude the routing instruction's parent viewport scope...
          if (!matchedInstruction.isClear && matchedInstruction.scope?.parent?.isViewportScope) {
            // ...from clears...
            arrayRemove(clearEndpoints, clear => clear === matchedInstruction.scope!.parent!.endpoint);
            // ...and already matched clears.
            arrayRemove(matchedInstructions, matched => matched !== matchedInstruction
              && matched.isClear && matched.endpoint === matchedInstruction.scope!.parent!.endpoint);
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
      const skipping = matchedInstructions.filter(instr => instr.endpoint?.nextContentAction === 'skip');
      const skippingWithMore = skipping.filter(instr => instr.hasNextScopeInstructions);
      if (skipping.length === 0 || (skippingWithMore.length === 0 && !foundRoute.hasRemaining)) {
        // if (skipping.length > 0 && (skippingWithMore.length > 0 || foundRoute.hasRemaining)) {
        //   console.log('Skipped endpoint actions, NO run', matchedInstructions.map(i => `${i.endpoint?.toString()}:${i.endpoint?.nextContentAction}`));
        // } else {
        //   if (skipping.length > 0) {
        //     console.log('Skipped endpoints actions, but nothing remaining, run anyway.', instruction.instruction, matchedInstructions.map(i => `${i.endpoint?.toString()}:${i.endpoint?.nextContentAction}`));
        //   }
        // If navigation is unrestricted (no other syncing done than on canUnload) we can tell
        // the navigation coordinator to instruct endpoints to transition
        if (!this.isRestrictedNavigation) {
          coordinator.finalEntity();
        }
        coordinator.run();

        // Wait for ("blocking") canUnload to finish
        if (coordinator.hasAllEntities) {
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
        this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.createEvent(instruction));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.createEvent(instruction));
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
      if (instruction.useFullStateInstruction) {
        this.appendedInstructions = this.appendedInstructions.filter(instr => !instr.default);
      }

      // If there are any unresolved components (promises) to be appended, resolve them
      const unresolved = this.appendedInstructions.filter(instr => instr.component.isPromise());
      if (unresolved.length > 0) {
        // TODO(alpha): Fix type here
        await Promise.all(unresolved.map(instr => instr.component.resolve() as Promise<any>));
      }

      // Add appended instructions to either matched or remaining except default instructions
      // where there's a non-default already in the lists.
      if (this.appendInstructions.length > 0) {
        ({ matchedInstructions, earlierMatchedInstructions, remainingInstructions } =
          this.addAppendedInstructions(matchedInstructions, earlierMatchedInstructions, remainingInstructions, this.appendedInstructions));
        this.appendedInstructions = [];
      }

      // Once done with all explicit instructions...
      if (matchedInstructions.length === 0 && remainingInstructions.length === 0) {
        // ...create the (remaining) implicit clear instructions (if any)
        matchedInstructions = clearEndpoints.map(endpoint => RoutingInstruction.createClear(endpoint));
      }
    } while (matchedInstructions.length > 0 || remainingInstructions.length > 0);

    // TODO: Look into adding everything above as well
    return Runner.run(null,
      () => {
        coordinator.finalEntity();
        return coordinator.waitForSyncState('completed');
      },
      () => {
        coordinator.finalize();
        return this.updateNavigation(instruction);
      },
      () => {
        // Remove history entry if no history endpoint updated
        if (instruction.navigation.new && !instruction.navigation.first && !instruction.repeating && allChangedEndpoints.every(endpoint => endpoint.options.noHistory)) {
          instruction.untracked = true;
        }
        this.lastNavigation = this.processingNavigation;
        if (this.lastNavigation?.repeating ?? false) {
          this.lastNavigation!.repeating = false;
        }
        this.processingNavigation = null;
        return this.navigator.finalize(instruction);
      },
      () => {
        this.ea.publish(RouterNavigationCompleteEvent.eventName, RouterNavigationCompleteEvent.createEvent(instruction));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.createEvent(instruction));
      },

    ) as void | Promise<void>;
  };

  /**
   * Public API - Get endpoint by name
   */
  public getEndpoint(type: EndpointType, name: string): Endpoint | null {
    return this.allEndpoints(type).find(endpoint => endpoint.name === name) ?? null;
  }
  /**
   * Public API - Get all endpoints
   */
  public allEndpoints(type: EndpointType | null, includeDisabled: boolean = false, includeReplaced: boolean = false): Viewport[] {
    return this.rootScope!.scope
      .allScopes(includeDisabled, includeReplaced)
      .filter(scope => type === null || scope.type === type)
      .map(scope => scope.endpoint) as Viewport[];
  }
  /**
   * Public API (not yet implemented)
   */
  public addEndpoint(type: EndpointType, ...args: unknown[]): unknown {
    throw new Error('Not implemented');
  }

  /**
   * Called from the custom elements of endpoints
   *
   * @internal
   */
  public connectEndpoint(endpoint: Viewport | ViewportScope | null, type: EndpointType, connectedCE: IConnectedCustomElement, name: string, options?: IViewportOptions): Viewport | ViewportScope {
    const container = (connectedCE.container as IContainer & { parent: IContainer });
    const closestEndpoint = (container.has(Router.closestEndpointKey, true) ? container.get<Endpoint>(Router.closestEndpointKey) : this.rootScope) as Endpoint;
    const parentScope = closestEndpoint.connectedScope;
    if (endpoint === null) {
      endpoint = parentScope.addEndpoint(type, name, connectedCE, options);
      Registration.instance(Router.closestEndpointKey, endpoint).register(container);
      if (!this.isRestrictedNavigation) {
        this.pendingConnects.set(connectedCE, new OpenPromise());
      }
    } else {
      this.pendingConnects.get(connectedCE)?.resolve();
    }
    return endpoint;
  }
  /**
   * Called from the custom elements of endpoints
   *
   * @internal
   */
  public disconnectEndpoint(step: Step | null, endpoint: Viewport | ViewportScope, connectedCE: IConnectedCustomElement): void {
    if (!endpoint.connectedScope.parent!.removeEndpoint(step, endpoint, connectedCE)) {
      throw new Error("Failed to remove endpoint: " + endpoint.name);
    }
  }

  /**
   * Public API - THE navigation API
   */
  public async load(instructions: LoadInstruction | LoadInstruction[], options?: ILoadOptions): Promise<boolean | void> {
    options = options ?? {};
    instructions = this.extractQuery(instructions, options);

    let scope: RoutingScope | null = null;
    ({ instructions, scope } = this.applyLoadOptions(instructions, options));

    if ((options.append ?? false) && (!this.loadedFirst || this.processingNavigation !== null)) {
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
      replacing: options.replace,
      repeating: options.append,
      fromBrowser: false,
      origin: options.origin,
    });
    return this.navigator.navigate(entry);
  }

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
   * Public API
   */
  public refresh(): Promise<boolean | void> {
    return this.navigator.refresh();
  }

  /**
   * Public API
   */
  public back(): Promise<boolean | void> {
    return this.navigator.go(-1);
  }

  /**
   * Public API
   */
  public forward(): Promise<boolean | void> {
    return this.navigator.go(1);
  }

  /**
   * Public API
   */
  public go(delta: number): Promise<boolean | void> {
    return this.navigator.go(delta);
  }

  /**
   * Public API
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
   * Public API
   */
  public addRoutes(routes: IRoute[], context?: ICustomElementViewModel | Element): IRoute[] {
    // TODO: This should add to the context instead
    // TODO: Add routes without context to rootScope content (which needs to be created)?
    return [];
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.addRoutes(routes);
  }
  /**
   * Public API
   */
  public removeRoutes(routes: IRoute[] | string[], context?: ICustomElementViewModel | Element): void {
    // TODO: This should remove from the context instead
    // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
    // return viewport.removeRoutes(routes);
  }

  private appendInstructions(instructions: RoutingInstruction[], scope: RoutingScope | null = null): void {
    if (scope === null) {
      scope = this.rootScope!.scope;
    }
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = scope;
      }
    }
    this.appendedInstructions.push(...instructions);
  }

  private unknownRoute(route: string) {
    if (typeof route !== 'string' || route.length === 0) {
      return;
    }
    if (RouterOptions.useConfiguredRoutes && RouterOptions.useDirectRouting) {
      // TODO: Add missing/unknown route handling
      throw new Error("No matching configured route or component found for '" + route + "'");
    } else if (RouterOptions.useConfiguredRoutes) {
      // TODO: Add missing/unknown route handling
      throw new Error("No matching configured route found for '" + route + "'");
    } else {
      // TODO: Add missing/unknown route handling
      throw new Error("No matching route/component found for '" + route + "'");
    }
  }

  private ensureClearStateInstruction(instructions: RoutingInstruction[]): RoutingInstruction[] {
    if (instructions.length > 0) {
      const instruction = instructions[0];
      if (!instruction.isAddAll && !instruction.isClearAll) {
        const clearAll = RoutingInstruction.create(RoutingInstruction.clear()) as RoutingInstruction;
        clearAll.scope = instruction.scope;
        return [clearAll, ...instructions];
      }
    }
    return instructions;
  }

  private getClearAllEndpoints(instructions: RoutingInstruction[]): { clearEndpoints: Endpoint[]; instructions: RoutingInstruction[] } {
    let clearEndpoints: Endpoint[] = [];
    // For each clear all routing instruction...
    for (const clearInstruction of instructions.filter(instruction => instruction.isClearAll)) {
      // ... get the routing scope...
      const clearScope = clearInstruction.scope!;
      // ...and mark all endpoints in the scope to be cleared unless it's specified for something
      // else in the navigation...
      clearEndpoints = clearScope.allScopes()  // TODO(alpha): Verfiy the need for rootScope check below
        .filter(scope => !scope.endpoint.isEmpty && scope !== this.rootScope?.connectedScope)
        .map(scope => scope.endpoint);
    }
    // Remove the clear all instructions
    return { clearEndpoints, instructions: instructions.filter(instruction => !instruction.isClearAll) };
  }

  private matchEndpoints(instructions: RoutingInstruction[], alreadyFound: RoutingInstruction[], withoutViewports: boolean = false): { matchedInstructions: RoutingInstruction[]; remainingInstructions: RoutingInstruction[] } {
    const allMatchedInstructions: RoutingInstruction[] = [];
    const allRemainingInstructions: RoutingInstruction[] = [];

    while (instructions.length) {
      if (instructions[0].scope === null) {
        instructions[0].scope = this.rootScope!.scope;
      }
      const scope: RoutingScope = instructions[0].scope;
      const { matchedInstructions, remainingInstructions } = scope.matchEndpoints(instructions.filter(instruction => instruction.scope === scope), alreadyFound, withoutViewports);
      allMatchedInstructions.push(...matchedInstructions);
      allRemainingInstructions.push(...remainingInstructions);
      instructions = instructions.filter(instruction => instruction.scope !== scope);
    }
    return { matchedInstructions: allMatchedInstructions.slice(), remainingInstructions: allRemainingInstructions };
  }

  private findChildRoute(alreadyMatchedInstructions: RoutingInstruction[], configuredRoute: FoundRoute, configuredRoutePath: string | null) {
    let foundChildRoute = new FoundRoute();
    let configuredChildRoutePath = configuredRoutePath ?? '';

    // Get the first occurrence of all endpoints that are a part of the
    // currently processed configured route path
    const routeEndpoints = alreadyMatchedInstructions
      .filter(instr => instr.endpoint?.path === configuredRoutePath) // currently processed route path
      .map(instr => instr.endpoint!) // endpoints
      .filter((value, index, arr) => arr.indexOf(value) === index); // first occurrence

    // Go through all endpoints...
    for (const endpoint of routeEndpoints) {
      // ...looking for instructions...
      foundChildRoute = endpoint.scope.findInstructions(configuredRoute.remaining);
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

  private addAppendedInstructions(matchedInstructions: RoutingInstruction[], earlierMatchedInstructions: RoutingInstruction[], remainingInstructions: RoutingInstruction[], appendedInstructions: RoutingInstruction[]) {
    // Don't modify incoming originals
    matchedInstructions = [...matchedInstructions];
    earlierMatchedInstructions = [...earlierMatchedInstructions];
    remainingInstructions = [...remainingInstructions];
    appendedInstructions = [...appendedInstructions];

    // Process non-defaults first (by separating and adding back)
    const nonDefaultInstructions = appendedInstructions.filter(instr => !instr.default);
    const defaultInstructions = appendedInstructions.filter(instr => instr.default);
    appendedInstructions = [...nonDefaultInstructions, ...defaultInstructions];

    while (appendedInstructions.length > 0) {
      const appendedInstruction = appendedInstructions.shift() as RoutingInstruction;

      // Already matched (and processed) an instruction for this endpoint
      const foundEarlierExisting = earlierMatchedInstructions.some(instr => instr.sameViewport(appendedInstruction, true));
      // An already matched (but not processed) instruction for this endpoint
      const existingMatched = matchedInstructions.find(instr => instr.sameViewport(appendedInstruction, true));
      // An already found (but not matched or processed) instruction for this endpoint
      const existingRemaining = remainingInstructions.find(instr => instr.sameViewport(appendedInstruction, true));

      // If it's a default instruction that's already got a non-default in some way, just drop it
      if (appendedInstruction.default &&
        (foundEarlierExisting ||
          (existingMatched !== void 0 && !existingMatched.default) ||
          (existingRemaining !== void 0 && !existingRemaining.default))) {
        continue;
      }
      // There's already a matched instruction, but it's default (or appended instruction isn't) so it should be removed
      if (existingMatched !== void 0) {
        arrayRemove(matchedInstructions, value => value === existingMatched);
      }
      // There's already a remaining instruction, but it's default (or appended instruction isn't) so it should be removed
      if (existingRemaining !== void 0) {
        arrayRemove(remainingInstructions, value => value === existingRemaining);
      }
      // An appended instruction that already has a viewport instance is already matched
      if (appendedInstruction.viewport.instance !== null) {
        matchedInstructions.push(appendedInstruction);
      } else {
        remainingInstructions.push(appendedInstruction);
      }
    }
    return { matchedInstructions, earlierMatchedInstructions, remainingInstructions };
  }

  private ensureRootScope(): ViewportScope {
    if (!this.rootScope) {
      const root = this.container.get(IAppRoot);
      // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
      this.rootScope = new ViewportScope(this, 'rootScope', root.controller.viewModel as IConnectedCustomElement, null, true, root.config.component as CustomElementType);
    }
    return this.rootScope;
  }

  private async updateNavigation(navigation: Navigation): Promise<void> {
    (this.rootScope as ViewportScope).scope.reparentRoutingInstructions();
    let instructions: RoutingInstruction[] = (this.rootScope as ViewportScope).scope.hoistedChildren
      .filter(scope => scope.routingInstruction !== null && !scope.routingInstruction.component.none)
      .map(scope => scope.routingInstruction) as RoutingInstruction[];
    instructions = RoutingInstruction.clone(instructions, true);

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

    this.activeComponents = instructions;
    // this.activeRoute = navigation.route;

    // First invoke with viewport instructions (should it perhaps get full state?)
    let state = await RoutingHook.invokeTransformToUrl(instructions, navigation);
    if (typeof state !== 'string') {
      // Convert to string if necessary
      state = RoutingInstruction.stringify(state, false, true);
    }
    // Invoke again with string
    state = await RoutingHook.invokeTransformToUrl(state, navigation);

    const query = (navigation.query && navigation.query.length ? "?" + navigation.query : '');
    // if (instruction.path === void 0 || instruction.path.length === 0 || instruction.path === '/') {
    navigation.path = state + query;
    // }

    const fullViewportStates = [RoutingInstruction.create(RoutingInstruction.clear()) as RoutingInstruction];
    fullViewportStates.push(...RoutingInstruction.clone(instructions, this.statefulHistory));
    navigation.fullStateInstruction = fullViewportStates;

    if ((navigation.title ?? null) === null) {
      const title = await Title.getTitle(this, instructions, navigation);
      if (title !== null) {
        navigation.title = title;
      }
    }

    return Promise.resolve();
  }

  // TODO: Review query extraction; different pos for path and fragment!
  private extractQuery(instructions: LoadInstruction | LoadInstruction[], options: ILoadOptions): LoadInstruction | LoadInstruction[] {
    if (typeof instructions === 'string' && !options.query) {
      const [path, search] = instructions.split('?');
      instructions = path;
      options.query = search;
    }
    return instructions;
  }
}

export class RouterNavigationStartEvent extends Navigation {
  public static eventName = 'au:router:navigation-start';
  public eventName!: string;
  public static createEvent(navigation: Navigation): RouterNavigationStartEvent {
    return Object.assign(
      new RouterNavigationStartEvent(),
      navigation,
      { eventName: RouterNavigationStartEvent.eventName });
  }
}
export class RouterNavigationEndEvent extends Navigation {
  public static eventName = 'au:router:navigation-end';
  public eventName!: string;
  public static createEvent(navigation: Navigation): RouterNavigationEndEvent {
    return Object.assign(
      new RouterNavigationEndEvent(),
      navigation,
      { eventName: RouterNavigationEndEvent.eventName });
  }
}
export class RouterNavigationCancelEvent extends Navigation {
  public static eventName = 'au:router:navigation-cancel';
  public eventName!: string;
  public static createEvent(navigation: Navigation): RouterNavigationCancelEvent {
    return Object.assign(
      new RouterNavigationCancelEvent(),
      navigation,
      { eventName: RouterNavigationCancelEvent.eventName });
  }
}
export class RouterNavigationCompleteEvent extends Navigation {
  public static eventName = 'au:router:navigation-complete';
  public eventName!: string;
  public static createEvent(navigation: Navigation): RouterNavigationCompleteEvent {
    return Object.assign(
      new RouterNavigationCompleteEvent(),
      navigation,
      { eventName: RouterNavigationCompleteEvent.eventName });
  }
}
export class RouterNavigationErrorEvent extends Navigation {
  public static eventName = 'au:router:navigation-error';
  public eventName!: string;
  public static createEvent(navigation: Navigation): RouterNavigationErrorEvent {
    return Object.assign(
      new RouterNavigationErrorEvent(),
      navigation,
      { eventName: RouterNavigationErrorEvent.eventName });
  }
}
