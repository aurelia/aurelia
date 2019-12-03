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
import { IContainer } from '@aurelia/kernel';

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

  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @IContainer private container: IContainer,
    @ParentViewport private readonly parentViewport: ViewportCustomElement,
  ) {
    this.element = element as HTMLElement;
    // console.log('>>> Viewport container', container);
    // console.log('Viewport constructor', this.getAttribute('name', this.name), this.container, this.parentViewport, CustomElement.for(this.element), this);
    // if (this.router.rootScope !== null && this.viewport === null) {
    //   this.connect();
    // }
  }

  // public render(flags: LifecycleFlags, host: INode, parts: Record<string, CustomElementDefinition>, parentContext: IRenderContext | null): void {
  //   // console.log('render', this);
  //   // const Type: any = this.constructor as CustomElementType;
  //   // if (!parentContext) {
  //   //   parentContext = this.$controller.context as IRenderContext;
  //   // }
  //   // const dom = parentContext.get(IDOM);
  //   // const template = parentContext.get(IRenderingEngine).getElementTemplate(dom, Type.description, parentContext, Type) as ITemplate;
  //   // // (template as Writable<ITemplate>).renderContext = new RenderContext(dom, parentContext, Type.description.dependencies, Type);
  //   // template.render(this, host, parts);
  //   // this.connect();
  // }

  public creating(controller: any) {
    this.container = controller.context.container;
    // console.log('Viewport creating', this.getAttribute('name', this.name), this.container, this.parentViewport, controller, this);
    // if (this.router.rootScope !== null && this.viewport === null) {
    //   this.connect();
    // }
  }
  public created() {
    // console.log('Viewport created', this.getAttribute('name', this.name), this.container, this.parentViewport, CustomElement.for(this.element), this);
    // console.log('Viewport created', this);
    // if (this.router.rootScope !== null && this.viewport === null) {
    //   this.connect();
    // }
    // this.router.setClosestViewport(this);
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
    // this.connect();
  }
  public unbound(): void {
    this.isBound = false;
  }

  // public attached(): void {
  //   if (this.viewport) {
  //     this.viewport.clearTaggedNodes();
  //   }
  // }

  public connect(): void {
    const name = this.getAttribute('name', this.name) as string;
    let value: string | boolean | undefined = this.getAttribute('no-scope', this.noScope);
    const options: IViewportOptions = { scope: value === void 0 || !value ? true : false };
    value = this.getAttribute('used-by', this.usedBy);
    if (value !== void 0) {
      options.usedBy = value as string;
    }
    value = this.getAttribute('default', this.default);
    if (value !== void 0) {
      options.default = value as string;
    }
    value = this.getAttribute('fallback', this.fallback);
    if (value !== void 0) {
      options.fallback = value as string;
    }
    value = this.getAttribute('no-link', this.noLink, true);
    if (value !== void 0) {
      options.noLink = value as boolean;
    }
    value = this.getAttribute('no-history', this.noHistory, true);
    if (value !== void 0) {
      options.noHistory = value as boolean;
    }
    value = this.getAttribute('stateful', this.stateful, true);
    if (value !== void 0) {
      options.stateful = value as boolean;
    }
    // if (this.usedBy && this.usedBy.length) {
    //   options.usedBy = this.usedBy;
    // }
    // if (this.default && this.default.length) {
    //   options.default = this.default;
    // }
    // if (this.fallback && this.fallback.length) {
    //   options.fallback = this.fallback;
    // }
    // if (this.element.hasAttribute('no-link')) {
    //   options.noLink = true;
    // }
    // if (this.element.hasAttribute('no-history')) {
    //   options.noHistory = true;
    // }
    // if (this.element.hasAttribute('stateful')) {
    //   options.stateful = true;
    // }
    this.viewport = this.router.connectViewport(this, this.container, name, this.element, this.$controller !== void 0 ? this.$controller.context as IRenderContext : null, /* this.parentViewport !== null && this.parentViewport.viewport !== null ? this.parentViewport.viewport.viewportScope : null, */ options);
  }
  public disconnect(): void {
    if (this.viewport) {
      this.router.disconnectViewport(this, this.container, this.viewport, this.element, this.$controller.context as IRenderContext);
    }
  }

  public binding(flags: LifecycleFlags): void {
    this.isBound = true;
    // this.router.setClosestViewport(this);
    // this.connect();
    if (this.router.rootScope !== null) {
      this.connect();
    }
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
      this.disconnect();
    }
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
    const result: Record<string, string | boolean> = {};
    if (this.isBound) {
      return value;
    } else {
      if (this.element.hasAttribute(key)) {
        if (checkExists) {
          return true;
        } else {
          value = this.element.getAttribute(key) as string;
          if (value.length > 0) {
            return value;
          }
        }
      }
    }
    return void 0;
  }
}
