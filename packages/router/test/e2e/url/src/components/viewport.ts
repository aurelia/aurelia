import { inject } from '@aurelia/kernel';
import { bindable } from "@aurelia/runtime";
import { customElement } from '@aurelia/runtime';
import * as template from './viewport.html';
import { Router } from '../../../../src/router';
import { Viewport } from './../../../../src/viewport';

@inject(Router, Element)
@customElement({ name: 'viewport', template })
export class ViewportCustomElement {
  @bindable name: string;

  public viewport: Viewport;

  constructor(private router: Router, private element: Element) { }

  bound() {
    this.viewport = this.router.addViewport(this.name, this.element, this);
  }
}
