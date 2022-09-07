import { IRouter } from './router';
import { Navigation } from './navigation';
import { IEndpoint } from './endpoints/endpoint';
import { OpenPromise } from './utilities/open-promise';
import { RoutingInstruction } from './instructions/routing-instruction';
import { arrayRemove } from './utilities/utils';
import { Step } from './index';

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
 */
export type NavigationState =
  'guardedUnload' | // fulfilled when canUnload (if any) has been called
  'guardedLoad' | // fulfilled when canLoad (if any) has been called
  'guarded' | // fulfilled when check hooks canUnload and canLoad (if any) have been called
  'unloaded' | // fulfilled when unload (if any) has been called
  'loaded' | // fulfilled when load (if any) has been called
  'routed' | // fulfilled when initial routing hooks (if any) have been called
  'bound' | // fulfilled when bind has been called
  'swapped' |
  'completed' // fulfilled when everything is done
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
   * The entities the coordinator is coordinating.
   */
  private readonly entities: Entity[] = [];

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
    // Find the entity...
    const entity = this.entities.find(e => e.endpoint === endpoint);
    if (entity !== void 0) {
      // ...and remove it.
      arrayRemove(this.entities, ent => ent === entity);
    }
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
  }

  /**
   * Cancel the navigation, calling cancelContentChange in all endpoints and
   * cancelling the navigation itself.
   */
  public cancel(): void {
    this.cancelled = true;
    // TODO: Take care of disabling viewports when cancelling and stateful!
    this.entities.forEach(entity => {
      const abort = entity.endpoint.cancelContentChange(this);
      if (abort instanceof Promise) {
        abort.catch(error => { throw error; });
      }
    });
    // TODO: Review this since it probably should happen in turn
    this.router.navigator.cancel(this.navigation).then(() => {
      this.navigation.process?.resolve(false);
    }).catch(error => { throw error; });
    this.completed = true;
    this.navigation.completed = true;
  }

  /**
   * Enqueue instructions that should be appended to the navigation
   *
   * @param instructions - The instructions that should be appended to the navigation
   */
  public enqueueAppendedInstructions(instructions: RoutingInstruction[]): void {
    this.appendedInstructions.push(...instructions);
  }

  /**
   * Dequeue appended instructions to either matched or remaining except default instructions
   * where there's a non-default already in the lists.
   *
   * @param matchedInstructions - The matched instructions
   * @param earlierMatchedInstructions - The earlier matched instructions
   * @param remainingInstructions - The remaining instructions
   * @param appendedInstructions - The instructions to append
   */
  public dequeueAppendedInstructions(matchedInstructions: RoutingInstruction[], earlierMatchedInstructions: RoutingInstruction[], remainingInstructions: RoutingInstruction[]) {
    let appendedInstructions = [...this.appendedInstructions];

    // Don't modify incoming originals
    matchedInstructions = [...matchedInstructions];
    remainingInstructions = [...remainingInstructions];

    // Process non-defaults first (by separating and adding back)
    const nonDefaultInstructions = appendedInstructions.filter(instr => !instr.default);
    const defaultInstructions = appendedInstructions.filter(instr => instr.default);
    // appendedInstructions = [...nonDefaultInstructions, ...defaultInstructions];
    appendedInstructions = nonDefaultInstructions.length > 0
      ? [...nonDefaultInstructions]
      : [...defaultInstructions];

    while (appendedInstructions.length > 0) {
      const appendedInstruction = appendedInstructions.shift() as RoutingInstruction;
      // Dequeue (remove) it from the appending instructions
      arrayRemove(this.appendedInstructions, instr => instr === appendedInstruction);

      // Already matched (and processed) an instruction for this endpoint
      const foundEarlierExisting = earlierMatchedInstructions.some(instr => !instr.cancelled && instr.sameEndpoint(appendedInstruction, true));
      // An already matched (but not processed) instruction for this endpoint
      const existingMatched = matchedInstructions.find(instr => instr.sameEndpoint(appendedInstruction, true));
      // An already found (but not matched or processed) instruction for this endpoint
      const existingRemaining = remainingInstructions.find(instr => instr.sameEndpoint(appendedInstruction, true));

      // If it's a default instruction that's already got a non-default in some way, just skip it
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
      if (appendedInstruction.endpoint.instance !== null) {
        matchedInstructions.push(appendedInstruction);
      } else {
        remainingInstructions.push(appendedInstruction);
      }
    }
    return { matchedInstructions, remainingInstructions };
  }

  /**
   * Check if a navigation state has been reached, notifying waiting
   * endpoints if so.
   *
   * @param state - The state to check
   */
  private checkSyncState(state: NavigationState): void {
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
}
