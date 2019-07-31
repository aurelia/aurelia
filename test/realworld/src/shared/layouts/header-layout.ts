import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { customElement, IObserverLocator, LifecycleFlags } from '@aurelia/runtime';
import { SharedState } from 'shared/state/shared-state';
import template from './header-layout.html';

@inject(IRouter, SharedState)
@customElement({ name: "header-layout", template })
export class HeaderLayout {
  constructor(private readonly router: IRouter, private readonly sharedState: SharedState) {
    const observerLocator = this.router.container.get(IObserverLocator);
    const observer = observerLocator.getObserver(LifecycleFlags.none, this.sharedState, 'isAuthenticated') as any;
    observer.subscribe(this);
  }

  public handleChange(): void {
    this.router.setNav('main',
      this.routes,
      {
        ul: 'nav navbar-nav pull-xs-right',
        li: 'nav-item',
        a: 'nav-link',
        aActive: 'active',
      });
  }

  public get routes() {
    const routes = [
      {
        route: `home`,
        title: 'Home',
      },
      {
        route: `editor(type=new)`,
        title: '<i class="ion-compose"></i>&nbsp;New Post',
        condition: this.authenticated
      },
      {
        route: `settings`,
        title: '<i class="ion-gear-a"></i>&nbsp;Settings',
        condition: this.authenticated
      },
      {
        route: `auth(type=login)`,
        title: 'Sign in',
        condition: !this.authenticated
      },
      {
        route: `auth(type=register)`,
        title: 'Sign up',
        condition: !this.authenticated
      },
      {
        route: `profile(${this.sharedState.currentUser.username})`,
        title: `${this.sharedState.currentUser.username}`,
        condition: this.authenticated
      },
    ];
    return routes
      .filter((r) => r.condition === undefined || r.condition)
      .map((r) => { return { route: r.route, title: r.title } });
  }

  public get authenticated() {
    return this.sharedState.currentUser && this.sharedState.isAuthenticated;
  }
}
