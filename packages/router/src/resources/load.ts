import { IDisposable, IEventAggregator } from '@aurelia/kernel';
import { customAttribute, INode, bindable, BindingMode, CustomAttribute, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { RoutingInstruction } from '../instructions/routing-instruction.js';
import { ILinkHandler } from './link-handler.js';
import { IRouter, RouterNavigationEndEvent } from '../router.js';
import { RouterConfiguration } from '../configuration.js';
import { LoadInstruction } from '../interfaces.js';
import { getConsideredActiveInstructions, getLoadIndicator } from './utils.js';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView })
  public value: unknown;

  private hasHref: boolean | null = null;

  private routerNavigationSubscription!: IDisposable;

  private readonly activeClass: string = RouterConfiguration.options.indicators.loadActive;
  public constructor(
    @INode private readonly element: INode<Element>,
    @IRouter private readonly router: IRouter,
    @ILinkHandler private readonly linkHandler: ILinkHandler,
    @IEventAggregator private readonly ea: IEventAggregator,
  ) { }

  public binding(): void {
    this.element.addEventListener('click', this.linkHandler);
    this.updateValue();

    this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
  }

  public unbinding(): void {
    this.element.removeEventListener('click', this.linkHandler);
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
  }
  private readonly navigationEndHandler = (_navigation: RouterNavigationEndEvent): void => {
    const controller = CustomAttribute.for(this.element, 'load')!.parent!;
    // const activeInstructions = (this.element.hasAttribute('considered-active')
    //   ? this.element.getAttribute('considered-active')
    //   : this.value) as LoadInstruction;
    // const created = this.router.applyLoadOptions(activeInstructions, { context: controller });
    // const instructions = RoutingInstruction.from(created.instructions);
    // for (const instruction of instructions) {
    //   if (instruction.scope === null) {
    //     instruction.scope = created.scope;
    //   }
    // }

    console.log((CustomAttribute.for(this.element, 'load')?.viewModel as any).value);

    const instructions = getConsideredActiveInstructions(this.router, controller, this.element as HTMLElement, this.value);

    getLoadIndicator(this.element as HTMLElement).classList.toggle(this.activeClass,
      this.router.checkActive(instructions, { context: controller }));
  };
}
