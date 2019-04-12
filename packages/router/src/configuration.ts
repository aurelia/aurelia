import { DI, IContainer, IRegistry } from '@aurelia/kernel';

import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';

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
export const BasicRouterConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return container.register(...DefaultResources);
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
