import { DI } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { NavCustomElement } from './resources/nav.js';
import { ViewportCustomElement } from './resources/viewport.js';
import { ViewportScopeCustomElement } from './resources/viewport-scope.js';
import { GotoCustomAttribute } from './resources/goto.js';
import { LoadCustomAttribute } from './resources/load.js';
import { HrefCustomAttribute } from './resources/href.js';
import { IRouter } from './router.js';
export const RouterRegistration = IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
    RouterRegistration,
];
export { ViewportCustomElement, ViewportScopeCustomElement, NavCustomElement, GotoCustomAttribute, LoadCustomAttribute, HrefCustomAttribute, };
export const ViewportCustomElementRegistration = ViewportCustomElement;
export const ViewportScopeCustomElementRegistration = ViewportScopeCustomElement;
export const NavCustomElementRegistration = NavCustomElement;
export const GotoCustomAttributeRegistration = GotoCustomAttribute;
export const LoadCustomAttributeRegistration = LoadCustomAttribute;
export const HrefCustomAttributeRegistration = HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
 */
export const DefaultResources = [
    ViewportCustomElement,
    ViewportScopeCustomElement,
    NavCustomElement,
    GotoCustomAttribute,
    LoadCustomAttribute,
    HrefCustomAttribute,
];
let configurationOptions = {};
let configurationCall = (router) => {
    router.start(configurationOptions);
};
/**
 * A DI configuration object containing router resource registrations.
 */
const routerConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, AppTask.with(IRouter).beforeActivate().call(configurationCall), AppTask.with(IRouter).afterActivate().call(router => router.loadUrl()), AppTask.with(IRouter).afterDeactivate().call(router => router.stop()));
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
     * Parameter is either a config object that's passed to Router's start
     * or a config function that's called instead of Router's start.
     */
    customize(config) {
        if (config === undefined) {
            configurationOptions = {};
            configurationCall = (router) => {
                router.start(configurationOptions);
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