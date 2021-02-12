import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { NavCustomElement } from './resources/nav.js';
import { ViewportCustomElement } from './resources/viewport.js';
import { ViewportScopeCustomElement } from './resources/viewport-scope.js';
import { GotoCustomAttribute } from './resources/goto.js';
import { LoadCustomAttribute } from './resources/load.js';
import { HrefCustomAttribute } from './resources/href.js';
import { IRouter } from './router.js';
import { IRouterOptions, RouterOptions } from './router-options.js';
import { BeforeNavigationHookFunction, IRoutingHookOptions, RoutingHook, RoutingHookFunction, RoutingHookIdentity, TransformFromUrlHookFunction, TransformTitleHookFunction, TransformToUrlHookFunction } from './routing-hook';

export const RouterRegistration = IRouter as unknown as IRegistry;

/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
  RouterRegistration,
];

export {
  ViewportCustomElement,
  ViewportScopeCustomElement,
  NavCustomElement,
  GotoCustomAttribute,
  LoadCustomAttribute,
  HrefCustomAttribute,
};

export const ViewportCustomElementRegistration = ViewportCustomElement as unknown as IRegistry;
export const ViewportScopeCustomElementRegistration = ViewportScopeCustomElement as unknown as IRegistry;
export const NavCustomElementRegistration = NavCustomElement as unknown as IRegistry;
export const GotoCustomAttributeRegistration = GotoCustomAttribute as unknown as IRegistry;
export const LoadCustomAttributeRegistration = LoadCustomAttribute as unknown as IRegistry;
export const HrefCustomAttributeRegistration = HrefCustomAttribute as unknown as IRegistry;

/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
 */
export const DefaultResources: IRegistry[] = [
  ViewportCustomElement as unknown as IRegistry,
  ViewportScopeCustomElement as unknown as IRegistry,
  NavCustomElement as unknown as IRegistry,
  GotoCustomAttribute as unknown as IRegistry,
  LoadCustomAttribute as unknown as IRegistry,
  HrefCustomAttribute as unknown as IRegistry,
];

/**
 * A DI configuration object containing router resource registrations
 * and the router options API.
 */
export class RouterConfiguration {
  public static options = new RouterOptions();

  private static configurationCall: ((router: IRouter) => void) = (router: IRouter) => {
    router.start();
  };

  /**
   * Register this configuration in a provided container and
   * register app tasks for starting and stopping the router.
   *
   * @param container - The container to register in
   */
  public static register(container: IContainer): IContainer {
    return container.register(
      ...DefaultComponents,
      ...DefaultResources,
      AppTask.with(IRouter).beforeActivate().call(RouterConfiguration.configurationCall),
      AppTask.with(IRouter).afterActivate().call((router: IRouter) => router.loadUrl() as Promise<void>),
      AppTask.with(IRouter).afterDeactivate().call((router: IRouter) => router.stop()),
    );
  }

  /**
   * Make it possible to specify options to Router activation.
   *
   * @param config - Either a config object that's passed to router's
   * start or a config function that's called instead of router's start.
   */
  public static customize(config?: IRouterOptions | ((router: IRouter) => void)): RouterConfiguration {
    if (config === undefined) {
      RouterConfiguration.options = new RouterOptions();
      RouterConfiguration.configurationCall = (router: IRouter) => {
        router.start();
      };
    } else if (config instanceof Function) {
      RouterConfiguration.configurationCall = config;
    } else {
      RouterConfiguration.apply(config, true);
    }
    return RouterConfiguration;
  }

  /**
   * Apply router options.
   *
   * @param options - The options to apply
   * @param firstResetDefaults - Whether the default router options should
   * be set before applying the specified options
   */
  public static apply(options: IRouterOptions, firstResetDefaults: boolean = false): void {
    if (firstResetDefaults) {
      RouterConfiguration.options = new RouterOptions();
    }
    RouterConfiguration.options.apply(options);
  }

  /**
   * Create a new container with this configuration applied to it.
   */
  public static createContainer(): IContainer {
    return this.register(DI.createContainer());
  }

  /**
   * Add a routing hook.
   *
   * @param hookFunction - The hook callback function
   * @param options - Options specifyinig hook type and filters
   */
  public static addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static addHook(transformTitleHookFunction: TransformTitleHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static addHook(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static addHook(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity {
    return RoutingHook.add(hookFunction, options);
  }
  /**
   * Remove a routing hook.
   *
   * @param id - The id of the hook to remove (returned from the addHook call)
   */
  public static removeHook(id: RoutingHookIdentity): void {
    return RoutingHook.remove(id);
  }
  /**
   * Remove all routing hooks.
   */
  public static removeAllHooks(): void {
    return RoutingHook.removeAll();
  }

  // public addRoutes(routes: IRoute[], context?: ICustomElementViewModel | Element): IRoute[] {
  //   // TODO: This should add to the context instead
  //   // TODO: Add routes without context to rootScope content (which needs to be created)?
  //   return [];
  //   // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
  //   // return viewport.addRoutes(routes);
  // }

  // public removeRoutes(routes: IRoute[] | string[], context?: ICustomElementViewModel | Element): void {
  //   // TODO: This should remove from the context instead
  //   // const viewport = (context !== void 0 ? this.closestViewport(context) : this.rootScope) || this.rootScope as Viewport;
  //   // return viewport.removeRoutes(routes);
  // }
}
