import { IDisposable, IEventAggregator, resolve } from '@aurelia/kernel';
import { INode, ICustomAttributeViewModel, ICustomAttributeController, CustomAttribute, CustomAttributeStaticAuDefinition } from '@aurelia/runtime-html';
import { IRouter, RouterNavigationEndEvent } from '../router';
import { LoadCustomAttribute } from '../index';
import { ILinkHandler } from './link-handler';
import { bmToView, getConsideredActiveInstructions, getLoadIndicator } from './utils';

export class HrefCustomAttribute implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'href',
    noMultiBindings: true,
    bindables: {
      value: { mode: bmToView }
    }
  };

  public value: string | undefined;

  public readonly $controller!: ICustomAttributeController<this>;

  private routerNavigationSubscription?: IDisposable;

  private readonly element = resolve(INode) as HTMLElement;
  private readonly router = resolve(IRouter);
  private readonly linkHandler = resolve(ILinkHandler);
  private readonly ea = resolve(IEventAggregator);
  private readonly activeClass = this.router.configuration.options.indicators.loadActive;

  public binding(): void {
    if (this.router.configuration.options.useHref && !this.hasLoad() && !this.element.hasAttribute('external')) {
      this.element.addEventListener('click', this.linkHandler);
      this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
    }
    this.updateValue();
    this.updateActive();
  }
  public unbinding(): void {
    this.element.removeEventListener('click', this.linkHandler);
    this.routerNavigationSubscription?.dispose();
  }

  public valueChanged(): void {
    this.updateValue();
    this.updateActive();
  }

  private updateValue(): void {
    this.element.setAttribute('href', this.value as string);
  }

  private readonly navigationEndHandler = (_navigation: RouterNavigationEndEvent): void => {
    this.updateActive();
  };

  private updateActive(): void {
    if (this.router.configuration.options.useHref && !this.hasLoad() && !this.element.hasAttribute('external')) {
      const controller = CustomAttribute.for(this.element, 'href')!.parent!;
      const instructions = getConsideredActiveInstructions(this.router, controller, this.element, this.value);
      const element = getLoadIndicator(this.element);

      element.classList.toggle(this.activeClass, this.router.checkActive(instructions, { context: controller }));
    }
  }

  private hasLoad(): boolean {
    const parent = this.$controller.parent!;
    const siblings = parent.children;
    return siblings?.some(c => c.vmKind === 'customAttribute' && c.viewModel instanceof LoadCustomAttribute) ?? false;
  }
}
