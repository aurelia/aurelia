(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime-html", "./resources/nav", "./resources/viewport", "./resources/viewport-scope", "./resources/goto", "./resources/load", "./resources/href", "./router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RouterConfiguration = exports.DefaultResources = exports.HrefCustomAttributeRegistration = exports.LoadCustomAttributeRegistration = exports.GotoCustomAttributeRegistration = exports.NavCustomElementRegistration = exports.ViewportScopeCustomElementRegistration = exports.ViewportCustomElementRegistration = exports.HrefCustomAttribute = exports.LoadCustomAttribute = exports.GotoCustomAttribute = exports.NavCustomElement = exports.ViewportScopeCustomElement = exports.ViewportCustomElement = exports.DefaultComponents = exports.RouterRegistration = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const nav_1 = require("./resources/nav");
    Object.defineProperty(exports, "NavCustomElement", { enumerable: true, get: function () { return nav_1.NavCustomElement; } });
    const viewport_1 = require("./resources/viewport");
    Object.defineProperty(exports, "ViewportCustomElement", { enumerable: true, get: function () { return viewport_1.ViewportCustomElement; } });
    const viewport_scope_1 = require("./resources/viewport-scope");
    Object.defineProperty(exports, "ViewportScopeCustomElement", { enumerable: true, get: function () { return viewport_scope_1.ViewportScopeCustomElement; } });
    const goto_1 = require("./resources/goto");
    Object.defineProperty(exports, "GotoCustomAttribute", { enumerable: true, get: function () { return goto_1.GotoCustomAttribute; } });
    const load_1 = require("./resources/load");
    Object.defineProperty(exports, "LoadCustomAttribute", { enumerable: true, get: function () { return load_1.LoadCustomAttribute; } });
    const href_1 = require("./resources/href");
    Object.defineProperty(exports, "HrefCustomAttribute", { enumerable: true, get: function () { return href_1.HrefCustomAttribute; } });
    const router_1 = require("./router");
    exports.RouterRegistration = router_1.IRouter;
    /**
     * Default runtime/environment-agnostic implementations for the following interfaces:
     * - `IRouter`
     */
    exports.DefaultComponents = [
        exports.RouterRegistration,
    ];
    exports.ViewportCustomElementRegistration = viewport_1.ViewportCustomElement;
    exports.ViewportScopeCustomElementRegistration = viewport_scope_1.ViewportScopeCustomElement;
    exports.NavCustomElementRegistration = nav_1.NavCustomElement;
    exports.GotoCustomAttributeRegistration = goto_1.GotoCustomAttribute;
    exports.LoadCustomAttributeRegistration = load_1.LoadCustomAttribute;
    exports.HrefCustomAttributeRegistration = href_1.HrefCustomAttribute;
    /**
     * Default router resources:
     * - Custom Elements: `au-viewport`, `au-nav`
     * - Custom Attributes: `goto`, `load`, `href`
     */
    exports.DefaultResources = [
        viewport_1.ViewportCustomElement,
        viewport_scope_1.ViewportScopeCustomElement,
        nav_1.NavCustomElement,
        goto_1.GotoCustomAttribute,
        load_1.LoadCustomAttribute,
        href_1.HrefCustomAttribute,
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
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources, runtime_html_1.AppTask.with(router_1.IRouter).beforeActivate().call(configurationCall), runtime_html_1.AppTask.with(router_1.IRouter).afterActivate().call(router => router.loadUrl()), runtime_html_1.AppTask.with(router_1.IRouter).afterDeactivate().call(router => router.stop()));
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
});
//# sourceMappingURL=configuration.js.map