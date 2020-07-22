import { IScopeOwner } from './scope';
import { IRouter } from './router';
import { Navigation } from './navigation';
import { StateCoordinator, Entity } from './state-coordinator';

type NavigationState = (
  'couldLeave' | // fulfilled when canUnload/canLeave has been called
  'couldEnter' | // fulfilled when canLoad/canEnter has been called
  'routed' | // fulfilled when initial routing hooks (if any) have been called
  'entered' | // fulfilled when load/enter has been called
  // 'bound' | // fulfilled when bind has been called (I think I want this back)
  'swapped' |
  'left' | // fulfilled when unload/leave has been called
  'completed' // fulfilled when everything is done
);

export class NavigationCoordinatorOptions {
  public syncStates: NavigationState[];

  public constructor(input: Partial<NavigationCoordinatorOptions>) {
    // console.log('NavigationCoordinatorOptions constructor', input);
    this.syncStates = input.syncStates ?? [];
  }
}

export class NavigationCoordinator extends StateCoordinator<IScopeOwner, NavigationState> {
  private router!: IRouter;
  private navigation!: Navigation;

  private running: boolean = false;

  public static create(router: IRouter, navigation: Navigation, options: NavigationCoordinatorOptions): StateCoordinator<IScopeOwner, NavigationState> {
    const coordinator = new NavigationCoordinator();
    coordinator.router = router;
    coordinator.navigation = navigation;

    // TODO: Set flow options from router
    options.syncStates.forEach((state: NavigationState) => coordinator.addSyncState(state));

    // console.log('NavigationCoordinator created', coordinator);
    return coordinator;
  }

  public run() {
    if (!this.running) {
      // console.log('NavigationCoordinator RUN', this);
      this.running = true;
      this.entities.forEach(entity => entity.entity.swap(this));
    }
  }

  public addEntity(entity: IScopeOwner): Entity<IScopeOwner, NavigationState> {
    const ent = super.addEntity(entity);
    if (this.running) {
      ent.entity.swap(this);
    }
    return ent;
  }

  public finalize() {
    this.entities.forEach(entity => entity.entity.finalizeContentChange());
  }

  public cancel() {
    // TODO: Take care of disabling viewports when cancelling and stateful!
    this.entities.forEach(entity => { entity.entity.abortContentChange().catch(error => { throw error; }); });
    this.router.navigator.cancel(this.navigation).then(() => {
      this.router.processingNavigation = null;
      (this.navigation.resolve as ((value: void | PromiseLike<void>) => void))();
    }).catch(error => { throw error; });
  }

  // A new navigation should cancel replaced instructions
  public cancelReplaced(navigation: Navigation) { }
}
