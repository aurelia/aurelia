(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/debug", "@aurelia/kernel", "@aurelia/runtime", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debug_1 = require("@aurelia/debug");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    class HTMLTestContext {
        constructor(config, wnd, Scheduler, UIEventType, EventType, CustomEventType, NodeType, ElementType, HTMLElementType, HTMLDivElementType, TextType, CommentType, DOMParserType, CSSStyleSheetType, ShadowRootType) {
            this.config = config;
            this.wnd = wnd;
            this.Scheduler = Scheduler;
            this.UIEvent = UIEventType;
            this.Event = EventType;
            this.CustomEvent = CustomEventType;
            this.Node = NodeType;
            this.Element = ElementType;
            this.HTMLElement = HTMLElementType;
            this.HTMLDivElement = HTMLDivElementType;
            this.Text = TextType;
            this.Comment = CommentType;
            this.DOMParser = DOMParserType;
            this.doc = wnd.document;
            this.dom = new runtime_html_1.HTMLDOM(this.wnd, this.doc, NodeType, ElementType, HTMLElementType, CustomEventType, CSSStyleSheetType, ShadowRootType);
            this._container = void 0;
            this._scheduler = void 0;
            this._templateCompiler = void 0;
            this._observerLocator = void 0;
            this._lifecycle = void 0;
            this._renderer = void 0;
            this._projectorLocator = void 0;
            this._renderingEngine = void 0;
            this._domParser = void 0;
        }
        get container() {
            if (this._container === void 0) {
                this._container = kernel_1.DI.createContainer(this.config);
                kernel_1.Registration.instance(runtime_1.IDOM, this.dom).register(this._container);
                kernel_1.Registration.instance(HTMLTestContext, this).register(this._container);
                this._container.register(this.Scheduler);
                this._container.register(debug_1.DebugConfiguration);
            }
            return this._container;
        }
        get scheduler() {
            if (this._scheduler === void 0) {
                this._scheduler = this.container.register(this.Scheduler).get(runtime_1.IScheduler);
            }
            return this._scheduler;
        }
        get templateCompiler() {
            if (this._templateCompiler === void 0) {
                this._templateCompiler = this.container.get(runtime_1.ITemplateCompiler);
            }
            return this._templateCompiler;
        }
        get observerLocator() {
            if (this._observerLocator === void 0) {
                this._observerLocator = this.container.get(runtime_1.IObserverLocator);
            }
            return this._observerLocator;
        }
        get lifecycle() {
            if (this._lifecycle === void 0) {
                this._lifecycle = this.container.get(runtime_1.ILifecycle);
            }
            return this._lifecycle;
        }
        get renderer() {
            if (this._renderer === void 0) {
                this._renderer = this.container.get(runtime_1.IRenderer);
            }
            return this._renderer;
        }
        get projectorLocator() {
            if (this._projectorLocator === void 0) {
                this._projectorLocator = this.container.get(runtime_1.IProjectorLocator);
            }
            return this._projectorLocator;
        }
        get renderingEngine() {
            if (this._renderingEngine === void 0) {
                this._renderingEngine = this.container.get(runtime_1.IRenderingEngine);
            }
            return this._renderingEngine;
        }
        get domParser() {
            if (this._domParser === void 0) {
                this._domParser = this.doc.createElement('div');
            }
            return this._domParser;
        }
        static create(config, wnd, Scheduler, UIEventType, EventType, CustomEventType, NodeType, ElementType, HTMLElementType, HTMLDivElementType, TextType, CommentType, DOMParserType, CSSStyleSheetType, ShadowRootType) {
            return new HTMLTestContext(config, wnd, Scheduler, UIEventType, EventType, CustomEventType, NodeType, ElementType, HTMLElementType, HTMLDivElementType, TextType, CommentType, DOMParserType, CSSStyleSheetType, ShadowRootType);
        }
        createElementFromMarkup(markup) {
            this.domParser.innerHTML = markup;
            return this.domParser.firstElementChild;
        }
        createElement(name) {
            return this.doc.createElement(name);
        }
        createAttribute(name, value) {
            const attr = this.doc.createAttribute(name);
            attr.value = value;
            return attr;
        }
    }
    exports.HTMLTestContext = HTMLTestContext;
    exports.TestContext = {
        createHTMLTestContext() {
            throw new Error('No createHTMLTestContext function has been provided. Did you forget to call initializeJSDOMTestContext() or initializeBrowserTestContext()?');
        }
    };
});
//# sourceMappingURL=html-test-context.js.map