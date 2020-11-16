import { customAttribute, INode, bindable, BindingMode, ViewModelKind, ICustomAttributeViewModel, ICustomAttributeController } from '@aurelia/runtime-html';
import { IRouter } from '../router.js';
import { GotoCustomAttribute } from '../configuration.js';

@customAttribute({
  name: 'href',
  noMultiBindings: true
})
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: string | undefined;

  public readonly $controller!: ICustomAttributeController<this>;

  public constructor(
    @INode private readonly element: INode<Element>,
    @IRouter private readonly router: IRouter,
  ) {}

  public binding(): void {
    if (this.router.options.useHref && !this.hasGoto()) {
      this.element.addEventListener('click', this.router.linkHandler.handler);
    }
    this.updateValue();
  }
  public unbinding(): void {
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
    return siblings !== null
      && siblings.some(c => c.vmKind === ViewModelKind.customAttribute && c.viewModel instanceof GotoCustomAttribute);
  }
}
