import {
  bindable,
  IController,
  INode,
  LifecycleFlags,
  customElement,
  CustomElement,
} from '@aurelia/runtime';
import { IRouter } from '../router';
import { IViewportScopeOptions, ViewportScope } from '../viewport-scope';
import { IContainer } from '@aurelia/kernel';

export const ParentViewportScope = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport-scope',
  template: '<template><template replaceable></template></template>',
  injectable: ParentViewportScope
})
export class ViewportScopeCustomElement {
  @bindable public name: string = 'default';
  @bindable public catches: string = '';
  @bindable public collection: boolean = false;
  @bindable public source: unknown[] | null = null;
  public viewportScope: ViewportScope | null = null;

  public $controller!: IController; // This is set by the controller after this instance is constructed

  private readonly element: Element;

  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @IContainer private container: IContainer,
    @ParentViewportScope private readonly parent: ViewportScopeCustomElement,
  ) {
    this.element = element as HTMLElement;
    // console.log('>>> ViewportScope container', container);
    // console.log('ViewportScope constructor', this.container, this.parent, CustomElement.for(this.element), this);
    // if (this.router.rootScope !== null && this.viewportScope === null) {
    //   this.connect();
    // }
  }

  // public render(flags: LifecycleFlags, host: INode, parts: Record<string, CustomElementDefinition>, parentContext: IRenderContext | null): void {
  //   // console.log('ViewportScope render', this);
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
    // console.log('ViewportScope creating', this.getAttribute('name', this.name), this.container, this.parent, controller, this);
    // this.connect();
  }
  public created() {
    // console.log('ViewportScope created', this);
    // if (this.router.rootScope !== null && this.viewportScope === null) {
    //   this.connect();
    // }
  }
  // public binding(): void {
  //   this.connect();
  // }
  public unbound(): void {
    this.isBound = false;
  }

  public connect(): void {
    if (this.router.rootScope === null) {
      return;
    }
    const name: string = this.getAttribute('name', this.name) as string;
    const options: IViewportScopeOptions = {};
    let value: string | boolean | undefined = this.getAttribute('catches', this.catches);
    if (value !== void 0) {
      options.catches = value as string;
    }
    value = this.getAttribute('collection', this.collection, true);
    if (value !== void 0) {
      options.collection = value as boolean;
    }

    // TODO: Needs to be bound? How to solve?
    options.source = this.source || null;

    this.viewportScope = this.router.connectViewportScope(this.viewportScope, name, this.container, this.element, options);
  }
  public disconnect(): void {
    if (this.viewportScope) {
      this.router.disconnectViewportScope(this.viewportScope, this.container);
    }
    this.viewportScope = null;
  }

  public binding(flags: LifecycleFlags): void {
    this.isBound = true;
    this.connect();
    if (this.viewportScope !== null) {
      this.viewportScope.binding();
    }
  }
  public async unbinding(flags: LifecycleFlags): Promise<void> {
    if (this.viewportScope !== null) {
      this.viewportScope.unbinding();
    }
    this.disconnect();
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
