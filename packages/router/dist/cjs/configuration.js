"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterConfiguration = exports.DefaultResources = exports.HrefCustomAttributeRegistration = exports.LoadCustomAttributeRegistration = exports.GotoCustomAttributeRegistration = exports.NavCustomElementRegistration = exports.ViewportScopeCustomElementRegistration = exports.ViewportCustomElementRegistration = exports.HrefCustomAttribute = exports.LoadCustomAttribute = exports.GotoCustomAttribute = exports.NavCustomElement = exports.ViewportScopeCustomElement = exports.ViewportCustomElement = exports.DefaultComponents = exports.RouterRegistration = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const nav_js_1 = require("./resources/nav.js");
Object.defineProperty(exports, "NavCustomElement", { enumerable: true, get: function () { return nav_js_1.NavCustomElement; } });
const viewport_js_1 = require("./resources/viewport.js");
Object.defineProperty(exports, "ViewportCustomElement", { enumerable: true, get: function () { return viewport_js_1.ViewportCustomElement; } });
const viewport_scope_js_1 = require("./resources/viewport-scope.js");
Object.defineProperty(exports, "ViewportScopeCustomElement", { enumerable: true, get: function () { return viewport_scope_js_1.ViewportScopeCustomElement; } });
const goto_js_1 = require("./resources/goto.js");
Object.defineProperty(exports, "GotoCustomAttribute", { enumerable: true, get: function () { return goto_js_1.GotoCustomAttribute; } });
const load_js_1 = require("./resources/load.js");
Object.defineProperty(exports, "LoadCustomAttribute", { enumerable: true, get: function () { return load_js_1.LoadCustomAttribute; } });
const href_js_1 = require("./resources/href.js");
Object.defineProperty(exports, "HrefCustomAttribute", { enumerable: true, get: function () { return href_js_1.HrefCustomAttribute; } });
const router_js_1 = require("./router.js");
exports.RouterRegistration = router_js_1.IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
exports.DefaultComponents = [
    exports.RouterRegistration,
];
exports.ViewportCustomElementRegistration = viewport_js_1.ViewportCustomElement;
exports.ViewportScopeCustomElementRegistration = viewport_scope_js_1.ViewportScopeCustomElement;
exports.NavCustomElementRegistration = nav_js_1.NavCustomElement;
exports.GotoCustomAttributeRegistration = goto_js_1.GotoCustomAttribute;
exports.LoadCustomAttributeRegistration = load_js_1.LoadCustomAttribute;
exports.HrefCustomAttributeRegistration = href_js_1.HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
 */
exports.DefaultResources = [
    viewport_js_1.ViewportCustomElement,
    viewport_scope_js_1.ViewportScopeCustomElement,
    nav_js_1.NavCustomElement,
    goto_js_1.GotoCustomAttribute,
    load_js_1.LoadCustomAttribute,
    href_js_1.HrefCustomAttribute,
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
        return container.register(...exports.DefaultComponents, ...exports.DefaultResources, runtime_html_1.AppTask.with(router_js_1.IRouter).beforeActivate().call(configurationCall), runtime_html_1.AppTask.with(router_js_1.IRouter).afterActivate().call(router => router.loadUrl()), runtime_html_1.AppTask.with(router_js_1.IRouter).afterDeactivate().call(router => router.stop()));
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(kernel_1.DI.createContainer());
    }
};
exports.RouterConfiguration = {
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