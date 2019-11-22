import {
  bindable,
  IController,
  INode,
  IRenderContext,
  LifecycleFlags,
  customElement,
  CustomElement,
} from '@aurelia/runtime';
import { IRouter } from '../router';
import { IViewportOptions, Viewport } from '../viewport';
import { IContainer, Registration } from '@aurelia/kernel';

export const ParentViewport = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport',
  injectable: ParentViewport
})
export class ViewportCustomElement {
  @bindable public name: string = 'default';
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: string = '';
  @bindable public noScope: boolean = false;
  @bindable public noLink: boolean = false;
  @bindable public noHistory: boolean = false;
  @bindable public stateful: boolean = false;

  public viewport: Viewport | null = null;

  public $controller!: IController; // This is set by the controller after this instance is constructed

  private readonly element: Element;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @ParentViewport private readonly parent: ViewportCustomElement,
  ) {
    this.element = element as HTMLElement;
  }

  public created() {
    this.router.setClosestViewport(this);
  }
  // public created(...rest): void {
  //   console.log('Created', rest);
  //   const booleanAttributes = {
  //     'scope': 'scope',
  //     'no-link': 'noLink',
  //     'no-history': 'noHistory',
  //   };
  //   const valueAttributes = {
  //     'used-by': 'usedBy',
  //     'default': 'default',
  //   };
  //   const name = this.element.hasAttribute('name') ? this.element.getAttribute('name') : 'default';
  //   const options: IViewportOptions = {};
  //   for (const attribute in booleanAttributes) {
  //     if (this.element.hasAttribute[attribute]) {
  //       options[booleanAttributes[attribute]] = true;
  //     }
  //   }
  //   for (const attribute in valueAttributes) {
  //     if (this.element.hasAttribute(attribute)) {
  //       const value = this.element.getAttribute(attribute);
  //       if (value && value.length) {
  //         options[valueAttributes[attribute]] = value;
  //       }
  //     }
  //   }
  //   this.viewport = this.router.addViewport(name, this.element, (this as any).$context.get(IContainer), options);
  // }
  public bound(): void {
    this.connect();
  }
  public unbound(): void {
    this.disconnect();
  }

  // public attached(): void {
  //   if (this.viewport) {
  //     this.viewport.clearTaggedNodes();
  //   }
  // }

  public connect(): void {
    const options: IViewportOptions = { scope: !this.element.hasAttribute('no-scope') };
    if (this.usedBy && this.usedBy.length) {
      options.usedBy = this.usedBy;
    }
    if (this.default && this.default.length) {
      options.default = this.default;
    }
    if (this.fallback && this.fallback.length) {
      options.fallback = this.fallback;
    }
    if (this.element.hasAttribute('no-link')) {
      options.noLink = true;
    }
    if (this.element.hasAttribute('no-history')) {
      options.noHistory = true;
    }
    if (this.element.hasAttribute('stateful')) {
      options.stateful = true;
    }
    this.viewport = this.router.connectViewport(this.name, this.element, this.$controller.context as IRenderContext, this.parent ? this.parent.viewport : null, options);
  }
  public disconnect(): void {
    if (this.viewport) {
      this.router.disconnectViewport(this.viewport, this.element, this.$controller.context as IRenderContext);
    }
  }

  public binding(flags: LifecycleFlags): void {
    if (this.viewport) {
      this.viewport.binding(flags);
    }
  }

  public attaching(flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      return this.viewport.attaching(flags);
    }
    return Promise.resolve();
  }

  public detaching(flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      return this.viewport.detaching(flags);
    }
    return Promise.resolve();
  }

  public async unbinding(flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      await this.viewport.unbinding(flags);
    }
  }
}

