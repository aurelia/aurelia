import { customAttribute, INode, bindable, BindingMode, IViewModel, ViewModelKind, IDOM, DelegationStrategy } from '@aurelia/runtime';
import { IRouter } from '../router';
import { GotoCustomAttribute } from '../configuration';
import { IEventManager } from '@aurelia/runtime-html';
import { IDisposable } from '@aurelia/kernel';

@customAttribute('href')
export class HrefCustomAttribute {
  @bindable({ mode: BindingMode.toView })
  public value: string | undefined;

  private eventListener: IDisposable | null = null;

  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode private readonly element: HTMLElement,
    @IRouter private readonly router: IRouter,
    @IEventManager private readonly eventManager: IEventManager,
  ) { }

  public binding(): void {
    if (this.router.options.useHref) {
      if ((this as IViewModel).$controller!.parent!.controllers!
        .filter(c => c.vmKind === ViewModelKind.customAttribute &&
          c.bindingContext instanceof GotoCustomAttribute).length === 0) {
        this.eventListener = this.eventManager.addEventListener(
          this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
      }
    }
    this.updateValue();
  }
  public unbinding(): void {
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
}
