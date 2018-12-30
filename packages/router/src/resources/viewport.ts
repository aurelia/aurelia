import { bindable, CustomElementResource, INode } from '@aurelia/runtime';
import { Router } from '../router';
import { IViewportOptions, Viewport } from '../viewport';

export class ViewportCustomElement {
  public static readonly inject: ReadonlyArray<Function> = [Router, INode];

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
// tslint:disable-next-line:no-invalid-template-strings
CustomElementResource.define({ name: 'au-viewport', template: '<template><div class="viewport-header"> Viewport: <b>${name}</b> </div></template>' }, ViewportCustomElement);
