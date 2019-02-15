import { inject } from '@aurelia/kernel';
import { Router } from '@aurelia/router';
import { customElement } from '@aurelia/runtime';

import template from './with-nav.html';

@inject(Router)
@customElement({
  name: 'routerWithNav',
  template
})
export class RouterWithNav {
  constructor(private router: Router) { }
}
