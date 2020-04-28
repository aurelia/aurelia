import { IContainer } from '@aurelia/kernel';
import {
  bindable,
  INode,
  LifecycleFlags,
  customElement,
  CustomElement,
  ICompiledCustomElementController,
  ICustomElementViewModel,
  ICustomElementController,
  IHydratedController,
  IHydratedParentController,
} from '@aurelia/runtime';
import { IHTMLRouter } from '../router';
import {
  IViewportOptions,
  Viewport
} from '@aurelia/router';

export const ParentViewport = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport',
  injectable: ParentViewport
})
export class ViewportCustomElement implements ICustomElementViewModel<Element> {
  @bindable public name: string = 'default';
  @bindable public usedBy: string = '';
  @bindable public default: string = '';
  @bindable public fallback: string = '';
  @bindable public noScope: boolean = false;
  @bindable public noLink: boolean = false;
  @bindable public noHistory: boolean = false;
  @bindable public stateful: boolean = false;

  public viewport: Viewport | null = null;

  public readonly $controller!: ICustomElementController<Element, this>;

  private readonly element: Element;

  public constructor(
    @IHTMLRouter private readonly router: IHTMLRouter,
    @INode element: INode,
    @IContainer private container: IContainer,
    @ParentViewport private readonly parentViewport: ViewportCustomElement,
  ) {
    this.element = element as HTMLElement;
  }

  public afterCompile(controller: ICompiledCustomElementController) {
    this.container = controller.context.get(IContainer);
    // console.log('Viewport creating', this.getAttribute('name', this.name), this.container, this.parentViewport, controller, this);
    // this.connect();
  }

  public async afterAttach(
    initiator: IHydratedController<Element>,
    parent: IHydratedParentController<Element> | null,
    flags: LifecycleFlags,
  ): Promise<void> {
    if (this.router.rootScope === null) {
      return;
    }
    const name: string = this.getAttribute('name', this.name) as string;
    const options: IViewportOptions = {
      scope: !this.noScope,
      usedBy: this.usedBy,
      default: this.default,
      fallback: this.fallback,
      noLink: this.element.hasAttribute('no-link'),
      noHistory: this.element.hasAttribute('no-history'),
      stateful: this.element.hasAttribute('stateful'),
    };
    this.viewport = this.router.connectViewport(this.viewport, this.$controller, name, options);
    await this.viewport.activate(initiator, this.$controller, flags);
  }

  public async afterUnbind(
    initiator: IHydratedController<Element>,
    parent: IHydratedParentController<Element> | null,
    flags: LifecycleFlags,
  ): Promise<void> {
    const { viewport } = this;
    if (viewport !== null) {
      this.router.disconnectViewport(viewport, this.$controller);
      this.viewport = null;
      await viewport.deactivate(initiator, this.$controller, flags);
    }
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
    if (checkExists) {
      return this.element.hasAttribute(key);
    }
    return value;
  }
}
