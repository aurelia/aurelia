import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { NavCustomElement } from './resources/nav.js';
import { ViewportCustomElement } from './resources/viewport.js';
import { ViewportScopeCustomElement } from './resources/viewport-scope.js';
import { GotoCustomAttribute } from './resources/goto.js';
import { LoadCustomAttribute } from './resources/load.js';
import { HrefCustomAttribute } from './resources/href.js';
import { IRouter } from './router.js';
import { IRouterActivateOptions } from './router-options-instance.js';

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

let configurationOptions: IRouterActivateOptions = {};
let configurationCall: ((router: IRouter) => void) = (router: IRouter) => {
  router.start(configurationOptions);
};

/**
 * A DI configuration object containing router resource registrations.
 */
const routerConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return container.register(
      ...DefaultComponents,
      ...DefaultResources,
      AppTask.with(IRouter).beforeActivate().call(configurationCall),
      AppTask.with(IRouter).afterActivate().call((router: IRouter) => router.loadUrl() as Promise<void>),
      AppTask.with(IRouter).afterDeactivate().call((router: IRouter) => router.stop()),
    );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
export const RouterConfiguration = {
  /**
   * Make it possible to specify options to Router activation.
   * Parameter is either a config object that's passed to Router's start
   * or a config function that's called instead of Router's start.
   */
  customize(config?: IRouterActivateOptions | ((router: IRouter) => void)) {
    if (config === undefined) {
      configurationOptions = {};
      configurationCall = (router: IRouter) => {
        router.start(configurationOptions);
      };
    } else if (config instanceof Function) {
      configurationCall = config;
    } else {
      configurationOptions = config;
    }
    return { ...routerConfiguration };
  },
  ...routerConfiguration,
};
