var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DI, IContainer, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, IScheduler } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { createDOMScheduler } from '@aurelia/scheduler-dom';
import { JSDOM } from 'jsdom';
let JSDOMInitializer = class JSDOMInitializer {
    constructor(container) {
        this.container = container;
        this.jsdom = new JSDOM('', { pretendToBeVisual: true });
    }
    static register(container) {
        return Registration.singleton(IDOMInitializer, this).register(container);
    }
    initialize(config) {
        if (this.container.has(IDOM, false)) {
            return this.container.get(IDOM);
        }
        let dom;
        if (config !== undefined) {
            if (config.dom !== undefined) {
                dom = config.dom;
            }
            else if (config.host.ownerDocument) {
                dom = new HTMLDOM(this.jsdom.window, config.host.ownerDocument, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent, this.jsdom.window.CSSStyleSheet, this.jsdom.window.ShadowRoot);
            }
            else {
                if (config.host !== undefined) {
                    this.jsdom.window.document.body.appendChild(config.host);
                }
                dom = new HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent, this.jsdom.window.CSSStyleSheet, this.jsdom.window.ShadowRoot);
            }
        }
        else {
            dom = new HTMLDOM(this.jsdom.window, this.jsdom.window.document, this.jsdom.window.Node, this.jsdom.window.Element, this.jsdom.window.HTMLElement, this.jsdom.window.CustomEvent, this.jsdom.window.CSSStyleSheet, this.jsdom.window.ShadowRoot);
        }
        Registration.instance(IDOM, dom).register(this.container);
        Registration.instance(IScheduler, createDOMScheduler(this.container, this.jsdom.window)).register(this.container);
        return dom;
    }
};
JSDOMInitializer = __decorate([
    __param(0, IContainer),
    __metadata("design:paramtypes", [Object])
], JSDOMInitializer);
export const IDOMInitializerRegistration = JSDOMInitializer;
/**
 * Default HTML-specific, jsdom-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
    IDOMInitializerRegistration,
];
/**
 * A DI configuration object containing html-specific, jsdom-specific registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export const RuntimeHtmlJsdomConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return RuntimeHtmlConfiguration
            .register(container)
            .register(...DefaultComponents);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};
export { JSDOMInitializer, };
//# sourceMappingURL=index.js.map