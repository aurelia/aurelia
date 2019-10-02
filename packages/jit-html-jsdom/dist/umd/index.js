(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/jit", "@aurelia/jit-html", "@aurelia/kernel", "@aurelia/runtime-html-jsdom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jit_1 = require("@aurelia/jit");
    const jit_html_1 = require("@aurelia/jit-html");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_html_jsdom_1 = require("@aurelia/runtime-html-jsdom");
    const { enter, leave } = kernel_1.Profiler.createTimer('JitHtmlJsdomConfiguration');
    /**
     * A DI configuration object containing html-specific, jsdom-specific registrations:
     * - `RuntimeHtmlJsdomConfiguration` from `@aurelia/runtime-html-jsdom`
     * - `DefaultComponents` from `@aurelia/jit`
     * - `DefaultBindingSyntax` from `@aurelia/jit`
     * - `DefaultBindingLanguage` from `@aurelia/jit`
     * - `DefaultComponents` from `@aurelia/jit-html`
     * - `DefaultBindingLanguage` from `@aurelia/jit-html`
     */
    exports.JitHtmlJsdomConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            runtime_html_jsdom_1.RuntimeHtmlJsdomConfiguration
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