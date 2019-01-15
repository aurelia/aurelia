import { Constructable, IContainer, InterfaceSymbol } from '@aurelia/kernel';
import { bindable, CustomElementResource, INode, LifecycleFlags } from '@aurelia/runtime';
import { Router } from '../router';
import { IViewportOptions, Viewport } from '../viewport';

export class ViewportCustomElement {
  public static readonly inject: ReadonlyArray<InterfaceSymbol<unknown>|Constructable> = [Router, INode];

  @bindable public name: string;
  @bindable public scope: boolean;
  @bindable public usedBy: string;
  @bindable public default: string;
  @bindable public noLink: boolean;
  @bindable public noHistory: boolean;

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
    this.noLink = null;
    this.noHistory = null;
    this.viewport = null;
  }

  public created(...rest) {
    console.log('Created', rest);
    const booleanAttributes = {
      'scope': 'scope',
      'no-link': 'noLink',
      'no-history': 'noHistory',
    };
    const valueAttributes = {
      'used-by': 'usedBy',
      'default': 'default',
    };

    const name = this.element.hasAttribute('name') ? this.element.getAttribute('name') : 'default';
    const options: IViewportOptions = {};

    for (const attribute in booleanAttributes) {
      if (this.element.hasAttribute[attribute]) {
        options[booleanAttributes[attribute]] = true;
      }
    }
    for (const attribute in valueAttributes) {
      if (this.element.hasAttribute(attribute)) {
        const value = this.element.getAttribute(attribute);
        if (value && value.length) {
          options[valueAttributes[attribute]] = value;
        }
      }
    }
    this.viewport = this.router.addViewport(name, this.element, (this as any).$context.get(IContainer), options);
  }

  public bound(): void {
    // const options: IViewportOptions = { scope: this.element.hasAttribute('scope') };
    // if (this.usedBy && this.usedBy.length) {
    //   options.usedBy = this.usedBy;
    // }
    // if (this.default && this.default.length) {
    //   options.default = this.default;
    // }
    // if (this.element.hasAttribute('no-link')) {
    //   options.noLink = true;
    // }
    // if (this.element.hasAttribute('no-history')) {
    //   options.noHistory = true;
    // }
    // this.viewport = this.router.addViewport(this.name, this.element, (this as any).$context.get(IContainer), options);
  }
  public unbound(): void {
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
