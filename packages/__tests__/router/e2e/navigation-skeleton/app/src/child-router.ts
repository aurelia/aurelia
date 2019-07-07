import { customElement } from '@aurelia/runtime';
import * as html from './child-router.html';
import { Router, ReentryBehavior } from '@aurelia/router';
import { inject } from '@aurelia/kernel';

@inject(Router)
@customElement({ name: 'child-router', template: html })
export class ChildRouter {
  // public reentryBehavior: ReentryBehavior = ReentryBehavior.refresh;

  public heading = 'Child Router';
  public router: Router;

  constructor(router: Router) {
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
