(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/runtime-html", "@aurelia/scheduler-dom", "jsdom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const scheduler_dom_1 = require("@aurelia/scheduler-dom");
    const jsdom_1 = require("jsdom");
    let JSDOMInitializer = class JSDOMInitializer {
        constructor(container) {
            this.container = container;
            this.jsdom = new jsdom_1.JSDOM('', { pretendToBeVisual: true });
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
                else if (config.host.ownerDocument) {
                    dom = new runtime_html_1.HTMLDOM(this.jsdom.window, config.host.ownerDocument, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent, this.jsdom.window.CSSStyleSheet, this.jsdom.window.ShadowRoot);
                }
                else {
                    if (config.host !== undefined) {
                        this.jsdom.window.document.body.appendChild(config.host);
                    }
                    dom = new runtime_html_1.HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent, this.jsdom.window.CSSStyleSheet, this.jsdom.window.ShadowRoot);
                }
            }
            else {
                dom = new runtime_html_1.HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent, this.jsdom.window.CSSStyleSheet, this.jsdom.window.ShadowRoot);
            }
            kernel_1.Registration.instance(runtime_1.IDOM, dom).register(this.container);
            kernel_1.Registration.instance(runtime_1.IScheduler, scheduler_dom_1.createDOMScheduler(this.container, this.jsdom.window)).register(this.container);
            return dom;
        }
    };
    JSDOMInitializer = tslib_1.__decorate([
        tslib_1.__param(0, kernel_1.IContainer),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], JSDOMInitializer);
    exports.JSDOMInitializer = JSDOMInitializer;
    exports.IDOMInitializerRegistration = JSDOMInitializer;
    /**
     * Default HTML-specific, jsdom-specific implementations for the following interfaces:
     * - `IDOMInitializer`
     */
    exports.DefaultComponents = [
        exports.IDOMInitializerRegistration,
    ];
    /**
     * A DI configuration object containing html-specific, jsdom-specific registrations:
     * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
     * - `DefaultComponents`
     */
    exports.RuntimeHtmlJsdomConfiguration = {
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