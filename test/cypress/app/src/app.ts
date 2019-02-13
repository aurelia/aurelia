import { customElement, inject } from '@aurelia/runtime';
import { Router } from '@aurelia/router';

import template from './app.html';

@customElement({ name: 'app', template })
@inject(Router)
export class App {
  constructor(private router: Router) { }

  public attached() {
    this.router.activate();
  }
}
