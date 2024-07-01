import { IRouter } from './router';
import { Navigation } from './navigation';
import { Endpoint, IEndpoint } from './endpoints/endpoint';
import { OpenPromise } from './utilities/open-promise';
import { RoutingInstruction } from './instructions/routing-instruction';
import { arrayAddUnique, arrayRemove } from './utilities/utils';
import { Route, RoutingHook, RoutingScope, Step } from './index';
import { EndpointMatcher } from './endpoint-matcher';

/**
 * The navigation coordinator coordinates navigation between endpoints/entities
 * and their navigation states. The coordinator keeps the endpoints synchronized
 * for the configured synchronization states, meaning that no endpoint can proceed
 * past a sync state until all endpoints have reached it. The coordinator also
 * provides synchronization on endpoint level which is used to make sure parent
 * hooks are done before child hooks start.
 *
 * Each endpoint that's involved in a navigation is added to the coordinator's
 * entities and report each completed navigation state to the coordinator
 * during the transition. Before an endpoint starts a new navigation step
 * it asks the coordinator whether it can proceed or should wait. The
 * coordinator instructs continuation if the endpoint's current step isn't
 * being synchronized or if all other endpoints have reached that state. If
 * one or more endpoints have been instructed to wait, they are instructed
 * to continue once all endpoints have reached the state they're waiting on.
 */

/**
 * The different navigation states each endpoint passes through (regardless
 * of whether they have hooks or not).
 * - **guardedUnload**: fulfilled when canUnload (if any) has been called
 * - **guardedLoad**: fulfilled when canLoad (if any) has been called
 * - **guarded**: fulfilled when check hooks canUnload and canLoad (if any) have been called
 * - **unloaded**: fulfilled when unloading (if any) has been called
 * - **loaded**: fulfilled when loading (if any) has been called
 * - **routed**: fulfilled when initial routing hooks (if any) have been called
 * - **bound**: fulfilled when bind has been called
 * - **swap**:
 * - **completed**: fulfilled when everything is done
 */
export type NavigationState =
  | 'guardedUnload'
  | 'guardedLoad'
  | 'guarded'
  | 'unloaded'
  | 'loaded'
  | 'routed'
  | 'bound'
  | 'swapped'
  | 'completed'
  ;

/**
 * The entity used to keep track of the endpoint and its states.
 */
class Entity {
  /**
   * Whether the entity's transition has started.
   */
  public running: boolean = false;
  /**
   * The navigation states the entity has reached.
   */
  public states: Map<NavigationState, OpenPromise | null> = new Map<NavigationState, OpenPromise | null>();
  /**
   * The navigation states the entity has checked (and therefore reached).
   */
  public checkedStates: NavigationState[] = [];

  /**
   * The navigation state the entity is currently syncing/waiting on.
   */
  public syncingState: NavigationState | null = null;
  /**
   * The (open) promise to resolve when the entity has reached its sync state.
   */
  public syncPromise: OpenPromise | null = null;

  /**
   * The Runner step that's controlling the transition in the entity.
   */
  public step: Step<void> | null = null;

  public constructor(
    /**
     * The endpoint for the entity
     */
    public endpoint: IEndpoint
  ) { }

  /**
   * Whether the entity has reached a specific state.
   *
   * @param state - The state to check
   */
  public hasReachedState(state: NavigationState): boolean {
    return this.states.has(state) && this.states.get(state) === null;
  }
}

export class NavigationCoordinatorOptions {
  /**
   * The navigation states the coordinator synchronized entities on.
   */
  public syncStates: NavigationState[];

  public constructor(input: Partial<NavigationCoordinatorOptions>) {
    this.syncStates = input.syncStates ?? [];
  }
}

export class NavigationCoordinator {
  public instructions: RoutingInstruction[] = [];
  public matchedInstructions: RoutingInstruction[] = [];
  public processedInstructions: RoutingInstruction[] = [];
  public changedEndpoints: IEndpoint[] = [];

