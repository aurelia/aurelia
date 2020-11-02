import { IDisposable } from '@aurelia/kernel';
import { customAttribute, bindable, BindingMode, ICustomAttributeViewModel, ICustomAttributeController, IEventDelegator, IEventTarget, INode } from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { LoadCustomAttribute } from '../configuration';
import { ILinkHandler } from '../link-handler';

@customAttribute({ name: 'href', noMultiBindings: true })
export class HrefCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private eventListener: IDisposable | null = null;

  public readonly $controller!: ICustomAttributeController<this>;

  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IEventDelegator private readonly delegator: IEventDelegator,
  ) {}

  public binding(): void {
    if (this.router.options.useHref && !this.hasLoad()) {
      this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.linkHandler.onClick as EventListener);
    }
    this.updateValue();
  }
  public unbinding(): void {
    this.eventListener?.dispose();
  }

  public valueChanged(): void {
    this.updateValue();
  }

  private updateValue(): void {
    this.el.setAttribute('href', this.value as string);
  }

  private hasLoad(): boolean {
    return this.$controller.parent?.children?.some(function (c) {
      return c.viewModel instanceof LoadCustomAttribute;
    }) ?? false;
  }
}
