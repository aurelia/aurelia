import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import { Router } from '@aurelia/router';
import template from './app.html';

@inject(Router)
@customElement({ name: 'app', template })
export class App {
  public constructor(private readonly router: Router) { }

  public attached() {
    this.router.activate();
  }
}
