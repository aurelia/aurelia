import { IDisposable, IEventAggregator } from '@aurelia/kernel';
import { customAttribute, INode, bindable, BindingMode, CustomAttribute, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { RoutingInstruction } from '../instructions/routing-instruction.js';
import { ILinkHandler } from './link-handler.js';
import { IRouter, RouterNavigationEndEvent } from '../router.js';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView, primary: true, callback: 'valueChanged' })
  public route: unknown;

  @bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
  public params: unknown;

  @bindable({ mode: BindingMode.toView })
  public attribute: string = 'href';

  private routerNavigationSubscription!: IDisposable;

  public constructor(
    @IEventTarget private readonly target: IEventTarget,
    @INode private readonly el: INode<HTMLElement>,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IEventAggregator private readonly ea: IEventAggregator,
  ) { }

  public binding(): void {
    this.element.addEventListener('click', this.linkHandler.handler);
    this.updateValue();

    this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
  }

  public unbinding(): void {
    this.element.removeEventListener('click', this.linkHandler.handler);
    this.routerNavigationSubscription.dispose();
  }

  public valueChanged(_newValue: unknown): void {
    this.updateValue();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using RoutingInstruction?)
      const value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      this.element.setAttribute('href', value);
    }
    this.navigationEndListener!.dispose();
  }
  private readonly navigationEndHandler = (_navigation: RouterNavigationEndEvent): void => {
    const controller = CustomAttribute.for(this.element, 'load')!.parent!;
    const created = this.router.applyLoadOptions(this.value as any, { context: controller });
    const instructions = RoutingInstruction.from(created.instructions);
    for (const instruction of instructions) {
      if (instruction.scope === null) {
        instruction.scope = created.scope;
      }
    } else {
      this.instructions = null;
      this.href = null;
    }
    // TODO: Use router configuration for class name and update target
    if (this.router.checkActive(instructions, { context: controller })) {
      this.element.classList.add(this.activeClass);
    } else {
      if (this.href === null) {
        this.el.removeAttribute(this.attribute);
      } else {
        this.el.setAttribute(this.attribute, this.href);
      }
    }
  };
}

