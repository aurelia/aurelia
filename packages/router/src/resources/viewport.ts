import { inject } from '@aurelia/kernel';
import { bindable, customElement } from '@aurelia/runtime';
import { Router } from '../router';
import { IViewportOptions, Viewport } from '../viewport';

@inject(Router, Element)
@customElement({ name: 'au-viewport', template: '<template><div class="viewport-header"> Viewport: <b>${name}</b> </div></template>' })
export class ViewportCustomElement {
  @bindable public name: string = 'default';
  @bindable public scope: boolean;
  @bindable public usedBy: string;

  public viewport: Viewport;

  constructor(private router: Router, private element: Element) { }

  public attached(): void {
    const options: IViewportOptions = { scope: this.element.hasAttribute('scope') };
    if (this.usedBy && this.usedBy.length) {
      options.usedBy = this.usedBy;
    }
    this.viewport = this.router.addViewport(this.name, this.element, options);
  }
  public unbound(): void {
    this.router.removeViewport(this.viewport);
  }
}
