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
import { IViewportScopeOptions, ViewportScope } from '../viewport-scope';

export const ParentViewportScope = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport-scope',
  template: '<template><template replaceable></template></template>',
  containerless: true,
  injectable: ParentViewportScope
})
export class ViewportScopeCustomElement {
  @bindable public catches: string = '';

  public viewportScope: ViewportScope | null = null;

  public $controller!: IController; // This is set by the controller after this instance is constructed

  private readonly element: Element;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode element: INode,
    @ParentViewportScope private readonly parent: ViewportScopeCustomElement,
  ) {
    this.element = element as HTMLElement;
  }

  public created() {
  }
  public binding(): void {
    // this.router.setClosestViewportScope(this);
    this.connect();
  }
  public unbound(): void {
    this.disconnect();
  }

  public connect(): void {
    const options: IViewportScopeOptions = {};
    if (this.catches && this.catches.length) {
      options.catches = this.catches;
    }
    this.viewportScope = this.router.connectViewportScope(this, this.element, options);
  }
  public disconnect(): void {
    if (this.viewportScope) {
      // this.router.disconnectViewportScope(this.viewportScope, this.element, this.$controller.context as IRenderContext);
    }
  }
}
