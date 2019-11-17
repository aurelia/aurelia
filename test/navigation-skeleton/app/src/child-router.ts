import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';

import * as template from './child-router.html';

@customElement({ name: 'child-router', template })
export class ChildRouter {
  // public reentryBehavior: ReentryBehavior = ReentryBehavior.refresh;

  public heading: string = 'Child Router';

  public constructor(
    @IRouter public readonly router: IRouter,
  ) {}

  public binding() {
    this.router.setNav('child-menu', [
      { title: 'Welcome', route: 'welcome' },
      { title: 'Users', route: 'users' },
      { title: 'Child router', route: 'child-router' },
    ]);
  }
}
