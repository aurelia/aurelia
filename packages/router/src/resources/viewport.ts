import {
  bindable,
  IController,
  INode,
  IRenderContext,
  LifecycleFlags,
  customElement,
} from '@aurelia/runtime';
import { IRouter } from '../router';
import { IViewportOptions, Viewport } from '../viewport';

@customElement({
  name: 'au-viewport',
  template: `
    <template>
      <div class="viewport-header" style="display: none;">
        Viewport: <b>\${name}</b> \${scope ? "[new scope]" : ""} : <b>\${viewport.content && viewport.content.toComponentName()}</b>
      </div>
    </template>
  `.replace(/\s+/g, '')
})
export class ViewportCustomElement {
  @bindable public name: string = 'default';
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
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
  ) {
    this.element = element as HTMLElement;
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
  public afterBind(): void {
    this.connect();
  }
  public afterUnbind(): void {
    this.disconnect();
  }

  public afterAttach(): void {
    if (this.viewport) {
      this.viewport.clearTaggedNodes();
    }
  }

  public connect(): void {
    const options: IViewportOptions = { scope: !this.element.hasAttribute('no-scope') };
    if (this.usedBy && this.usedBy.length) {
      options.usedBy = this.usedBy;
    }
    if (this.default && this.default.length) {
      options.default = this.default;
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
    this.viewport = this.router.connectViewport(this.name, this.element, this.$controller.context as IRenderContext, options);
  }
  public disconnect(): void {
    if (this.viewport) {
      this.router.disconnectViewport(this.viewport, this.element, this.$controller.context as IRenderContext);
    }
  }

  public beforeBind(flags: LifecycleFlags): void {
    if (this.viewport) {
      this.viewport.beforeBind(flags);
    }
  }

  public beforeAttach(flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      return this.viewport.beforeAttach(flags);
    }
    return Promise.resolve();
  }

  public beforeDetach(flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      return this.viewport.beforeDetach(flags);
    }
    return Promise.resolve();
  }

  public async beforeUnbind(flags: LifecycleFlags): Promise<void> {
    if (this.viewport) {
      await this.viewport.beforeUnbind(flags);
    }
  }
}

