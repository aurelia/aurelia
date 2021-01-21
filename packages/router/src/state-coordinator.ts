/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Navigation } from './navigation.js';
import { OpenPromise } from './utilities/open-promise.js';

export class Entity<T, S> {
  public running: boolean = false;
  public states: Map<S, OpenPromise | null> = new Map<S, OpenPromise | null>();
  public checkedStates: S[] = [];

  public syncState: S | null = null;
  public syncPromise: OpenPromise | null = null;

  public constructor(public entity: T) { }

  public hasReachedState(state: S): boolean {
    return this.states.has(state) && this.states.get(state) === null;
  }

  public hasStatePending(state: S): boolean {
    return this.states.has(state) && this.states.get(state) !== null;
  }
}

export class StateCoordinator<T, S> {
  public hasAllEntities = false;

  protected readonly entities: Entity<T, S>[] = [];

  protected readonly syncStates: Map<S, OpenPromise> = new Map<S, OpenPromise>();

  protected readonly checkedSyncStates: Set<S> = new Set();

  // public constructor(@ILogger private readonly logger: ILogger) {
  //   this.logger = logger.root.scopeTo('StateCoordinator');
  //   this.logger.trace('constructor()');
  // }

  public addSyncState(state: S): void {
    const openPromise = new OpenPromise();
    this.syncStates.set(state, openPromise);
  }

  public addEntity(entity: T): Entity<T, S> {
    // console.log('Entity received', entity);
    const ent = new Entity<T, S>(entity);
    this.entities.push(ent);
    this.resetSyncStates();
    return ent;
  }
  public addEntityState(entity: T, state: S): void {
    // console.log(`#### EntityState received ${state}`, (entity as any).name);
    let ent = this.entities.find(e => e.entity === entity);
    if (ent === void 0) {
      ent = this.addEntity(entity);
    }
    // Something is waiting for entity to reach the state...
    const openPromise = ent.states.get(state);
    if (openPromise instanceof OpenPromise) {
      // ...so resolve it
      openPromise.resolve();
    }
    ent.states.set(state, null);
    this.checkSyncState(state);
  }

  public waitForSyncState(state: S, entity: T | null = null): void | Promise<void> {
    if (this.entities.length === 0) {
      return;
    }
    const openPromise = this.syncStates.get(state);
    if (openPromise === void 0) {
      return;
    }

    if (entity !== null) {
      const ent = this.entities.find(e => e.entity === entity);
      if (ent?.syncPromise === null && openPromise.isPending) {
        ent.syncState = state;
        ent.syncPromise = new OpenPromise();
        ent.checkedStates.push(state);
        this.checkedSyncStates.add(state);
        Promise.resolve().then(() => {
          // console.log('then', 'syncState');
          this.checkSyncState(state);
        }).catch(err => { throw err; });
        return ent.syncPromise.promise;
      }
    }

    // this.checkSyncState(state);
    return openPromise.isPending ? openPromise.promise : void 0;
  }

  public waitForEntityState(entity: T, state: S): void | Promise<void> {
    if (!this.syncStates.has(state)) {
      return;
    }

    // Find the entity...
    let ent = this.entities.find(e => e.entity === entity);
    // ...adding it if it doesn't exist.
    if (ent == null) {
      ent = this.addEntity(entity);
    }

    // If we've already reached, return (no wait)
    if (ent.hasReachedState(state)) {
      return;
    }

    // Get open promise...
    let openPromise = ent.states.get(state);
    // ...creating a new one if necessary.
    if (openPromise == null) {
      openPromise = new OpenPromise();
      ent.states.set(state, openPromise);
    }

    // Return the promise to await
    return openPromise.promise;
  }

  public checkingSyncState(state: S): boolean {
    return this.syncStates.has(state);
  }
  public finalEntity(): void {
    this.hasAllEntities = true;
    // console.log('Final entity received', this.entities.length);
    this.syncStates.forEach((_promise: OpenPromise, state: S) => this.checkSyncState(state));
  }

  public finalize() { }

  public cancel() { }

  // A new navigation should cancel replaced instructions
  public cancelReplaced(navigation: Navigation) { }

  protected checkSyncState(state: S): void {
    // console.log('StateCoordinator check state', state, this);
    const openPromise = this.syncStates.get(state);
    if (openPromise === void 0) {
      return;
    }
    if (this.hasAllEntities &&
      openPromise.isPending &&
      // Check that this state has been done by all state entities and if so resolve the promise
      this.entities.every(ent => ent.hasReachedState(state)) &&
      // Check that this state has been checked (reached) by all state entities and if so resolve the promise
      (!this.checkedSyncStates.has(state) || this.entities.every(ent => ent.checkedStates.includes(state)))
    ) {
      for (const entity of this.entities) {
        if (entity.syncState === state) {
          // console.log('Resolving entity promise for ', state, (entity.entity as any).toString());
          entity.syncPromise?.resolve();
          entity.syncPromise = null;
          entity.syncState = null;
        }
      }
      openPromise.resolve();
      // console.log('#### StateCoordinator state resolved', state /*, this */);
    }
  }

  protected resetSyncStates(): void {
    this.syncStates.forEach((promise: OpenPromise, state: S) => {
      if (!promise.isPending && !this.entities.every(ent => ent.hasReachedState(state))) {
        this.addSyncState(state);
      }
    });
  }
}
