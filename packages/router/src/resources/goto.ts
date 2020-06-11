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
} from '@aurelia/runtime';
import {
  IEventManager,
} from '@aurelia/runtime-html';

import { IRouter } from '../router';
import { ILinkHandler } from '../link-handler';
import { IRouterEvents } from '../router-events';
import { IRouteContext } from '../route-context';
import { NavigationInstruction } from '../route-tree';

@customAttribute('goto')
export class GotoCustomAttribute implements ICustomAttributeViewModel<Element> {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private eventListener: IDisposable | null = null;
  private navigationEndListener: IDisposable | null = null;
  private hasHref: boolean | null = null;

  private readonly element: Element;

  private readonly activeClass: string = 'goto-active';
  public constructor(
    @IDOM private readonly dom: IDOM,
    @INode element: INode,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IRouterEvents private readonly routerEvents: IRouterEvents,
    @IEventManager private readonly eventManager: IEventManager,
    @IRouteContext private readonly context: IRouteContext,
  ) {
    this.element = element as Element;
  }

  public beforeBind(): void {
    this.eventListener = this.eventManager.addEventListener(
      this.dom,
      this.element,
      'click',
      this.linkHandler.onClick as EventListener,
      DelegationStrategy.none,
    );

    this.updateValue();

    this.navigationEndListener = this.routerEvents.subscribe('au:router:navigation-end', _e => {
      // TODO: Use router configuration for class name and update target
      if (this.router.isActive(this.value as NavigationInstruction, { context: this.context })) {
        this.element.classList.add(this.activeClass);
      } else {
        this.element.classList.remove(this.activeClass);
      }
    });
  }

  public beforeUnbind(): void {
    this.eventListener?.dispose();
    this.navigationEndListener?.dispose();
  }

  public valueChanged(): void {
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