  /**
   * Whether the coordinator is running/has started entity transitions.
   */
  public running = false;

  /**
   * Whether the coordinator's run is completed.
   */
  public completed = false;

  /**
   * Whether the coordinator's run is cancelled.
   */
  public cancelled = false;

  /**
   * Whether the coordinator has got all endpoints added.
   */
  public hasAllEndpoints = false;

  /**
   * Instructions that should be appended to the navigation
   */
  public appendedInstructions: RoutingInstruction[] = [];

  /**
   * Whether the coordinator is closed for new appended instructions.
   */
  public closed = false;

  /**
   * The entities the coordinator is coordinating.
   */
  public readonly entities: Entity[] = [];

  /**
   * The sync states the coordinator is coordinating.
   */
  private readonly syncStates: Map<NavigationState, OpenPromise> = new Map<NavigationState, OpenPromise>();

  /**
   * The sync states that's been checked (by any entity).
   */
  private readonly checkedSyncStates: Set<NavigationState> = new Set();

  public constructor(
    private readonly router: IRouter,

    /**
     * The navigation that created the coordinator.
     */
    public readonly navigation: Navigation,
  ) { }

  /**
   * Create a navigation coordinator.
   *
   * @param router - The router
   * @param navigation - The navigation that creates the coordinator
   * @param options - The navigation coordinator options
   */
  public static create(router: IRouter, navigation: Navigation, options: NavigationCoordinatorOptions): NavigationCoordinator {
    const coordinator = new NavigationCoordinator(router, navigation);

    // TODO: Set flow options from router
    options.syncStates.forEach((state: NavigationState) => coordinator.addSyncState(state));

    return coordinator;
  }

  /**
   * Append instructions to the current process.
   *
   * @param instructions - The instructions to append
   */
  public appendInstructions(instructions: RoutingInstruction[]): void {
    this.instructions.push(...instructions);
    this.manageDefaults();
  }

  /**
   * Remove instructions from the current process.
   *
   * @param instructions - The instructions to remove
   */
  public removeInstructions(instructions: RoutingInstruction[]): void {
    this.instructions = this.instructions.filter(instr => !instructions.includes(instr));
    this.matchedInstructions = this.matchedInstructions.filter(instr => !instructions.includes(instr));
  }

  private manageDefaults(): void {
    const router = this.router;

    // Process non-defaults first
    this.instructions = [...this.instructions.filter(instr => !instr.default), ...this.instructions.filter(instr => instr.default)];

    // Make sure all appended instructions have the correct scope
    this.instructions.forEach(instruction => {
      if (instruction.scope == null) {
        instruction.scope = this.navigation.scope ?? this.router.rootScope?.scope ?? null;
      }
    });

    const instructions = this.instructions.filter(instr => !instr.isClear(router));

    while (instructions.length > 0) {
      const instruction = instructions.shift() as RoutingInstruction;

      // Already processed an instruction for this endpoint
      const foundProcessed = this.processedInstructions.some(instr => !instr.isClear(router) && !instr.cancelled && instr.sameEndpoint(instruction, true));
      // An already matched (but not processed) instruction for this endpoint
      const existingMatched = this.matchedInstructions.find(instr => !instr.isClear(router) && instr.sameEndpoint(instruction, true));
      // An already existing (but not matched or processed) instruction for this endpoint
      const existingInstruction = this.instructions.find(instr => !instr.isClear(router) && instr.sameEndpoint(instruction, true) && instr !== instruction);

      // If it's a default instruction that's already got a non-default in some way, remove it
      if (instruction.default &&
        (foundProcessed ||
          (existingMatched !== void 0 && !existingMatched.default) ||
          (existingInstruction !== void 0 && !existingInstruction.default))) {
        arrayRemove(this.instructions, value => value === instruction);
        continue;
      }
      // There's already a matched instruction, but it's default (or appended instruction isn't) so it should be removed
      if (existingMatched !== void 0) {
        arrayRemove(this.matchedInstructions, value => value === existingMatched);
        continue;
      }
      // There's already an existing instruction, but it's default (or appended instruction isn't) so it should be removed
      if (existingInstruction !== void 0) {
        arrayRemove(this.instructions, value => value === existingInstruction);
      }
    }
  }

