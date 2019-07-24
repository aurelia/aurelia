import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';

import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';
import { IRouterOptions, Router, IRouter } from './router';

export const RouterRegistration = Router as unknown as IRegistry;

/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
  RouterRegistration,
];

export {
  ViewportCustomElement,
  NavCustomElement,
};

export const ViewportCustomElementRegistration = ViewportCustomElement as unknown as IRegistry;
export const NavCustomElementRegistration = NavCustomElement as unknown as IRegistry;

/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 */
export const DefaultResources: IRegistry[] = [
  ViewportCustomElement as unknown as IRegistry,
  NavCustomElement as unknown as IRegistry,
];

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
      StartTask.with(IRouter).beforeAttach().call(router => router.activate())
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
   * Make it possible to specify options to Router activation
   */
  customize(config: IRouterOptions = {}) {
    return { ...routerConfiguration };
  },
  ...routerConfiguration,
};
