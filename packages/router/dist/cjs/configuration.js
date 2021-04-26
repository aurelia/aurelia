"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterConfiguration = exports.DefaultResources = exports.HrefCustomAttributeRegistration = exports.LoadCustomAttributeRegistration = exports.ViewportCustomElementRegistration = exports.HrefCustomAttribute = exports.LoadCustomAttribute = exports.ViewportCustomElement = exports.DefaultComponents = exports.RouterRegistration = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const route_context_js_1 = require("./route-context.js");
const router_js_1 = require("./router.js");
const viewport_js_1 = require("./resources/viewport.js");
Object.defineProperty(exports, "ViewportCustomElement", { enumerable: true, get: function () { return viewport_js_1.ViewportCustomElement; } });
const load_js_1 = require("./resources/load.js");
Object.defineProperty(exports, "LoadCustomAttribute", { enumerable: true, get: function () { return load_js_1.LoadCustomAttribute; } });
const href_js_1 = require("./resources/href.js");
Object.defineProperty(exports, "HrefCustomAttribute", { enumerable: true, get: function () { return href_js_1.HrefCustomAttribute; } });
exports.RouterRegistration = router_js_1.IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
exports.DefaultComponents = [
    exports.RouterRegistration,
];
exports.ViewportCustomElementRegistration = viewport_js_1.ViewportCustomElement;
exports.LoadCustomAttributeRegistration = load_js_1.LoadCustomAttribute;
exports.HrefCustomAttributeRegistration = href_js_1.HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `load`, `href`
 */
exports.DefaultResources = [
    viewport_js_1.ViewportCustomElement,
    load_js_1.LoadCustomAttribute,
    href_js_1.HrefCustomAttribute,
];
function configure(container, config) {
    return container.register(runtime_html_1.AppTask.hydrated(kernel_1.IContainer, route_context_js_1.RouteContext.setRoot), runtime_html_1.AppTask.afterActivate(router_js_1.IRouter, router => {
        if (kernel_1.isObject(config)) {
            if (typeof config === 'function') {
                return config(router);
            }
            else {
                return router.start(config, true);
            }
        }
        return router.start({}, true);
    }), runtime_html_1.AppTask.afterDeactivate(router_js_1.IRouter, router => {
        router.stop();
    }), ...exports.DefaultComponents, ...exports.DefaultResources);
}
exports.RouterConfiguration = {
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