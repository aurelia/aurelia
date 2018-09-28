import { customElement } from '@aurelia/runtime';
import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

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
  constructor(public router: IRouter) { }

  public navigate(url: string): void {
    this.router.pushState(null, null, url);
  }
}
