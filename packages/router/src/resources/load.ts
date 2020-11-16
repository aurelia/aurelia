import { IDisposable } from '@aurelia/kernel';
import { customAttribute, bindable, BindingMode, ICustomAttributeViewModel, IEventDelegator, IEventTarget, INode } from '@aurelia/runtime-html';

import { IRouter } from '../router.js';
import { ILinkHandler } from '../link-handler.js';
import { IRouterEvents } from '../router-events.js';
import { IRouteContext } from '../route-context.js';
import { NavigationInstruction } from '../instructions.js';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private eventListener: IDisposable | null = null;
  private navigationEndListener: IDisposable | null = null;
  private hasHref: boolean | null = null;

  private readonly activeClass: string = 'load-active';
  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IRouterEvents private readonly events: IRouterEvents,
    @IEventDelegator private readonly delegator: IEventDelegator,
    @IRouteContext private readonly context: IRouteContext,
  ) {}

  public binding(): void {
    this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.linkHandler.onClick as EventListener);

    this.updateValue();

    this.navigationEndListener = this.events.subscribe('au:router:navigation-end', _e => {
      // TODO: Use router configuration for class name and update target
      if (this.router.isActive(this.value as NavigationInstruction, this.context)) {
        this.el.classList.add(this.activeClass);
      } else {
        this.el.classList.remove(this.activeClass);
      }
    });
  }

  public unbinding(): void {
    this.eventListener?.dispose();
    this.navigationEndListener?.dispose();
  }

  public valueChanged(): void {
    this.updateValue();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.el.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using InstructionResolver?)
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      this.el.setAttribute('href', value);
    }
  }
}
