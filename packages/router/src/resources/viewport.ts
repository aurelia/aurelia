import {
  Key,
  Writable
} from '@aurelia/kernel';

import {
  bindable,
  CustomElement,
  IController,
  ICustomElementType,
  IDOM,
  INode,
  IRenderContext,
  IRenderingEngine,
  ITemplate,
  LifecycleFlags,
  RenderContext,
  TemplateDefinition
} from '@aurelia/runtime';

import {
  IRouter,
} from '../router';
import {
  IViewportOptions,
  Viewport
} from '../viewport';

export class ViewportCustomElement {
  public static readonly inject: readonly Key[] = [IRouter, INode, IRenderingEngine];

  @bindable public name: string = 'default';
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public noScope: boolean = false;
  @bindable public noLink: boolean = false;
  @bindable public noHistory: boolean = false;
  @bindable public stateful: boolean = false;

  public viewport: Viewport | null = null;

  // tslint:disable-next-line: prefer-readonly // This is set by the controller after this instance is constructed
  public $controller!: IController;

  constructor(
    private readonly router: IRouter,
    private readonly element: Element, private readonly renderingEngine: IRenderingEngine
  ) { }

  public render(flags: LifecycleFlags, host: INode, parts: Record<string, TemplateDefinition>, parentContext: IRenderContext | null): void {
    const Type = this.constructor as ICustomElementType;
    if (!parentContext) {
      parentContext = this.$controller.context as IRenderContext;
    }
    const dom = parentContext.get(IDOM);
    const template = this.renderingEngine.getElementTemplate(dom, Type.description, parentContext, Type);
    (template as Writable<ITemplate>).renderContext = new RenderContext(dom, parentContext, Type.description.dependencies, Type);
    template.render(this, host, parts);
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
    this.viewport = this.router.addViewport(this.name, this.element, this.$controller.context as IRenderContext, options);
  }
  public disconnect(): void {
    if (this.viewport) {
      this.router.removeViewport(this.viewport, this.element, this.$controller.context as IRenderContext);
    }
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
CustomElement.define({ name: 'au-viewport', template: '<template><div class="viewport-header" style="display: none;"> Viewport: <b>${name}</b> ${scope ? "[new scope]" : ""} : <b>${viewport.content && viewport.content.toComponentName()}</b></div></template>' }, ViewportCustomElement);
