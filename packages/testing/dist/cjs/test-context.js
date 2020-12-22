"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContainer = exports.setPlatform = exports.PLATFORMRegistration = exports.PLATFORM = exports.TestContext = void 0;
/* eslint-disable import/no-mutable-exports */
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
class TestContext {
    constructor() {
        this._container = void 0;
        this._platform = void 0;
        this._templateCompiler = void 0;
        this._observerLocator = void 0;
        this._domParser = void 0;
    }
    get wnd() { return this.platform.globalThis; }
    get doc() { return this.platform.document; }
    get userAgent() { return this.platform.navigator.userAgent; }
    get UIEvent() { return this.platform.globalThis.UIEvent; }
    get Event() { return this.platform.globalThis.Event; }
    get CustomEvent() { return this.platform.globalThis.CustomEvent; }
    get Node() { return this.platform.globalThis.Node; }
    get Element() { return this.platform.globalThis.Element; }
    get HTMLElement() { return this.platform.globalThis.HTMLElement; }
    get HTMLDivElement() { return this.platform.globalThis.HTMLDivElement; }
    get Text() { return this.platform.globalThis.Text; }
    get Comment() { return this.platform.globalThis.Comment; }
    get DOMParser() { return this.platform.globalThis.DOMParser; }
    get container() {
        if (this._container === void 0) {
            this._container = kernel_1.DI.createContainer();
            runtime_html_1.StandardConfiguration.register(this._container);
            this._container.register(kernel_1.Registration.instance(TestContext, this));
            if (this._container.has(runtime_html_1.IPlatform, true) === false) {
                this._container.register(exports.PLATFORMRegistration);
            }
        }
        return this._container;
    }
    get platform() {
        if (this._platform === void 0) {
            this._platform = this.container.get(runtime_html_1.IPlatform);
        }
        return this._platform;
    }
    get templateCompiler() {
        if (this._templateCompiler === void 0) {
            this._templateCompiler = this.container.get(runtime_html_1.ITemplateCompiler);
        }
        return this._templateCompiler;
    }
    get observerLocator() {
        if (this._observerLocator === void 0) {
            this._observerLocator = this.container.get(runtime_html_1.IObserverLocator);
        }
        return this._observerLocator;
    }
    get domParser() {
        if (this._domParser === void 0) {
            this._domParser = this.doc.createElement('div');
        }
        return this._domParser;
    }
    static create() {
        return new TestContext();
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
exports.TestContext = TestContext;
function setPlatform(p) {
    exports.PLATFORM = p;
    exports.PLATFORMRegistration = kernel_1.Registration.instance(runtime_html_1.IPlatform, p);
}
exports.setPlatform = setPlatform;
function createContainer(...registries) {
    return kernel_1.DI.createContainer().register(exports.PLATFORMRegistration, ...registries);
}
exports.createContainer = createContainer;
//# sourceMappingURL=test-context.js.map