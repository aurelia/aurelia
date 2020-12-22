/* eslint-disable import/no-mutable-exports */
import { DI, Registration } from '@aurelia/kernel';
import { IObserverLocator, ITemplateCompiler, IPlatform, StandardConfiguration, } from '@aurelia/runtime-html';
export class TestContext {
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
            this._container = DI.createContainer();
            StandardConfiguration.register(this._container);
            this._container.register(Registration.instance(TestContext, this));
            if (this._container.has(IPlatform, true) === false) {
                this._container.register(PLATFORMRegistration);
            }
        }
        return this._container;
    }
    get platform() {
        if (this._platform === void 0) {
            this._platform = this.container.get(IPlatform);
        }
        return this._platform;
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
// Note: our tests shouldn't rely directly on this global variable, but retrieve the platform from a container instead.
// This keeps the door open for more easily mocking the task queues or certain globals (such as Date) in the future.
// It's OK to use this for environment or feature checks necessary to conditionally run tests that only work in specific envs,
// or for initializing test data (creating template elements) before actually running the tests that use that data.
// For existing usages that "violate" the above: do NOT introduce more of them. Intent is to get rid of those in a future test cleanup pass. Please don't create more work for when that time comes.
export let PLATFORM;
export let PLATFORMRegistration;
export function setPlatform(p) {
    PLATFORM = p;
    PLATFORMRegistration = Registration.instance(IPlatform, p);
}
export function createContainer(...registries) {
    return DI.createContainer().register(PLATFORMRegistration, ...registries);
}
//# sourceMappingURL=test-context.js.map