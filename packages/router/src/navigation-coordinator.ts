/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IRouter } from './router.js';
import { Navigation } from './navigation.js';
import { StateCoordinator, Entity } from './state-coordinator.js';
import { IEndpoint } from './endpoints/endpoint.js';

export type NavigationState =
  'guardedUnload' | // fulfilled when canUnload has been called
  'guardedLoad' | // fulfilled when canLoad has been called
  'guarded' | // fulfilled when check hooks canUnload and canLoad (if any) have been called
  'routed' | // fulfilled when initial routing hooks (if any) have been called
  'loaded' | // fulfilled when load has been called
  'bound' | // fulfilled when bind has been called (I think I want this back)
  'swapped' |
  'unloaded' | // fulfilled when unload has been called
  'completed' // fulfilled when everything is done
  ;
export type NavigationStep =
  'checkUnload' | // can't be controlled
  'checkLoad' |
  'route' | // run routing hooks (if any)
  'load' |
  // 'bind' | // (I think I want this back)
  'swap' |
  'unload' |
  'complete'
  ;

export class NavigationCoordinatorOptions {
  public syncStates: NavigationState[];

  public constructor(input: Partial<NavigationCoordinatorOptions>) {
    // console.log('NavigationCoordinatorOptions constructor', input);
    this.syncStates = input.syncStates ?? [];
  }
}

export class NavigationCoordinator extends StateCoordinator<IEndpoint, NavigationState> {
  public static lastId = 0;

  public id: number;

  public  running = false;
  public cancelled = false;

  private router!: IRouter;
  private navigation!: Navigation;


  public constructor() {
    super();
    this.id = ++NavigationCoordinator.lastId;
  }

  public static create(router: IRouter, navigation: Navigation, options: NavigationCoordinatorOptions): StateCoordinator<IEndpoint, NavigationState> {
    const coordinator = new NavigationCoordinator();
    coordinator.router = router;
    coordinator.navigation = navigation;

    // TODO: Set flow options from router
    options.syncStates.forEach((state: NavigationState) => coordinator.addSyncState(state));

    // console.log('NavigationCoordinator created', coordinator);
    return coordinator;
  }

  // public get isRestrictedNavigation(): boolean {
  //   return this.syncStates.has('guardedLoad') ||
  //     this.syncStates.has('unloaded') ||
  //     this.syncStates.has('loaded') ||
  //     this.syncStates.has('guarded') ||
  //     this.syncStates.has('routed');
  // }

  public run(): void {
    if (!this.running) {
      // console.log('NavigationCoordinator RUN' /*, { ...this } */);
      this.running = true;
      for (const entity of this.entities) {
        if (!entity.running) {
          entity.running = true;
          entity.entity.transition(this);
        }
      }
    }
  }

  public addEntity(entity: IEndpoint): Entity<IEndpoint, NavigationState> {
    const ent = super.addEntity(entity);
    if (this.running) {
      ent.entity.transition(this);
    }
    return ent;
  }

  public finalize(): void {
    this.entities.forEach(entity => entity.entity.finalizeContentChange());
  }

  public cancel(): void {
    this.cancelled = true;
    // TODO: Take care of disabling viewports when cancelling and stateful!
    this.entities.forEach(entity => {
      const abort = entity.entity.abortContentChange(null);
      if (abort instanceof Promise) {
        abort.catch(error => { throw error; });
      }
    });
    this.router.navigator.cancel(this.navigation).then(() => {
      // console.log('then', 'cancel');
      this.router.processingNavigation = null;
      if (this.navigation.resolve != null) {
        this.navigation.resolve(false);
      }
    }).catch(error => { throw error; });
  }

  // A new navigation should cancel replaced instructions
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public cancelReplaced(navigation: Navigation): void { }
}
