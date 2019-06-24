(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./resources/nav", "./resources/viewport", "./router"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const nav_1 = require("./resources/nav");
    exports.NavCustomElement = nav_1.NavCustomElement;
    const viewport_1 = require("./resources/viewport");
    exports.ViewportCustomElement = viewport_1.ViewportCustomElement;
    const router_1 = require("./router");
    exports.RouterRegistration = router_1.Router;
    /**
     * Default runtime/environment-agnostic implementations for the following interfaces:
     * - `IRouter`
     */
    exports.DefaultComponents = [
        exports.RouterRegistration
    ];
    exports.ViewportCustomElementRegistration = viewport_1.ViewportCustomElement;
    exports.NavCustomElementRegistration = nav_1.NavCustomElement;
    /**
     * Default router resources:
     * - Custom Elements: `au-viewport`, `au-nav`
     */
    exports.DefaultResources = [
        viewport_1.ViewportCustomElement,
        nav_1.NavCustomElement,
    ];
    /**
     * A DI configuration object containing router resource registrations.
     */
    exports.RouterConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return container.register(...exports.DefaultComponents, ...exports.DefaultResources);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel_1.DI.createContainer());
        }
    };
});
//# sourceMappingURL=configuration.js.map