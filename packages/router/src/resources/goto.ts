import { customAttribute, INode, bindable, BindingMode, IDOM, DelegationStrategy } from '@aurelia/runtime';
import { IRouter } from '../router';
import { IEventManager } from '@aurelia/runtime-html';
import { IDisposable } from '@aurelia/kernel';

@customAttribute('goto')
export class GotoCustomAttribute {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private listener: IDisposable | null = null;
  private hasHref: boolean | null = null;

  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode private readonly element: HTMLElement,
    @IRouter private readonly router: IRouter,
    @IEventManager private readonly eventManager: IEventManager,
  ) { }

  public binding(): void {
    this.listener = this.eventManager.addEventListener(
      this.dom, this.element, 'click', this.router.linkHandler.handler, DelegationStrategy.none);
    this.updateValue();
  }

  public unbinding(): void {
    if (this.listener !== null) {
      this.listener.dispose();
    }
  }

  public valueChanged(newValue: unknown): void {
    this.updateValue();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      this.element.setAttribute('href', value);
    }
  }
}
