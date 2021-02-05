import { IContainer, IEventAggregator } from '@aurelia/kernel';
import {
  bindable,
  INode,
  LifecycleFlags,
  customElement,
  CustomElement,
  ICompiledCustomElementController,
  ICustomElementViewModel,
  ICustomElementController,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
} from '@aurelia/runtime-html';
import { IRouter } from '../index.js';
import { Viewport, IViewportOptions } from '../viewport.js';
import { Runner, Step } from '../utilities/runner.js';
import { IRoutingController } from '../endpoints/endpoint.js';
import { waitForRouterStart, getValueOrAttribute } from './utils.js';

export const ParentViewport = CustomElement.createInjectable();

@customElement({
  name: 'au-viewport',
  injectable: ParentViewport
})
export class ViewportCustomElement implements ICustomElementViewModel {
  /**
   * The name of the viewport. Should be unique within the routing scope.
   */
  @bindable public name: string = 'default';

  /**
   * A list of components that is using the viewport. These components
   * can only be loaded into this viewport and this viewport can't
   * load any other components.
   */
  @bindable public usedBy: string = '';

  /**
   * The default component that's loaded if the viewport is created
   * without having a component specified (in that navigation).
   */
  @bindable public default: string = '';

  /**
   * The component loaded if the viewport can't load the specified
   * component. The component is passed as a parameter to the fallback.
   */
  @bindable public fallback: string = '';

  /**
   * Indicates that the viewport has no scope.
   */
  @bindable public noScope: boolean = false;

  /**
   * Indicates that the viewport doesn't add a content link to
   * the Location URL.
   */
  @bindable public noLink: boolean = false;

  /**
   * Indicates that the viewport doesn't add a title to the browser
   * window title.
   */
  @bindable public noTitle: boolean = false;

  /**
   * Indicates that the viewport doesn't add history content to
   * the History API.
   */
  @bindable public noHistory: boolean = false;

  /**
   * Whether the components of the viewport are stateful or not.
   */
  @bindable public stateful: boolean = false;

  /**
   * The connected Viewport.
   */
  public viewport: Viewport | null = null;

  /**
   * The custom element controller.
   */
  public controller!: IRoutingController;

  /**
   * Whether the viewport is bound or not.
   */
  private isBound: boolean = false;

  public constructor(
    @IRouter private readonly router: IRouter,
    @INode public readonly element: INode<HTMLElement>,
    @IContainer public container: IContainer,
    @IEventAggregator private readonly ea: IEventAggregator,
    @ParentViewport public readonly parentViewport: ViewportCustomElement,
  ) { }

  public hydrated(controller: ICompiledCustomElementController): void | Promise<void> {
    this.controller = controller as IRoutingController;
    this.container = controller.context.get(IContainer);

    return Runner.run<void>(null,
      // The first viewport(s) might be hydrated before the router is started
      () => waitForRouterStart(this.router, this.ea),
      () => {
        // Only call connect this early if we need to
        if (this.router.isRestrictedNavigation) {
          this.connect();
        }
      }
    ) as void | Promise<void>;
  }

  public binding(initiator: IHydratedController, _parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    this.isBound = true;
    return Runner.run(null,
      // The first viewport(s) might be bound before the router is started
      () => waitForRouterStart(this.router, this.ea),
      () => {
        // Prefer to connect here since we've got bound data in component
        if (!this.router.isRestrictedNavigation) {
          this.connect();
        }
      },
      () => {
        // TODO: Consider using an event instead (not a priority)
        // If a content is waiting for us to be connected...
        if (this.viewport?.activeResolve != null) {
          // ...resolve the promise
          this.viewport.activeResolve();
          this.viewport.activeResolve = null;
        }
      },
      () => {
        if (this.viewport !== null && this.viewport.nextContent === null) {
          return (this.viewport.activate(null, initiator, this.controller, flags, true, void 0) as Step<void>)?.asValue as void | Promise<void>;
          // TODO: Restore scroll state (in attaching/attached)
        }
      },
    ) as void | Promise<void>;
  }

