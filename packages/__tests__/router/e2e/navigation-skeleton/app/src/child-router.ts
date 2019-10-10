import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
import * as html from './child-router.html';

@inject(IRouter)
@customElement({ name: 'child-router', template: html })
export class ChildRouter {
  // public reentryBehavior: ReentryBehavior = ReentryBehavior.refresh;

  public heading = 'Child Router';
  public router: IRouter;

  public constructor(router: IRouter) {
    this.router = router;
  }

  public binding() {
    this.router.setNav('child-menu', [
      { title: 'Welcome', route: 'welcome' },
      { title: 'Users', route: 'users' },
      { title: 'Child router', route: 'child-router' },
    ]);
  }
}
