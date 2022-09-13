import { FoundRoute } from '../found-route';
import { IRoutingInstruction } from '../interfaces';
import { IDisposable, IEventAggregator } from '@aurelia/kernel';
import { BindingMode } from '@aurelia/runtime';
import { customAttribute, INode, bindable, CustomAttribute, ICustomAttributeViewModel } from '@aurelia/runtime-html';
import { ILinkHandler } from './link-handler';
import { IRouter, RouterNavigationEndEvent } from '../router';
import { getConsideredActiveInstructions, getLoadIndicator } from './utils';
import { Parameters } from '../instructions/instruction-parameters';
import { RoutingInstruction } from '../instructions/routing-instruction';
import { RoutingScope } from '../routing-scope';
import { IRoute } from '../route';

@customAttribute('load')
export class LoadCustomAttribute implements ICustomAttributeViewModel {
  @bindable({ mode: BindingMode.toView }) public value: unknown;
  @bindable public component?: string;
  @bindable public parameters?: Parameters;
  @bindable public viewport?: string;

  /*
   * The id for a configured route
   */
  @bindable public id?: string;

  private separateProperties = false;
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
    if (this.value == null) {
      this.separateProperties = true;
    }
    this.element.addEventListener('click', this.linkHandler);
    this.updateValue();
    void this.updateActive();

    this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
  }

  public unbinding(): void {
    this.element.removeEventListener('click', this.linkHandler);
    this.routerNavigationSubscription.dispose();
  }

  public valueChanged(_newValue: unknown): void {
    this.updateValue();
    void this.updateActive();
  }

  private updateValue(): void {
    if (this.separateProperties) {
      this.value = {
        component: this.component,
        parameters: this.parameters,
        viewport: this.viewport,
        id: this.id,
      };
    }

    if (this.hasHref === null) {
      this.hasHref = this.element.hasAttribute('href');
    }
    if (!this.hasHref) {
      let value = this.value as string;
      if (typeof this.value !== 'string') {
        const instruction = RoutingInstruction.from(this.router, this.value as IRoutingInstruction).shift() as RoutingInstruction;
        const found = this.findRoute(this.value as IRoute);
        if (found.foundConfiguration) {
          instruction.route = found.matching;
        }
        value = RoutingInstruction.stringify(this.router, [instruction]);
      }
      if (this.router.configuration.options.useUrlFragmentHash && !value.startsWith('#')) {
        value = `#${value}`;
      }
      this.element.setAttribute('href', value);
    }
  }
  private readonly navigationEndHandler = (_navigation: RouterNavigationEndEvent): void => {
    void this.updateActive();
  };

  private async updateActive(): Promise<void> {
    const controller = CustomAttribute.for(this.element, 'load')!.parent!;
    const routeValue = typeof this.value === 'string' ? { id: this.value, path: this.value } : this.value;
    const found = this.findRoute(routeValue as IRoute);
    const instructions = found.foundConfiguration
      ? found.instructions
      : getConsideredActiveInstructions(this.router, controller, this.element as HTMLElement, this.value);
    const element = getLoadIndicator(this.element as HTMLElement);

    const unresolvedPromise = RoutingInstruction.resolve(instructions);
    if (unresolvedPromise instanceof Promise) {
      await unresolvedPromise;
    }

    element.classList.toggle(this.activeClass, this.router.checkActive(instructions, { context: controller }));
  }

  private findRoute(value: string | IRoute): FoundRoute {
    if (typeof value === 'string') {
      return new FoundRoute();
    }
    const scope = RoutingScope.for(this.element) ?? this.router.rootScope!.scope;
    if (value.id != null) {
      return scope.findMatchingRoute(value.id, value.parameters as Parameters ?? {});
    }
    const path = value.path as string;
    if (path != null) {
      return scope.findMatchingRoute(path, value.parameters as Parameters ?? {});
    }
    return new FoundRoute();
  }
}
