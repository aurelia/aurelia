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
        span: 'nav-link',
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
        condition: this.authenticated,
        route: `editor(type=new)`,
        title: '<i class="ion-compose"></i>&nbsp;New Post',
      },
      {
        condition: this.authenticated,
        route: `settings`,
        title: '<i class="ion-gear-a"></i>&nbsp;Settings',
      },
      {
        compareParameters: true,
        condition: this.notAuthenticated,
        route: `auth(type=login)`,
        title: 'Sign in',
      },
      {
        compareParameters: true,
        condition: this.notAuthenticated,
        route: `auth(type=register)`,
        title: 'Sign up',
      },
      {
        compareParameters: true,
        condition: this.authenticated,
        route: `profile(${this.sharedState.currentUser.username})`,
        title: `${this.sharedState.currentUser.username}`,
      },
    ];
    return routes;
  }

  public authenticated = (): boolean => {
    return this.sharedState.currentUser && this.sharedState.isAuthenticated;
  }
  public notAuthenticated = (): boolean => {
    return !this.authenticated();
  }
}
