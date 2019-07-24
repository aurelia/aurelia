import { DI } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';
import { Router, IRouter } from './router';
export const RouterRegistration = Router;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
    RouterRegistration,
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
const routerConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, StartTask.with(IRouter).beforeAttach().call(router => router.activate()));
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
export const RouterConfiguration = {
    /**
     * Make it possible to specify options to Router activation
     */
    customize(config = {}) {
        return { ...routerConfiguration };
    },
    ...routerConfiguration,
};
//# sourceMappingURL=configuration.js.map