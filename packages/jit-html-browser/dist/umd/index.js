(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/jit", "@aurelia/jit-html", "@aurelia/kernel", "@aurelia/runtime-html-browser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jit_1 = require("@aurelia/jit");
    const jit_html_1 = require("@aurelia/jit-html");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_html_browser_1 = require("@aurelia/runtime-html-browser");
    const { enter, leave } = kernel_1.Profiler.createTimer('JitHtmlBrowserConfiguration');
    /**
     * A DI configuration object containing html-specific, browser-specific registrations:
     * - `RuntimeHtmlBrowserConfiguration` from `@aurelia/runtime-html-browser`
     * - `DefaultComponents` from `@aurelia/jit`
     * - `DefaultBindingSyntax` from `@aurelia/jit`
     * - `DefaultBindingLanguage` from `@aurelia/jit`
     * - `DefaultComponents` from `@aurelia/jit-html`
     * - `DefaultBindingLanguage` from `@aurelia/jit-html`
     */
    exports.JitHtmlBrowserConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            runtime_html_browser_1.RuntimeHtmlBrowserConfiguration
                .register(container)
                .register(...jit_1.DefaultBindingLanguage, ...jit_1.DefaultBindingSyntax, ...jit_1.DefaultComponents, ...jit_html_1.DefaultBindingLanguage, ...jit_html_1.DefaultComponents);
            return container;
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            const container = this.register(kernel_1.DI.createContainer());
            return container;
        }
    };
});
//# sourceMappingURL=index.js.map