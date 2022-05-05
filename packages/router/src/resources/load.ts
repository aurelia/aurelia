import { IDisposable, IEventAggregator } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
import { customAttribute, INode, bindable, CustomAttribute, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { ILinkHandler } from './link-handler';
import { IRouter, RouterNavigationEndEvent } from '../router';
import { getConsideredActiveInstructions, getLoadIndicator } from './utils';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private hasHref: boolean | null = null;

  private routerNavigationSubscription!: IDisposable;

  private readonly activeClass: string;

  public constructor(
    @INode private readonly element: INode<Element>,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IEventAggregator private readonly ea: IEventAggregator,
  ) {
    this.activeClass = this.router.configuration.options.indicators.loadActive;
  }

  public binding(): void {
    this.element.addEventListener('click', this.linkHandler);
    this.updateValue();
    this.updateActive();

    this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
  }

  public unbinding(): void {
    this.element.removeEventListener('click', this.linkHandler);
    this.routerNavigationSubscription.dispose();
  }

  public valueChanged(_newValue: unknown): void {
    this.updateValue();
    this.updateActive();
  }

  private updateValue(): void {
    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      // TODO: Figure out a better value here for non-strings (using RoutingInstruction?)
      let value = typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
      if (this.router.configuration.options.useUrlFragmentHash && !value.startsWith('#')) {
        value = `#${value}`;
      }
      this.element.setAttribute('href', value);
    }
  }
  private readonly navigationEndHandler = (_navigation: RouterNavigationEndEvent): void => {
    this.updateActive();
  };

  private updateActive(): void {
    const controller = CustomAttribute.for(this.element, 'load')!.parent!;
    const instructions = getConsideredActiveInstructions(this.router, controller, this.element as HTMLElement, this.value);
    const element = getLoadIndicator(this.element as HTMLElement);

    element.classList.toggle(this.activeClass, this.router.checkActive(instructions, { context: controller }));
  }
}