  /**
   * Process the appended instructions, moving them to matched or remaining.
   */
  public async processInstructions(): Promise<IEndpoint[]> {
    const changedEndpoints: IEndpoint[] = [];
    let guard = 100;
    while (this.instructions.length > 0) {
      if (!guard--) { // Guard against endless loop
        console.error('processInstructions endless loop', this.navigation, this.instructions);
        throw new Error('Endless loop');
      }
      // Process non-defaults first (by separating and adding back)
      this.instructions = [...this.instructions.filter(instr => !instr.default), ...this.instructions.filter(instr => instr.default)];

      const scope = this.instructions[0].scope!;
      if (scope == null) {
        throw new Error('No scope for instruction');
      }
      // eslint-disable-next-line no-await-in-loop
      changedEndpoints.push(...await this.processInstructionsForScope(scope));
    }
    return changedEndpoints;
  }

  public async processInstructionsForScope(scope: RoutingScope): Promise<IEndpoint[]> {
    const router = this.router;
    const options = router.configuration.options;

    // Get all endpoints affected by any clear all routing instructions and then remove those
    // routing instructions.
    const clearEndpoints = this.getClearAllEndpoints(scope);

    // If there are instructions for this scope that aren't part of an already found configured route...
    const nonRouteInstructions = this.getInstructionsForScope(scope).filter(instr => !(instr.route instanceof Route));
    if (nonRouteInstructions.length > 0) {
      // ...find the routing instructions for them. The result will be either that there's a configured
      // route (which in turn contains routing instructions) or a list of routing instructions
      // TODO(return): This needs to be updated
      const foundRoute = scope.findInstructions(nonRouteInstructions, options.useDirectRouting, options.useConfiguredRoutes);

      // Make sure we got routing instructions...
      if (nonRouteInstructions.some(instr => !instr.component.none || instr.route != null)
        && !foundRoute.foundConfiguration
        && !foundRoute.foundInstructions) {
        // ...call unknownRoute hook if we didn't...
        // TODO: Add unknownRoute hook here and put possible result in instructions
        throw this.createUnknownRouteError(nonRouteInstructions);
      }
      // ...and replace the non-route instructions with the found routing instructions.
      this.instructions.splice(this.instructions.indexOf(nonRouteInstructions[0]), nonRouteInstructions.length, ...foundRoute.instructions);
      // // ...and use any already found and the newly found routing instructions.

    }

    // If there are any unresolved components (functions or promises), resolve into components
    const unresolvedPromise = RoutingInstruction.resolve(this.getInstructionsForScope(scope));
    if (unresolvedPromise instanceof Promise) {
      await unresolvedPromise;
    }

    // Make sure "add all" instructions have the correct name and scope
    for (const addInstruction of this.getInstructionsForScope(scope).filter(instr => instr.isAddAll(router))) {
      addInstruction.endpoint.set(addInstruction.scope!.endpoint.name);
      addInstruction.scope = addInstruction.scope!.owningScope!;
    }

    let guard = 100;
    do {
      // Match the instructions to available endpoints within, and with the help of, their scope
      // TODO(return): This needs to be updated
      this.matchEndpoints(scope);

      if (!guard--) { // Guard against endless loop
        router.unresolvedInstructionsError(this.navigation, this.instructions);
      }
      const changedEndpoints: IEndpoint[] = [];

      // Get all the endpoints of matched instructions...
      const matchedEndpoints = this.matchedInstructions.map(instr => instr.endpoint.instance);
      // ...and create and add clear instructions for all endpoints that
      // aren't already in an instruction.
      this.matchedInstructions.push(...clearEndpoints
        .filter(endpoint => !matchedEndpoints.includes(endpoint))
        .map(endpoint => RoutingInstruction.createClear(router, endpoint)));

      // TODO: Review whether this await poses a problem (it's currently necessary for new viewports to load)
      // eslint-disable-next-line no-await-in-loop
      const hooked = await RoutingHook.invokeBeforeNavigation(this.matchedInstructions, this.navigation);
      if (hooked === false) {
        router.cancelNavigation(this.navigation, this);
        return [];
      } else if (hooked !== true && hooked !== this.matchedInstructions) {
        // TODO(return): Do a full findInstructions again with a new FoundRoute so that this
        // hook can return other values as well
        this.matchedInstructions = hooked;
      }

      for (const matchedInstruction of this.matchedInstructions) {
        const endpoint = matchedInstruction.endpoint.instance;
        if (endpoint !== null) {
          // Set endpoint path to the configured route path so that it knows it's part
          // of a configured route.
          // Inform endpoint of new content and retrieve the action it'll take
          const action = endpoint.setNextContent(matchedInstruction, this.navigation);
          if (action !== 'skip') {
            // Add endpoint to changed endpoints this iteration and to the coordinator's purview
            changedEndpoints.push(endpoint);
            this.addEndpoint(endpoint);
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
          arrayRemove(this.matchedInstructions, matched => matched !== matchedInstruction
            && matched.isClear(router) && dontClear.includes(matched.endpoint.instance!));
          // TODO: Does the below ever happen?! Parent is never in clearEndpoints, right?
          // And also exclude the routing instruction's parent viewport scope...
          if (!matchedInstruction.isClear(router) && matchedInstruction.scope?.parent?.isViewportScope) {
            // ...from clears...
            arrayRemove(clearEndpoints, clear => clear === matchedInstruction.scope!.parent!.endpoint);
            // ...and already matched clears.
            arrayRemove(this.matchedInstructions, matched => matched !== matchedInstruction
              && matched.isClear(router) && matched.endpoint.instance === matchedInstruction.scope!.parent!.endpoint);
          }

          // If the instruction has a next scope instructions, add them to the instructions
          // to be processed next...
          if (matchedInstruction.hasNextScopeInstructions) {
            this.instructions.push(...matchedInstruction.nextScopeInstructions!);
            // ...and if the endpoint has been changed/swapped, move the next scope instructions
            // into the new endpoint content scope and clear the endpoint instance.
            if (action !== 'skip') {
              for (const nextScopeInstruction of matchedInstruction.nextScopeInstructions!) {
                nextScopeInstruction.scope = endpoint.scope;
                nextScopeInstruction.endpoint.instance = null;
              }
            }
          } else {
            // If there are no next scope instructions the endpoint's scope (its children)
            // needs to be cleared
            clearEndpoints.push(...(matchedInstruction.endpoint.instance as Endpoint).scope.children.map(s => s.endpoint));
          }
        }
      }

      // In order to make sure all relevant canUnload are run on the first run iteration
      // we only run once all (top) instructions are doing something/there are no skip
      // action instructions.
      // If all first iteration instructions now do something the transitions can start
      const skipping = this.matchedInstructions.filter(instr => instr.endpoint.instance?.transitionAction === 'skip');
      const skippingWithMore = skipping.filter(instr => instr.hasNextScopeInstructions);
      if (skipping.length === 0 || (skippingWithMore.length === 0)) { // TODO: !!!!!!  && !foundRoute.hasRemaining)) {
        // If navigation is unrestricted (no other syncing done than on canUnload) we can
        // instruct endpoints to transition
        if (!router.isRestrictedNavigation) {
          this.finalEndpoint();
        }
        this.run();

        // Wait for ("blocking") canUnload to finish
        if (this.hasAllEndpoints) {
          const guardedUnload = this.waitForSyncState('guardedUnload');
          if (guardedUnload instanceof Promise) {
            // eslint-disable-next-line no-await-in-loop
            await guardedUnload;
          }
        }
      }

      // If, for whatever reason, this navigation got cancelled, stop processing
      if (this.cancelled) {
        router.cancelNavigation(this.navigation, this);
        return [];
      }

      // Add this iteration's changed endpoints (inside the loop) to the total of all
      // updated endpoints (outside the loop)
      arrayAddUnique(this.changedEndpoints, changedEndpoints);

      // Make sure these endpoints in these instructions stays unavailable
      this.processedInstructions.push(...this.matchedInstructions.splice(0));

      // If this isn't a restricted ("static") navigation everything will run as soon as possible
      // and then we need to wait for new viewports to be loaded before continuing here (but of
      // course only if we're running)
      // TODO: Use a better solution here (by checking and waiting for relevant viewports)
      if (!router.isRestrictedNavigation &&
        (this.matchedInstructions.length > 0 || this.instructions.length > 0) && this.running) {
        const waitForSwapped = this.waitForSyncState('swapped');
        if (waitForSwapped instanceof Promise) {
          // eslint-disable-next-line no-await-in-loop
          await waitForSwapped;
        }
      }

      this.instructions.push(...clearEndpoints.map(endpoint => RoutingInstruction.createClear(router, endpoint)));

      // If there are any unresolved components (functions or promises) to be appended, resolve them
      const unresolvedPromise = RoutingInstruction.resolve(this.matchedInstructions);
      if (unresolvedPromise instanceof Promise) {
        // eslint-disable-next-line no-await-in-loop
        await unresolvedPromise;
      }

      // Remove cancelled endpoints from changed endpoints (last instruction is cancelled)
      this.changedEndpoints = this.changedEndpoints.filter(endpoint => !([...this.processedInstructions]
        .reverse()
        .find(instruction => instruction.endpoint.instance === endpoint)
        ?.cancelled ?? false)
      );
    } while (this.matchedInstructions.length > 0 || this.getInstructionsForScope(scope).length > 0);

    return this.changedEndpoints;
  }

  /**
   * Get all instructions for a specific scope
   */
  public getInstructionsForScope(scope: RoutingScope): RoutingInstruction[] {
    // Make sure instruction defaults are removed if there are non-defaults
    this.manageDefaults();

    // Always process all non-default instructions first
    const instructions = this.instructions.filter(instr => instr.scope === scope && !instr.default);
    if (instructions.length > 0) {
      return instructions;
    }

    // If there are no non-default instructions, process all default instructions
    return this.instructions.filter(instr => instr.scope === scope);
  }

  /**
   * Ensure that there's a clear all instruction present in instructions for a scope.
   */
  public ensureClearStateInstruction(scope: RoutingScope): void {
    const router = this.router;
    if (!this.instructions.some(instr => instr.scope === scope && instr.isClearAll(router))) {
      const clearAll = RoutingInstruction.create(RoutingInstruction.clear(router)) as RoutingInstruction;
      clearAll.scope = scope;
      this.instructions.unshift(clearAll);
    }
  }

  /**
   * Match the instructions to available endpoints within, and with the help of, their scope.
   *
   * @param scope - The scope to match the instructions within
   * @param instructions - The instructions to matched
   * @param alreadyFound - The already found matches
   * @param disregardViewports - Whether viewports should be ignored when matching
   */
  public matchEndpoints(scope: RoutingScope, disregardViewports: boolean = false): void {
    const scopeInstructions = this.getInstructionsForScope(scope);

    const matchedInstructions = EndpointMatcher.matchEndpoints(
      scope,
      scopeInstructions,
      [...this.processedInstructions, ...this.matchedInstructions],
      disregardViewports
    ).matchedInstructions;

    this.matchedInstructions.push(...matchedInstructions);
    this.instructions = this.instructions.filter(instr => !matchedInstructions.includes(instr));
  }

  /**
   * Run the navigation coordination, transitioning all entities/endpoints
   */
  public run(): void {
    if (!this.running) {
      this.running = true;
      for (const entity of this.entities) {
        if (!entity.running) {
          entity.running = true;
          entity.endpoint.transition(this);
        }
      }
    }
  }

  /**
   * Add a navigation state to be synchronized.
   *
   * @param state - The state to add
   */
  public addSyncState(state: NavigationState): void {
    const openPromise = new OpenPromise();
    this.syncStates.set(state, openPromise);
  }

  /**
   * Add an endpoint to be synchronized.
   *
   * @param endpoint - The endpoint to add
   */
  public addEndpoint(endpoint: IEndpoint): Entity {
    const entity = new Entity(endpoint);
    this.entities.push(entity);
    // A new entity might invalidate earlier reached states, so reset
    this.recheckSyncStates();

    if (this.running) {
      // If we're running transitions, start the transition
      entity.endpoint.transition(this);
    }
    return entity;
  }

  /**
   * Remove an endpoint from synchronization.
   *
   * @param endpoint - The endpoint to remove
   */
  public removeEndpoint(endpoint: IEndpoint): void {
    const endpoints = this.entities.map(e => e.endpoint) as (IEndpoint & { parentViewport?: IEndpoint | null })[];
    const removes = [endpoint];
    let children = [endpoint];
    // Recursively find all children of the endpoint
    while (children.length > 0) {
      children = endpoints.filter(e => e?.parentViewport != null && children.includes(e.parentViewport));
      removes.push(...children);
    }

    // Remove the entities for the endpoint and all its children
    for (const remove of removes) {
      // Find the entity...
      const entity = this.entities.find(e => e.endpoint === remove);
      if (entity !== void 0) {
        // ...and remove it.
        arrayRemove(this.entities, ent => ent === entity);
      }
    }
    // Removing an entity might take us further along the overall process, so check ALL states
    this.checkSyncState();
  }

  /**
   * Set the Runner step controlling the transition for an endpoint.
   *
   * @param endpoint - The endpoint that gets the step set
   * @param step - The step that's controlling the transition
   */
  public setEndpointStep(endpoint: IEndpoint, step: Step<void>): void {
    // Find the entity for the endpoint...
    let entity = this.entities.find(e => e.endpoint === endpoint);
    if (entity === void 0) {
      // ...adding it if it doesn't exist.
      entity = this.addEndpoint(endpoint);
    }
    entity.step = step;
  }

  /**
   * Get the Runner step controlling the transition for an endpoint.
   *
   * @param endpoint - The endpoint to get the step for
   */
  public getEndpointStep(endpoint: IEndpoint): Step<void> | null {
    // Find the entity for the endpoint...
    const entity = this.entities.find(e => e.endpoint === endpoint);
    return entity?.step ?? null;
  }

  /**
   * Add a (reached) navigation state for an endpoint.
   *
   * @param endpoint - The endpoint that's reached a state
   * @param state - The state that's been reached
   */
  public addEndpointState(endpoint: IEndpoint, state: NavigationState): void {
    // Find the entity for the endpoint...
    let entity = this.entities.find(e => e.endpoint === endpoint);
    if (entity === void 0) {
      // ...adding it if it doesn't exist.
      entity = this.addEndpoint(endpoint);
    }
    // Something is waiting for this specific entity/endpoint to reach the state...
    const openPromise = entity.states.get(state);
    if (openPromise instanceof OpenPromise) {
      // ...so resolve it.
      openPromise.resolve();
    }
    entity.states.set(state, null);
    // Check if this was the last entity/endpoint needed to resolve the state
    this.checkSyncState(state);
  }

  /**
   * Wait for a navigation state to be reached. If endpoint is specified, it
   * will be marked as waiting for the state notified when it is reached (if
   * waiting is necessary).
   *
   * @param state - The state to wait for
   * @param endpoint - The specific endpoint to wait for
   */
  public waitForSyncState(state: NavigationState, endpoint: IEndpoint | null = null): void | Promise<void> {
    if (this.entities.length === 0) {
      return;
    }

    // Get the promise, if any, indicating that we're synchronizing this state...
    const openPromise = this.syncStates.get(state);
    if (openPromise === void 0) {
      // ...and return void (nothing to wait for) if it's not synchronized.
      return;
    }

    // If a specified endpoing is waiting for a state...
    if (endpoint !== null) {
      const entity = this.entities.find(e => e.endpoint === endpoint);
      // ...and it's got an entity without existing promise (and the state
      // is still pending)...
      if (entity?.syncPromise === null && openPromise.isPending) {
        // ...mark the entity as waiting for the state.
        entity.syncingState = state;
        entity.syncPromise = new OpenPromise();
        // Also add the state as checked for the entity...
        entity.checkedStates.push(state);
        // ...and over all.
        this.checkedSyncStates.add(state);
        Promise.resolve().then(() => {
          // Check if this has resolved anything waiting
          this.checkSyncState(state);
        }).catch(err => { throw err; });
        // Return the promise to await
        return entity.syncPromise.promise;
      }
    }

    // Return the promise to await if it's still pending
    return openPromise.isPending ? openPromise.promise : void 0;
  }

  /**
   * Wait (if necessary) for an endpoint to reach a specific state.
   *
   * @param endpoint - The endpoint to wait for
   * @param state - The state to wait for
   */
  public waitForEndpointState(endpoint: IEndpoint, state: NavigationState): void | Promise<void> {
    if (!this.syncStates.has(state)) {
      return;
    }

    // Find the entity...
    let entity = this.entities.find(e => e.endpoint === endpoint);
    // ...adding it if it doesn't exist.
    if (entity == null) {
      entity = this.addEndpoint(endpoint);
    }

    // If we've already reached, return (no wait)
    if (entity.hasReachedState(state)) {
      return;
    }

    // Get open promise...
    let openPromise = entity.states.get(state);
    // ...creating a new one if necessary.
    if (openPromise == null) {
      openPromise = new OpenPromise();
      entity.states.set(state, openPromise);
    }

    // Return the promise to await
    return openPromise.promise;
  }

  /**
   * Notify that all endpoints has been added to the coordinator.
   */
  public finalEndpoint(): void {
    this.hasAllEndpoints = true;

    // Check all synchronized states to see which has been reached
    this.syncStates.forEach((_promise: OpenPromise, state: NavigationState) => this.checkSyncState(state));
  }

  /**
   * Finalize the navigation, calling finalizeContentChange in all endpoints.
   */
  public finalize(): void {
    this.entities.forEach(entity => entity.endpoint.finalizeContentChange(this, null));
    this.completed = true;
    this.navigation.completed = true;
    this.syncStates.clear();
  }

  /**
   * Cancel the navigation, calling cancelContentChange in all endpoints and
   * cancelling the navigation itself.
   */
  public cancel(): void {
    this.cancelled = true;
    this.instructions = [];
    this.matchedInstructions = [];
    // TODO: Take care of disabling viewports when cancelling and stateful!
    this.entities.forEach(entity => {
      const abort = entity.endpoint.cancelContentChange(this);
      if (abort instanceof Promise) {
        abort.catch(error => { throw error; });
      }
    });
    // TODO: Review this since it probably should happen in turn
    this.router.navigator.cancel(this.navigation)
      .then(() => {
        this.navigation.process?.resolve(false);
      })
      .catch(error => { throw error; });
    this.completed = true;
    this.navigation.completed = true;
    // Resolve awaiting processes
    [...this.syncStates.values()].forEach(promise => {
      if (promise.isPending) {
        promise.resolve();
      }
    });
    this.syncStates.clear();
  }

  /**
   * Check if a navigation state has been reached, notifying waiting
   * endpoints if so.
   *
   * @param state - The state to check
   */
  private checkSyncState(state?: NavigationState): void {
    if (state === void 0) {
      // Check all synchronized states to see which has been reached
      this.syncStates.forEach((_promise: OpenPromise, state: NavigationState) => this.checkSyncState(state));
      return;
    }
    // Get the promise, if any, indicating that we're synchronizing this state...
    const openPromise = this.syncStates.get(state);
    if (openPromise === void 0) {
      // ...and return void (nothing to wait for) if it's not synchronized.
      return;
    }
    // States aren't reached until all endpoints have been added (but the
    // router can tell the coordinator that all endpoints have been added
    // even though they haven't, to get the states reached)
    if (this.hasAllEndpoints &&
      openPromise.isPending &&
      // Check that this state has been done by all state entities and if so resolve the promise
      this.entities.every(ent => ent.hasReachedState(state)) &&
      // Check that this state has been checked (reached) by all state entities and if so resolve the promise
      (!this.checkedSyncStates.has(state) || this.entities.every(ent => ent.checkedStates.includes(state)))
    ) {
      for (const entity of this.entities) {
        if (entity.syncingState === state) {
          entity.syncPromise?.resolve();
          entity.syncPromise = null;
          entity.syncingState = null;
        }
      }
      openPromise.resolve();
    }
  }

  /**
   * Re-check the sync states (since a new endpoint has been added) and add
   * now unresolved ones back.
   */
  private recheckSyncStates(): void {
    this.syncStates.forEach((promise: OpenPromise, state: NavigationState) => {
      if (!promise.isPending && !this.entities.every(ent => ent.hasReachedState(state))) {
        this.addSyncState(state);
      }
    });
  }

  /**
   * Get all endpoints affected by any clear all routing instructions and then remove those
   * routing instructions.
   *
   * @param instructions - The instructions to process
   */
  private getClearAllEndpoints(scope: RoutingScope): Endpoint[] {
    const router = this.router;
    let clearEndpoints: Endpoint[] = [];

    // If there's any clear all routing instruction...
    if (this.instructions.some(instr => (instr.scope ?? scope) === scope && instr.isClearAll(router))) {
      // ...get all the endpoints to be cleared...
      clearEndpoints = scope.enabledChildren  // TODO(alpha): Verify the need for rootScope check below
        .filter(sc => !sc.endpoint.isEmpty) // && sc !== this.router.rootScope?.connectedScope)
        .map(sc => sc.endpoint);
      // ...and remove the clear all instructions
      this.instructions = this.instructions.filter(instr => !((instr.scope ?? scope) === scope && instr.isClearAll(router)));
    }
    return clearEndpoints;
  }

  /**
   * Deal with/throw an unknown route error.
   *
   * @param instructions - The failing instructions
   */
  private createUnknownRouteError(instructions: RoutingInstruction[]) {
    const options = this.router.configuration.options;
    const route = RoutingInstruction.stringify(this.router, instructions);
    // TODO: Add missing/unknown route handling
    if (instructions[0].route != null) {
      if (!options.useConfiguredRoutes) {
        return new Error(`Can not match '${route}' since the router is configured to not use configured routes.`);
      } else {
        return new Error(`No matching configured route found for '${route}'.`);
      }
    } else if (options.useConfiguredRoutes && options.useDirectRouting) {
      return new Error(`No matching configured route or component found for '${route}'.`);
    } else if (options.useConfiguredRoutes) {
      return new Error(`No matching configured route found for '${route}'.`);
    } else {
      return new Error(`No matching route/component found for '${route}'.`);
    }
  }
}
