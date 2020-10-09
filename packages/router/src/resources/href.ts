import { customAttribute, INode, bindable, BindingMode, ViewModelKind, IDOM, DelegationStrategy, ICustomAttributeViewModel, ICustomAttributeController } from '@aurelia/runtime';
import { IRouter } from '../router';
import { GotoCustomAttribute } from '../configuration';
import { IEventManager } from '@aurelia/runtime-html';
import { IDisposable } from '@aurelia/kernel';

@customAttribute({
  name: 'href',
  noMultiBindings: true
})
export class HrefCustomAttribute implements ICustomAttributeViewModel<Element> {
  @bindable({ mode: BindingMode.toView })
  public value: string | undefined;

  private eventListener: IDisposable | null = null;
  private readonly element: Element;
  public readonly $controller!: ICustomAttributeController<Element, this>;

  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode element: INode,
    @IRouter private readonly router: IRouter,
    @IEventManager private readonly eventManager: IEventManager,
  ) {
    this.element = element as Element;
  }

  public beforeBind(): void {
    if (this.router.options.useHref && !this.hasGoto()) {
      this.eventListener = this.eventManager.addEventListener(
        this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
    }
    this.updateValue();
  }
  public beforeUnbind(): void {
    if (this.eventListener !== null) {
      this.eventListener.dispose();
    }
  }

  public valueChanged(): void {
    this.updateValue();
  }

  private updateValue(): void {
    this.element.setAttribute('href', this.value as string);
  }

  private hasGoto(): boolean {
    const parent = this.$controller.parent!;
    const siblings = parent.children;
    return siblings !== void 0
      && siblings.some(c => c.vmKind === ViewModelKind.customAttribute && c.viewModel instanceof GotoCustomAttribute);
  }
}
