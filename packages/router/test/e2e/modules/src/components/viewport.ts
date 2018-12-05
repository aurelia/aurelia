import { IViewportOptions } from './../../../../../src/viewport';
import { inject } from '@aurelia/kernel';
import { bindable } from "@aurelia/runtime";
import { customElement } from '@aurelia/runtime';
// import * as template from './viewport.html';
import { Router } from '../../../../../src/router';
import { Viewport } from '../../../../../src/viewport';

@inject(Router, Element)
@customElement({ name: 'viewport', template: '<template><div class="viewport-header"> Viewport: <b>${name}</b> </div></template>' })
export class ViewportCustomElement {
  @bindable name: string = 'default';
  @bindable scope: boolean;
  @bindable usedBy: string;

  public viewport: Viewport;

  constructor(private router: Router, private element: Element) { }

  attached() {
    let options: IViewportOptions = { scope: this.element.hasAttribute('scope') };
    if (this.usedBy && this.usedBy.length) {
      options.usedBy = this.usedBy;
    }
    this.viewport = this.router.addViewport(this.name, this.element, options);
  }
  unbound() {
    // TODO: There's something hinky with remove!
    this.router.removeViewport(this.viewport);
  }
}
