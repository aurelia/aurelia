(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/debug", "@aurelia/jit-html-browser", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debug_1 = require("@aurelia/debug");
    const jit_html_browser_1 = require("@aurelia/jit-html-browser");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    // TODO: SSR?? abstract HTMLElement and document.
    function createAurelia() {
        const au = new Aurelia();
        au.register(jit_html_browser_1.JitHtmlBrowserConfiguration);
        // eslint-disable-next-line sonarjs/no-collapsible-if
        if (typeof process !== 'undefined' && typeof process.env === 'object') {
            // Just use NODE_ENV to control build process.
            // Bundlers (at least webpack/dumber/parcel) have feature to remove this branch in production.
            // Then tree-shaking/minifier will remove unused DebugConfiguration import.
            if (process.env.NODE_ENV !== 'production') {
                au.register(debug_1.DebugConfiguration);
            }
        }
        return au;
    }
    class Aurelia extends runtime_1.Aurelia {
        constructor(container = kernel_1.DI.createContainer()) {
            super(container);
        }
        static start(root) {
            return createAurelia().start(root);
        }
        static app(config) {
            return createAurelia().app(config);
        }
        static register(...params) {
            return createAurelia().register(...params);
        }
        app(config) {
            if (runtime_1.CustomElement.isType(config)) {
                // Default to custom element element name
                const definition = runtime_1.CustomElement.getDefinition(config);
                let host = document.querySelector(definition.name);
                if (host === null) {
                    // When no target is found, default to body.
                    // For example, when user forgot to write <my-app></my-app> in html.
                    host = document.body;
                }
                return super.app({
                    host: host,
                    component: config
                });
            }
            return super.app(config);
        }
    }
    exports.Aurelia = Aurelia;
});
//# sourceMappingURL=quick-start.js.map