  public detaching(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.viewport !== null) {
      // TODO: Save scroll state before detach
      this.isBound = false;
      return this.viewport.deactivate(initiator, parent, flags);
    }
  }

  public unbinding(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null, _flags: LifecycleFlags): void | Promise<void> {
    if (this.viewport !== null) {
      // TODO: Don't unload when stateful, instead save to cache. Something like
      // this.viewport.cacheContent();

      // Disconnect doesn't destroy anything, just disconnects it
      return this.disconnect(null);
    }
  }

  public dispose(): void {
    this.viewport?.dispose();
    this.viewport = null;
  }

  /**
   * Connect this custom element to a router endpoint (Viewport).
   */
  public connect(): void {
    // Collect custom element options from either properties (if the custom
    // element has been bound) or from html attributes
    const name: string = getValueOrAttribute('name', this.name, this.isBound, this.element) as string;
    const options: IViewportOptions = {};
    // Endpoint property is `scope` but html attribute is `no-scope` so negate it
    options.scope = !(getValueOrAttribute('no-scope', this.noScope, false, this.element, true) as boolean);
    options.usedBy = getValueOrAttribute('used-by', this.usedBy, this.isBound, this.element) as string;
    options.default = getValueOrAttribute('default', this.default, this.isBound, this.element) as string;
    options.fallback = getValueOrAttribute('fallback', this.fallback, this.isBound, this.element) as string;
    options.noLink = getValueOrAttribute('no-link', this.noLink, this.isBound, this.element, true) as boolean;
    options.noTitle = getValueOrAttribute('no-title', this.noTitle, this.isBound, this.element, true) as boolean;
    options.noHistory = getValueOrAttribute('no-history', this.noHistory, this.isBound, this.element, true) as boolean;
    options.stateful = getValueOrAttribute('stateful', this.stateful, this.isBound, this.element, true) as boolean;

    // let value: string | boolean | undefined = this.getAttribute('no-scope', this.noScope);
    // // Endpoint property is `scope` but html attribute is `no-scope` so negate it
    // const options: IViewportOptions = { scope: value === void 0 || !(value as boolean) ? true : false };
    // value = this.getAttribute('used-by', this.usedBy);
    // if (value !== void 0) {
    //   options.usedBy = value as string;
    // }
    // value = this.getAttribute('default', this.default);
    // if (value !== void 0) {
    //   options.default = value as string;
    // }
    // value = this.getAttribute('fallback', this.fallback);
    // if (value !== void 0) {
    //   options.fallback = value as string;
    // }
    // value = this.getAttribute('no-link', this.noLink, true);
    // if (value !== void 0) {
    //   options.noLink = value as boolean;
    // }
    // value = this.getAttribute('no-title', this.noTitle, true);
    // if (value !== void 0) {
    //   options.noTitle = value as boolean;
    // }
    // value = this.getAttribute('no-history', this.noHistory, true);
    // if (value !== void 0) {
    //   options.noHistory = value as boolean;
    // }
    // value = this.getAttribute('stateful', this.stateful, true);
    // if (value !== void 0) {
    //   options.stateful = value as boolean;
    // }

    // Delete all keys with undefined value
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    Object.keys(options).forEach(key => options[key as keyof typeof options] === undefined && delete options[key as keyof typeof options]);

    this.controller.routingContainer = this.container;
    this.viewport = this.router.connectEndpoint(this.viewport, 'Viewport', this, name, options) as Viewport;
  }
  /**
   * Disconnect this custom element from its router endpoint (Viewport).
   */
  public disconnect(step: Step | null): void {
    if (this.viewport !== null) {
      this.router.disconnectEndpoint(step, this.viewport, this);
    }
  }

  /**
   * Set whether the viewport is currently active or not. Adds or removes
   * activity classes to the custom element
   *
   * @param active - Whether the viewport is active or not
   */
  public setActive(active: boolean): void {
    if (active) {
      this.element.classList.add('viewport-active');
    } else {
      this.element.classList.remove('viewport-active');
    }
  }
}
