import { inject } from '@aurelia/kernel';
import { Router, Viewport } from '@aurelia/router';
import { bindable, customElement } from '@aurelia/runtime';
import * as template from './goto.html';

@inject(Router, Element)
@customElement({ name: 'goto', template })
export class GotoCustomElement {
  @bindable public views: string | Record<string, Viewport>;
  @bindable public title: string;
  @bindable public parameters: Record<string, unknown>;

  public constructor(private readonly router: Router, private readonly element: Element) { }

  public click() {
    this.router.goto(this.views, this.title, this.parameters);
  }
}
