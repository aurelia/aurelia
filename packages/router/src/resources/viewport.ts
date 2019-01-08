import { bindable, CustomElementResource, INode, LifecycleFlags } from '@aurelia/runtime';
import { Router } from '../router';
import { IViewportOptions, Viewport } from '../viewport';

export class ViewportCustomElement {
  public static readonly inject: ReadonlyArray<Function> = [Router, INode];

  @bindable public name: string;
  @bindable public scope: boolean;
  @bindable public usedBy: string;
  @bindable public default: string;

  public viewport: Viewport;

  private readonly router: Router;
  private readonly element: Element;

  constructor(router: Router, element: Element) {
    this.router = router;
    this.element = element;

    this.name = 'default';
    this.scope = null;
    this.usedBy = null;
    this.default = null;
    this.viewport = null;
  }

  public attached(): void {
    const options: IViewportOptions = { scope: this.element.hasAttribute('scope') };
    if (this.usedBy && this.usedBy.length) {
      options.usedBy = this.usedBy;
    }
    if (this.default && this.default.length) {
      options.default = this.default;
    }
    this.viewport = this.router.addViewport(this.name, this.element, options);
  }
  public detached(): void {
    this.router.removeViewport(this.viewport);
  }

  public binding(flags: LifecycleFlags): void {
    if (this.viewport) {
      this.viewport.binding(flags);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    if (this.viewport) {
      this.viewport.attaching(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    if (this.viewport) {
      this.viewport.detaching(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    if (this.viewport) {
      this.viewport.unbinding(flags);
    }
  }
}
// tslint:disable-next-line:no-invalid-template-strings
CustomElementResource.define({ name: 'au-viewport', template: '<template><div class="viewport-header"> Viewport: <b>${name}</b> </div></template>' }, ViewportCustomElement);
