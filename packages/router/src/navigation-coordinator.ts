import { IRouter } from './router.js';
import { Navigation } from './navigation.js';
import { IEndpoint } from './endpoints/endpoint.js';
import { OpenPromise } from './utilities/open-promise.js';

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
  public syncState: NavigationState | null = null;
  /**
   * The (open) promise to resolve when the entity has reached its sync state.
   */
  public syncPromise: OpenPromise | null = null;

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
   * Whether the coordinator's run is cancelled.
   */
  public cancelled = false;

  /**
   * Whether the coordinator has got all endpoints added.
   */
  public hasAllEndpoints = false;

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
    private readonly navigation: Navigation,
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
          if (this.cancelled) {
            break;
          }
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
        entity.syncState = state;
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
    this.entities.forEach(entity => entity.endpoint.finalizeContentChange());
  }

  /**
   * Cancel the navigation, calling abortContentChange in all endpoints and
   * cancelling the navigation itself.
   */
  public cancel(): void {
    this.cancelled = true;
    // TODO: Take care of disabling viewports when cancelling and stateful!
    this.entities.forEach(entity => {
      const abort = entity.endpoint.abortContentChange(null);
      if (abort instanceof Promise) {
        abort.catch(error => { throw error; });
      }
    });
    this.router.navigator.cancel(this.navigation).then(() => {
      this.router.processingNavigation = null;
      if (this.navigation.resolve != null) {
        this.navigation.resolve(false);
      }
    }).catch(error => { throw error; });
  }

  // TODO: A new navigation should cancel replaced instructions
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public cancelReplaced(navigation: Navigation): void { }

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
        if (entity.syncState === state) {
          entity.syncPromise?.resolve();
          entity.syncPromise = null;
          entity.syncState = null;
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
