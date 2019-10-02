import { DI, IContainer, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
class BrowserDOMInitializer {
    constructor(container) {
        this.container = container;
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
            else if (config.host.ownerDocument !== null) {
                dom = new HTMLDOM(window, config.host.ownerDocument, Node, Element, HTMLElement, CustomEvent, CSSStyleSheet, ShadowRoot);
            }
            else {
                dom = new HTMLDOM(window, document, Node, Element, HTMLElement, CustomEvent, CSSStyleSheet, ShadowRoot);
            }
        }
        else {
            dom = new HTMLDOM(window, document, Node, Element, HTMLElement, CustomEvent, CSSStyleSheet, ShadowRoot);
        }
        Registration.instance(IDOM, dom).register(this.container);
        return dom;
    }
}
BrowserDOMInitializer.inject = [IContainer];
export const IDOMInitializerRegistration = BrowserDOMInitializer;
/**
 * Default HTML-specific, browser-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
    IDOMInitializerRegistration
];
/**
 * A DI configuration object containing html-specific, browser-specific registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export const RuntimeHtmlBrowserConfiguration = {
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
//# sourceMappingURL=index.js.map