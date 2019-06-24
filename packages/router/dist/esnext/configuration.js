import { DI } from '@aurelia/kernel';
import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';
import { Router } from './router';
export const RouterRegistration = Router;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
    RouterRegistration
];
export { ViewportCustomElement, NavCustomElement, };
export const ViewportCustomElementRegistration = ViewportCustomElement;
export const NavCustomElementRegistration = NavCustomElement;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 */
export const DefaultResources = [
    ViewportCustomElement,
    NavCustomElement,
];
/**
 * A DI configuration object containing router resource registrations.
 */
export const RouterConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
//# sourceMappingURL=configuration.js.map