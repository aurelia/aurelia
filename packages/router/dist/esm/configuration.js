import { IContainer, isObject } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';
import { RouteContext } from './route-context.js';
import { IRouter } from './router.js';
import { ViewportCustomElement } from './resources/viewport.js';
import { LoadCustomAttribute } from './resources/load.js';
import { HrefCustomAttribute } from './resources/href.js';
export const RouterRegistration = IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
    RouterRegistration,
];
export { ViewportCustomElement, LoadCustomAttribute, HrefCustomAttribute, };
export const ViewportCustomElementRegistration = ViewportCustomElement;
export const LoadCustomAttributeRegistration = LoadCustomAttribute;
export const HrefCustomAttributeRegistration = HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `load`, `href`
 */
export const DefaultResources = [
    ViewportCustomElement,
    LoadCustomAttribute,
    HrefCustomAttribute,
];
function configure(container, config) {
    return container.register(AppTask.hydrated(IContainer, RouteContext.setRoot), AppTask.afterActivate(IRouter, router => {
        if (isObject(config)) {
            if (typeof config === 'function') {
                return config(router);
            }
            else {
                return router.start(config, true);
            }
        }
        return router.start({}, true);
    }), AppTask.afterDeactivate(IRouter, router => {
        router.stop();
    }), ...DefaultComponents, ...DefaultResources);
}
export const RouterConfiguration = {
    register(container) {
        return configure(container);
    },
    /**
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(config) {
        return {
            register(container) {
                return configure(container, config);
            },
        };
    },
};
//# sourceMappingURL=configuration.js.map