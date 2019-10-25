import { DebugConfiguration, } from '@aurelia/debug';
import { DI, Registration, } from '@aurelia/kernel';
import { IDOM, ILifecycle, IObserverLocator, IProjectorLocator, IRenderer, IRenderingEngine, ITemplateCompiler, IScheduler, } from '@aurelia/runtime';
import { HTMLDOM, } from '@aurelia/runtime-html';
export class HTMLTestContext {
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
        this.dom = new HTMLDOM(this.wnd, this.doc, NodeType, ElementType, HTMLElementType, CustomEventType, CSSStyleSheetType, ShadowRootType);
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
            this._container = DI.createContainer(this.config);
            Registration.instance(IDOM, this.dom).register(this._container);
            Registration.instance(HTMLTestContext, this).register(this._container);
            this._container.register(this.Scheduler);
            this._container.register(DebugConfiguration);
        }
        return this._container;
    }
    get scheduler() {
        if (this._scheduler === void 0) {
            this._scheduler = this.container.register(this.Scheduler).get(IScheduler);
        }
        return this._scheduler;
    }
    get templateCompiler() {
        if (this._templateCompiler === void 0) {
            this._templateCompiler = this.container.get(ITemplateCompiler);
        }
        return this._templateCompiler;
    }
    get observerLocator() {
        if (this._observerLocator === void 0) {
            this._observerLocator = this.container.get(IObserverLocator);
        }
        return this._observerLocator;
    }
    get lifecycle() {
        if (this._lifecycle === void 0) {
            this._lifecycle = this.container.get(ILifecycle);
        }
        return this._lifecycle;
    }
    get renderer() {
        if (this._renderer === void 0) {
            this._renderer = this.container.get(IRenderer);
        }
        return this._renderer;
    }
    get projectorLocator() {
        if (this._projectorLocator === void 0) {
            this._projectorLocator = this.container.get(IProjectorLocator);
        }
        return this._projectorLocator;
    }
    get renderingEngine() {
        if (this._renderingEngine === void 0) {
            this._renderingEngine = this.container.get(IRenderingEngine);
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
export const TestContext = {
    createHTMLTestContext() {
        throw new Error('No createHTMLTestContext function has been provided. Did you forget to call initializeJSDOMTestContext() or initializeBrowserTestContext()?');
    }
};
//# sourceMappingURL=html-test-context.js.map