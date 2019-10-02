(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    class BrowserDOMInitializer {
        constructor(container) {
            this.container = container;
        }
        static register(container) {
            return kernel_1.Registration.singleton(runtime_1.IDOMInitializer, this).register(container);
        }
        initialize(config) {
            if (this.container.has(runtime_1.IDOM, false)) {
                return this.container.get(runtime_1.IDOM);
            }
            let dom;
            if (config !== undefined) {
                if (config.dom !== undefined) {
                    dom = config.dom;
                }
                else if (config.host.ownerDocument !== null) {
                    dom = new runtime_html_1.HTMLDOM(window, config.host.ownerDocument, Node, Element, HTMLElement, CustomEvent, CSSStyleSheet, ShadowRoot);
                }
                else {
                    dom = new runtime_html_1.HTMLDOM(window, document, Node, Element, HTMLElement, CustomEvent, CSSStyleSheet, ShadowRoot);
                }
            }
            else {
                dom = new runtime_html_1.HTMLDOM(window, document, Node, Element, HTMLElement, CustomEvent, CSSStyleSheet, ShadowRoot);
            }
            kernel_1.Registration.instance(runtime_1.IDOM, dom).register(this.container);
            return dom;
        }
    }
    BrowserDOMInitializer.inject = [kernel_1.IContainer];
    exports.IDOMInitializerRegistration = BrowserDOMInitializer;
    /**
     * Default HTML-specific, browser-specific implementations for the following interfaces:
     * - `IDOMInitializer`
     */
    exports.DefaultComponents = [
        exports.IDOMInitializerRegistration
    ];
    /**
     * A DI configuration object containing html-specific, browser-specific registrations:
     * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
     * - `DefaultComponents`
     */
    exports.RuntimeHtmlBrowserConfiguration = {
        /**
         * Apply this configuration to the provided container.
         */
        register(container) {
            return runtime_html_1.RuntimeHtmlConfiguration
                .register(container)
                .register(...exports.DefaultComponents);
        },
        /**
         * Create a new container with this configuration applied to it.
         */
        createContainer() {
            return this.register(kernel_1.DI.createContainer());
        }
    };
});
//# sourceMappingURL=index.js.map