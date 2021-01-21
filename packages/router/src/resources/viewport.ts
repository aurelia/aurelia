/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IContainer } from '@aurelia/kernel';
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
import { ViewportScopeCustomElement } from './viewport-scope.js';
import { Runner, Step } from '../utilities/runner.js';
import { IRoutingController } from '../endpoints/endpoint.js';

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
  public readonly $controller!: ICustomElementController<this>;

  /**
   * The routing controller.
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
    @ParentViewport public readonly parentViewport: ViewportCustomElement,
  ) { }

  public hydrated(controller: ICompiledCustomElementController) {
    // console.log('hydrated', this.name, this.router.isActive);
    this.controller = controller as IRoutingController;
    this.container = controller.context.get(IContainer);

    // The first viewport(s) might be compiled before the router is active
    // console.log('>>> Runner.run', 'hydrated');
    return Runner.run(null,
      () => this.waitForRouterStart(),
      () => {
        // Only call connect this early if we need to
        if (this.router.isRestrictedNavigation) {
          this.connect();
        }
      }
    );
  }

  public binding(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    this.isBound = true;
    return Runner.run(null,
      () => this.waitForRouterStart(),
      () => {
        // Prefer to connect here since we've got bound data in component
        if (!this.router.isRestrictedNavigation) {
          this.connect();
        }
      },
      () => {
        if (this.viewport?.activeResolve != null) {
          // console.log('waitedForParent', this.viewport.pathname);
          this.viewport.activeResolve();
          this.viewport.activeResolve = null;
        }
      },
      () => {
        if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
          console.log('binding', this.viewport?.toString());
          // e: this.viewport.enabled = true;
          return (this.viewport.activate(null, initiator, this.$controller, flags, true, void 0) as Step<void>)?.asValue as void | Promise<void>;
          // TODO: Restore scroll state
        }
      },
    ) as void | Promise<void>;
  }

  public attaching(initiator: IHydratedController, parent: IHydratedParentController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
      console.log('(attaching)', this.viewport?.toString());
      //   this.viewport.enabled = true;
      //   return (this.viewport.activate(null, initiator, this.$controller, flags, true, void 0) as Step<void>)?.asValue as void | Promise<void>;
      //   // TODO: Restore scroll state
    }
  }

  public detaching(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void> {
    // if (this.viewport !== null && (this.viewport.nextContent ?? null) === null) {
    //   console.log('detaching', this.viewport?.toString());
    // }
    // if (this.viewport !== null && (this.router.processingNavigation ?? null) === null) {

    if (this.viewport !== null) {
      // TODO: Save scroll state before detach

      // console.log('>>> Runner.run', 'detaching');
      // return Runner.run(null,
      //   () => {
      //     // console.log('detaching', this.viewport?.toString());
      //     this.isBound = false;
      //     this.viewport!.enabled = false;
      //     const result = (this.viewport!.deactivate(initiator, parent, flags) as Promise<void>);
      //     if (result instanceof Promise) {
      //       return result;/* .then(() => {
      //         console.log('detaching done', this.viewport?.toString());
      //       }); */
      //     }
      //   },
      //   // () => {
      //   //   console.log('detaching done', this.viewport?.toString());
      //   // }
      // );
      this.isBound = false;
      // e: this.viewport!.enabled = false;
      return this.viewport!.deactivate(initiator, parent, flags);
    }
  }

  public unbinding(initiator: IHydratedController, parent: ISyntheticView | ICustomElementController | null, flags: LifecycleFlags): void | Promise<void> {
    if (this.viewport !== null) {
      // TODO: Don't unload when stateful, instead save to cache. Something like
      // this.viewport.cacheContent();

      // return Runner.run(null,
      //   () => this.disconnect(), // Disconnect doesn't destroy anything, just disconnects it
      // );
      return this.disconnect(null);
    }
  }

  public dispose(): void {
    if (this.viewport !== null) {
      this.viewport?.dispose();
      this.viewport = null;
    }
  }

  public connect(): void {
    if (this.router.rootScope === null || (this.viewport !== null && this.router.isRestrictedNavigation)) {
      return;
    }
    // let controllerContainer = (this.controller.context as any).container;
    // let output = '';
    // do {
    //   console.log(output, ':', controllerContainer === this.container, this.controller, controllerContainer, this.container);
    //   if (controllerContainer === this.container) {
    //     break;
    //   }
    //   controllerContainer = controllerContainer.parent;
    //   output += '.parent';
    // } while (controllerContainer);

    const name: string = this.getAttribute('name', this.name) as string;
    let value: string | boolean | undefined = this.getAttribute('no-scope', this.noScope);
    const options: IViewportOptions = { scope: value === void 0 || !value ? true : false };
    value = this.getAttribute('used-by', this.usedBy);
    if (value !== void 0) {
      options.usedBy = value as string;
    }
    value = this.getAttribute('default', this.default);
    if (value !== void 0) {
      options.default = value as string;
    }
    value = this.getAttribute('fallback', this.fallback);
    if (value !== void 0) {
      options.fallback = value as string;
    }
    value = this.getAttribute('no-link', this.noLink, true);
    if (value !== void 0) {
      options.noLink = value as boolean;
    }
    value = this.getAttribute('no-title', this.noTitle, true);
    if (value !== void 0) {
      options.noTitle = value as boolean;
    }
    value = this.getAttribute('no-history', this.noHistory, true);
    if (value !== void 0) {
      options.noHistory = value as boolean;
    }
    value = this.getAttribute('stateful', this.stateful, true);
    if (value !== void 0) {
      options.stateful = value as boolean;
    }
    this.controller.routingContainer = this.container;
    // this.viewport = this.router.connectViewport(this.viewport, this, name, options);
    this.viewport = this.router.connectEndpoint(this.viewport, 'Viewport', this, name, options) as Viewport;
  }
  public disconnect(step: Step | null): void {
    if (this.viewport) {
      // this.router.disconnectViewport(step, this.viewport, this);
      this.router.disconnectEndpoint(step, this.viewport, this);
    }
    // Can't do this until after disposed
    // this.viewport = null;
  }

  public setActive(active: boolean): void {
    if (active) {
      this.element.classList.add('viewport-active');
    } else {
      this.element.classList.remove('viewport-active');
    }
  }

  private getAttribute(key: string, value: string | boolean, checkExists: boolean = false): string | boolean | undefined {
    const result: Record<string, string | boolean> = {};
    if (this.isBound && !checkExists) {
      return value;
    } else {
      if (this.element.hasAttribute(key)) {
        if (checkExists) {
          return true;
        } else {
          value = this.element.getAttribute(key) as string;
          if (value.length > 0) {
            return value;
          }
        }
      }
    }
    return value;
  }

  private getClosestCustomElement() {
    let parent: any = this.controller.parent;
    let customElement = null;
    while (parent !== null && customElement === null) {
      if (parent.viewModel instanceof ViewportCustomElement || parent.viewModel instanceof ViewportScopeCustomElement) {
        customElement = parent.viewModel;
      }
      parent = parent.parent;
    }
    return customElement;
  }

  // TODO: Switch this to use (probably) an event instead
  private waitForRouterStart(): void | Promise<void> {
    if (this.router.isActive) {
      return;
    }
    return new Promise((resolve) => {
      this.router.starters.push(resolve);
    });
  }
}
