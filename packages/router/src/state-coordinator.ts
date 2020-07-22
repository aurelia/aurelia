import { Navigation } from './navigation';
// import { ILogger } from '@aurelia/kernel';

type NavigationState = ('entered' | 'swapped' | 'left');

export class Entity<T, S> {
  public states: S[] = [];

  public constructor(public entity: T) { }
}

class OpenPromise {
  public isPending: boolean = true;
  public promise!: Promise<void>;
  public resolve!: (value: void | PromiseLike<void>) => void;
  public reject!: (value: void | PromiseLike<void>) => void;
}

export class StateCoordinator<T, S> {
  protected readonly entities: Entity<T, S>[] = [];
  protected hasAllEntities: boolean = false;

  protected readonly syncStates: Map<S, OpenPromise> = new Map();

  // public constructor(@ILogger private readonly logger: ILogger) {
  //   this.logger = logger.root.scopeTo('StateCoordinator');
  //   this.logger.trace('constructor()');
  // }

  public addSyncState(state: S): void {
    const openPromise = new OpenPromise();
    openPromise.promise = new Promise((res, rej) => {
      openPromise.resolve = res;
      openPromise.reject = rej;
    });
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
    // console.log('#### EntityState received', state, entity);
    let ent = this.entities.find(e => e.entity === entity);
    if (ent === void 0) {
      ent = this.addEntity(entity);
    }
    ent.states.push(state);
    this.checkSyncState(state);
  }

  public syncState(state: S): void | Promise<void> {
    const openPromise = this.syncStates.get(state);
    if (openPromise === void 0) {
      return;
    }
    this.checkSyncState(state);
    return openPromise.promise;
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
    if (//this.hasAllEntities &&
      openPromise.isPending &&
      // Check that this state has been reached by all state entities and if so resolve the promise
      this.entities.every(ent => ent.states.includes(state))) {
      openPromise.resolve();
      openPromise.isPending = false;
      // console.log('StateCoordinator state resolved', state, this);
    }
  }

  protected resetSyncStates(): void {
    this.syncStates.forEach((promise: OpenPromise, state: S) => {
      if (!promise.isPending) {
        if (!this.entities.every(entity => entity.states.includes(state))) {
          this.addSyncState(state);
        }
      }
    });
  }
}
