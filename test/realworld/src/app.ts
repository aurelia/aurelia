import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { customElement, IObserverLocator, IViewModel, LifecycleFlags } from '@aurelia/runtime';
import template from './app.html';
import { UserService } from './shared/services/user-service';
import { SharedState } from './shared/state/shared-state';

@customElement({ name: 'app', template })
@inject(IRouter, UserService, SharedState)
export class App implements IViewModel {
  private message: string;

  constructor(
    private readonly router: IRouter,
    private readonly userService: UserService,
    private readonly state: SharedState,
  ) {
    this.message = 'Hello World!'; // just for unit testing ;)
  }

  public async bound() {
    this.router.guardian.addGuard(
      () => {
        if (this.state.isAuthenticated) { return true; }
        this.router.goto(`auth(type=login)`);
        return [];
      }
      , { include: [{ componentName: 'editor' }, { componentName: 'settings' }] },
    );
    const observerLocator = this.router.container.get(IObserverLocator);
    const observer = observerLocator.getObserver(LifecycleFlags.none, this.state, 'isAuthenticated') as any;
    observer.subscribe(this);

    this.userService.populate();
  }

  public handleChange(): void {
    this.router.updateNav();
  }
}
