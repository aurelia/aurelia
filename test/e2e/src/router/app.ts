import { customElement } from '@aurelia/runtime';
import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { Page1 } from './page1';
import { Page2 } from './page2';

@customElement({
  name: 'app',
  templateOrNode: require('./app.html'),
  build: {
    required: true,
    compiler: 'default'
  },
  instructions: [],
  dependencies: []
})
@inject(IRouter)
export class App {
  constructor(public router: IRouter) {
    router.addRoute({ path: 'page1', target: Page1, name: 'default' });
    router.addRoute({ path: 'page2', target: Page2, name: 'default' });
  }

  public navigate(url: string): void {
    this.router.pushState(null, null, url);
  }
}
