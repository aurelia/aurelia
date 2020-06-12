
import {
  IDisposable,
} from '@aurelia/kernel';
import {
  customAttribute,
  INode,
  bindable,
  BindingMode,
  IDOM,
  DelegationStrategy,
  ICustomAttributeViewModel,
  ICustomAttributeController,
} from '@aurelia/runtime';
import {
  IEventManager,
} from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { GotoCustomAttribute } from '../configuration';
import { ILinkHandler } from '../link-handler';
import { IElement } from '../interfaces';

@customAttribute({
  name: 'href',
  noMultiBindings: true
})
export class HrefCustomAttribute implements ICustomAttributeViewModel<Element> {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private eventListener: IDisposable | null = null;

  public readonly $controller!: ICustomAttributeController<Element, this>;

  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode private readonly element: IElement,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IEventManager private readonly eventManager: IEventManager,
  ) {}

  public beforeBind(): void {
    if (this.router.options.useHref && !this.hasGoto()) {
      this.eventListener = this.eventManager.addEventListener(
        this.dom,
        this.element,
        'click',
        this.linkHandler.onClick as EventListener,
        DelegationStrategy.none,
      );
    }
    this.updateValue();
  }
  public beforeUnbind(): void {
    this.eventListener?.dispose();
  }

  public valueChanged(): void {
    this.updateValue();
  }

  private updateValue(): void {
    this.element.setAttribute('href', this.value as string);
  }

  private hasGoto(): boolean {
    return this.$controller.parent?.children?.some(function (c) {
      return c.viewModel instanceof GotoCustomAttribute;
    }) ?? false;
  }
}
