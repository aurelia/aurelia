import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { ViewportCustomElement } from './resources/viewport';
import { ViewportScopeCustomElement } from './resources/viewport-scope';
import { LoadCustomAttribute } from './resources/load';
import { HrefCustomAttribute } from './resources/href';
import { ConsideredActiveCustomAttribute } from './resources/considered-active';
import { IRouter, Router } from './router';
import { IRouterOptions, RouterOptions } from './router-options';
import { BeforeNavigationHookFunction, IRoutingHookOptions, RoutingHook, RoutingHookFunction, RoutingHookIdentity, TransformFromUrlHookFunction, TransformTitleHookFunction, TransformToUrlHookFunction } from './routing-hook';

export const IRouterConfiguration = DI.createInterface<IRouterConfiguration>('IRouterConfiguration', x => x.singleton(RouterConfiguration));
export interface IRouterConfiguration extends RouterConfiguration { }

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
  LoadCustomAttribute,
  HrefCustomAttribute,
  ConsideredActiveCustomAttribute,
};

export const ViewportCustomElementRegistration = ViewportCustomElement as unknown as IRegistry;
export const ViewportScopeCustomElementRegistration = ViewportScopeCustomElement as unknown as IRegistry;
export const LoadCustomAttributeRegistration = LoadCustomAttribute as unknown as IRegistry;
export const HrefCustomAttributeRegistration = HrefCustomAttribute as unknown as IRegistry;
export const ConsideredActiveCustomAttributeRegistration = ConsideredActiveCustomAttribute as unknown as IRegistry;

/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
 */
export const DefaultResources: IRegistry[] = [
  ViewportCustomElement as unknown as IRegistry,
  ViewportScopeCustomElement as unknown as IRegistry,
  LoadCustomAttribute as unknown as IRegistry,
  HrefCustomAttribute as unknown as IRegistry,
  ConsideredActiveCustomAttribute as unknown as IRegistry,
];

/**
 * A DI configuration object containing router resource registrations
 * and the router options API.
 */
export class RouterConfiguration {
  // ONLY used during registration to support .customize. Transfered to
  // instance property after that.
  private static options = RouterOptions.create();

  private static configurationCall: ((router: IRouter) => void) = (router: IRouter) => {
    router.start();
  };

  /**
   * The router options.
   */
  public options!: RouterOptions;

  /**
   * Register this configuration in a provided container and
   * register app tasks for starting and stopping the router.
   *
   * @param container - The container to register in
   */
  public static register(container: IContainer): IContainer {
    const _this = container.get(IRouterConfiguration);
    // Transfer options (that's possibly modified through .customize)
    _this.options = RouterConfiguration.options;
    _this.options.setRouterConfiguration(_this);
    // Reset defaults
    RouterConfiguration.options = RouterOptions.create();

    return container.register(
      ...DefaultComponents,
      ...DefaultResources,
      AppTask.activating(IRouter, RouterConfiguration.configurationCall),
      AppTask.activated(IRouter, (router: IRouter) => router.initialLoad() as Promise<void>),
      AppTask.deactivated(IRouter, (router: IRouter) => router.stop()),
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
      RouterConfiguration.options = RouterOptions.create();
      RouterConfiguration.configurationCall = (router: IRouter) => {
        router.start();
      };
    } else if (config instanceof Function) {
      RouterConfiguration.configurationCall = config;
    } else {
      RouterConfiguration.options = RouterOptions.create();
      RouterConfiguration.options.apply(config);
    }
    return RouterConfiguration as unknown as RouterConfiguration;
  }

  /**
   * Create a new container with this configuration applied to it.
   */
  public static createContainer(): IContainer {
    return this.register(DI.createContainer());
  }

  /**
   * Get the router configuration for a context.
   *
   * @param context - The context to get the configuration for
   */
  public static for(context: IRouter | IContainer): RouterConfiguration {
    if (context instanceof Router) {
      return context.configuration;
    }
    return context.get(IRouterConfiguration);
  }

  /**
   * Apply router options.
   *
   * @param options - The options to apply
   * @param firstResetDefaults - Whether the default router options should
   * be set before applying the specified options
   */
  public apply(options: IRouterOptions, firstResetDefaults: boolean = false): void {
    if (firstResetDefaults) {
      this.options = RouterOptions.create();
    }
    this.options.apply(options);
  }

  /**
   * Add a routing hook.
   *
   * @param hookFunction - The hook callback function
   * @param options - Options specifyinig hook type and filters
   */
  public addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public addHook(transformTitleHookFunction: TransformTitleHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public addHook(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public addHook(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity {
    return RoutingHook.add(hookFunction, options);
  }
  /**
   * Remove a routing hook.
   *
   * @param id - The id of the hook to remove (returned from the addHook call)
   */
  public removeHook(id: RoutingHookIdentity): void {
    return RoutingHook.remove(id);
  }
  /**
   * Remove all routing hooks.
   */
  public removeAllHooks(): void {
    return RoutingHook.removeAll();
  }

  // TODO: This goes in here
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
