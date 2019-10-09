(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resources/goto", "@aurelia/kernel", "@aurelia/runtime", "./resources/nav", "./resources/viewport", "./router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const goto_1 = require("./resources/goto");
    exports.GotoCustomAttribute = goto_1.GotoCustomAttribute;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const nav_1 = require("./resources/nav");
    exports.NavCustomElement = nav_1.NavCustomElement;
    const viewport_1 = require("./resources/viewport");
    exports.ViewportCustomElement = viewport_1.ViewportCustomElement;
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
    exports.NavCustomElementRegistration = nav_1.NavCustomElement;
    exports.GotoCustomAttributeRegistration = goto_1.GotoCustomAttribute;
    /**
     * Default router resources:
     * - Custom Elements: `au-viewport`, `au-nav`
     * - Custom Attributes: `goto`
     */
    exports.DefaultResources = [
        viewport_1.ViewportCustomElement,
        nav_1.NavCustomElement,
        goto_1.GotoCustomAttribute,
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
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources, runtime_1.StartTask.with(router_1.IRouter).beforeBind().call(configurationCall), runtime_1.StartTask.with(router_1.IRouter).beforeAttach().call(router => router.loadUrl()));
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
});
//# sourceMappingURL=configuration.js.map