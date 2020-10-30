import { customAttribute, INode, bindable, BindingMode, ViewModelKind, ICustomAttributeViewModel, ICustomAttributeController } from '@aurelia/runtime-html';
import { IRouter } from '../router';
import { GotoCustomAttribute } from '../configuration';

@customAttribute({
  name: 'href',
  noMultiBindings: true
})
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: string | undefined;

  private readonly element: Element;
  public readonly $controller!: ICustomAttributeController<this>;

  public constructor(
    @INode element: INode,
    @IRouter private readonly router: IRouter,
  ) {
    this.element = element as Element;
  }

  public binding(): void {
    if (this.router.options.useHref && !this.hasGoto()) {
      this.element.addEventListener('click', this.router.linkHandler.handler);
    }
    this.updateValue();
  }
  public beforeUnbind(): void {
    this.element.removeEventListener('click', this.router.linkHandler.handler);
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
