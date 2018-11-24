import { inject } from '@aurelia/kernel';
import { bindable } from "@aurelia/runtime";
import { customElement } from '@aurelia/runtime';
import * as template from './viewport.html';
import { Router } from '../../../../../src/router';
import { Viewport } from '../../../../../src/viewport';

@inject(Router, Element)
@customElement({ name: 'viewport', template })
export class ViewportCustomElement {
  @bindable name: string;
  @bindable scope: boolean;

  public viewport: Viewport;

  constructor(private router: Router, private element: Element) { }

  attached() {
    this.viewport = this.router.addViewport(this.name, this.element, this.scope ? true : false);
  }
  unbound() {
    // TODO: There's something hinky with remove!
    this.router.removeViewport(this.viewport);
  }
}
