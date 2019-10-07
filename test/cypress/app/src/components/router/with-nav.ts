import { inject } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';
import template from './with-nav.html';

@inject(IRouter)
@customElement({
  name: 'routerWithNav',
  template
})
export class RouterWithNav {
  public constructor(private readonly router: IRouter) { }
}
