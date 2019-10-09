import { GotoCustomAttribute } from './resources/goto';
import { DI } from '@aurelia/kernel';
import { StartTask } from '@aurelia/runtime';
import { NavCustomElement } from './resources/nav';
import { ViewportCustomElement } from './resources/viewport';
import { IRouter } from './router';
export const RouterRegistration = IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
    RouterRegistration,
];
export { ViewportCustomElement, NavCustomElement, GotoCustomAttribute, };
export const ViewportCustomElementRegistration = ViewportCustomElement;
export const NavCustomElementRegistration = NavCustomElement;
export const GotoCustomAttributeRegistration = GotoCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`
 */
export const DefaultResources = [
    ViewportCustomElement,
    NavCustomElement,
    GotoCustomAttribute,
];
let configurationOptions = {};
let configurationCall = (router) => {
    router.activate(configurationOptions);
};
/**
 * A DI configuration object containing router resource registrations.
 */
const routerConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, StartTask.with(IRouter).beforeBind().call(configurationCall), StartTask.with(IRouter).beforeAttach().call(router => router.loadUrl()));
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
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(config) {
        if (config === undefined) {
            configurationOptions = {};
            configurationCall = (router) => {
                router.activate(configurationOptions);
            };
        }
        else if (config instanceof Function) {
            configurationCall = config;
        }
        else {
            configurationOptions = config;
        }
        return { ...routerConfiguration };
    },
    ...routerConfiguration,
};
//# sourceMappingURL=configuration.js.map