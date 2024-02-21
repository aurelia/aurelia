import { IContainer, IEventAggregator, resolve } from '@aurelia/kernel';
import {
  bindable,
  INode,
  customElement,
  CustomElement,
  HydrateElementInstruction,
  ICompiledCustomElementController,
  ICustomElementViewModel,
  ICustomElementController,
  IHydratedController,
  IHydratedParentController,
  ISyntheticView,
  IInstruction,
} from '@aurelia/runtime-html';
import { IRouter, NavigationFlags } from '../index';
import { Viewport } from '../endpoints/viewport';
import { IViewportOptions } from '../endpoints/viewport-options';
import { Runner, Step } from '../utilities/runner';
import { waitForRouterStart, getValueOrAttribute } from './utils';
import { arrayRemove } from '../utilities/utils';
import { OpenPromise } from '../utilities/open-promise';
import { FallbackAction } from '../router-options';

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
   * Whether the fallback action is to load the fallback component in
   * place of the unloadable component and continue with any child
   * instructions or if the fallback is to be called and the processing
   * of the children to be aborted.
   */
  @bindable public fallbackAction: FallbackAction | '' = '';

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
  public endpoint: Viewport | null = null;

  /**
   * The custom element controller.
   */
  public controller!: ICustomElementController;

  /**
   * Child viewports waiting to be connected.
   */
  public pendingChildren: ViewportCustomElement[] = [];

  /**
   * Promise to await while children are waiting to be connected.
   */
  public pendingPromise: OpenPromise | null = null;

  /**
   * Whether the viewport is bound or not.
   */
  private isBound: boolean = false;

  private readonly router = resolve(IRouter);
  public readonly element = resolve(INode) as HTMLElement;
  public container: IContainer = resolve(IContainer);
  private readonly ea: IEventAggregator = resolve(IEventAggregator);
  public readonly parentViewport = resolve(ParentViewport) as ViewportCustomElement | null;
  private readonly instruction = resolve(IInstruction) as HydrateElementInstruction;

  public hydrated(controller: ICompiledCustomElementController): void | Promise<void> {
    this.controller = controller as ICustomElementController;
    this.container = controller.container;

    // eslint-disable-next-line
    const hasDefault = this.instruction.props.filter((instr: any) => instr.to === 'default').length > 0;
    if (hasDefault && this.parentViewport != null) {
      this.parentViewport.pendingChildren.push(this);
      if (this.parentViewport.pendingPromise === null) {
        this.parentViewport.pendingPromise = new OpenPromise();
      }
    }

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

  public binding(initiator: IHydratedController, _parent: IHydratedParentController | null): void | Promise<void> {
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
        // TODO(post-alpha): Consider using an event instead (not a priority)
        // If a content is waiting for us to be connected...
        if (this.endpoint?.activeResolve != null) {
          // ...resolve the promise
          this.endpoint.activeResolve();
          this.endpoint.activeResolve = null;
        }
      },
      () => {
        if (this.endpoint !== null && this.endpoint.getNextContent() === null) {
          return (this.endpoint.activate(null, initiator, this.controller, /* true, */ void 0) as Step<void>)?.asValue as void | Promise<void>;
          // TODO: Restore scroll state (in attaching/attached)
        }
      },
    ) as void | Promise<void>;
  }

  public detaching(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null): void | Promise<void> {
    if (this.endpoint !== null) {
      // TODO: Save scroll state before detach
      this.isBound = false;
      return this.endpoint.deactivate(null, initiator, parent);
    }
  }

  public unbinding(_initiator: IHydratedController, _parent: ISyntheticView | ICustomElementController | null): void | Promise<void> {
    if (this.endpoint !== null) {
      // TODO: Don't unload when stateful, instead save to cache. Something like
      // this.viewport.cacheContent();

      // Disconnect doesn't destroy anything, just disconnects it
      return this.disconnect(null);
    }
  }

  public dispose(): void {
    this.endpoint?.dispose();
    this.endpoint = null;
  }

  /**
   * Connect this custom element to a router endpoint (Viewport).
   */
  public connect(): void {
    const { isBound, element } = this;
    // Collect custom element options from either properties (if the custom
    // element has been bound) or from html attributes (booleans are always
    // set based on whether html attribute exists)
    const name: string = getValueOrAttribute('name', this.name, isBound, element) as string;
    const options: IViewportOptions = {};
    // Endpoint property is `scope` but html attribute is `no-scope` so negate it
    options.scope = !(getValueOrAttribute('no-scope', this.noScope, false, element, true) as boolean);
    options.usedBy = getValueOrAttribute('used-by', this.usedBy, isBound, element) as string;
    options.default = getValueOrAttribute('default', this.default, isBound, element) as string;
    options.fallback = getValueOrAttribute('fallback', this.fallback, isBound, element) as string;
    options.fallbackAction = getValueOrAttribute('fallback-action', this.fallbackAction, isBound, element) as FallbackAction;
    options.noLink = getValueOrAttribute('no-link', this.noLink, isBound, element, true) as boolean;
    options.noTitle = getValueOrAttribute('no-title', this.noTitle, isBound, element, true) as boolean;
    options.noHistory = getValueOrAttribute('no-history', this.noHistory, isBound, element, true) as boolean;
    options.stateful = getValueOrAttribute('stateful', this.stateful, isBound, element, true) as boolean;

    Object
      .keys(options)
      .forEach(key => {
        if (options[key as keyof typeof options] === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete options[key as keyof typeof options];
        }
      });

    this.endpoint = this.router.connectEndpoint(this.endpoint, 'Viewport', this, name, options) as Viewport;

    const parentViewport = this.parentViewport;
    if (parentViewport != null) {
      arrayRemove(parentViewport.pendingChildren, child => child === this);
      if (parentViewport.pendingChildren.length === 0 && parentViewport.pendingPromise !== null) {
        parentViewport.pendingPromise.resolve();
        parentViewport.pendingPromise = null;
      }
    }
  }

  /**
   * Disconnect this custom element from its router endpoint (Viewport).
   */
  public disconnect(step: Step | null): void {
    if (this.endpoint !== null) {
      this.router.disconnectEndpoint(step, this.endpoint, this);
    }
  }

  /**
   * Set whether the viewport is currently active or not. Adds or removes
   * activity classes to the custom element
   *
   * @param active - Whether the viewport is active or not
   */
  public setActivity(state: string | NavigationFlags, active: boolean): void {
    const prefix = this.router.configuration.options.indicators.viewportNavigating;

    if (typeof state === 'string') {
      this.element.classList.toggle(state, active);
    } else {
      for (const key in state) {
        this.element.classList.toggle(`${prefix}-${key}`, active && state[key as keyof (NavigationFlags)]);
      }
    }
  }
}
