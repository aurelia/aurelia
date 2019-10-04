import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { DI } from '@aurelia/kernel';
import { Aurelia as $Aurelia } from '@aurelia/runtime';
// TODO: SSR?? abstract HTMLElement and document.
function createAurelia() {
    const au = new Aurelia();
    au.register(JitHtmlBrowserConfiguration);
    // eslint-disable-next-line sonarjs/no-collapsible-if
    if (typeof process !== 'undefined' && typeof process.env === 'object') {
        // Just use NODE_ENV to control build process.
        // Bundlers (at least webpack/dumber/parcel) have feature to remove this branch in production.
        // Then tree-shaking/minifier will remove unused DebugConfiguration import.
        if (process.env.NODE_ENV !== 'production') {
            au.register(DebugConfiguration);
        }
    }
    return au;
}
export class Aurelia extends $Aurelia {
    constructor(container = DI.createContainer()) {
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
        const comp = config;
        // tslint:disable-next-line:no-collapsible-if
        if (comp && comp.kind && comp.kind.name === 'custom-element') {
            // Default to custom element element name
            const elementName = comp.description && comp.description.name;
            let host = document.querySelector(elementName);
            if (host === null) {
                // When no target is found, default to body.
                // For example, when user forgot to write <my-app></my-app> in html.
                host = document.body;
            }
            return super.app({
                host: host,
                component: comp
            });
        }
        return super.app(config);
    }
}
//# sourceMappingURL=quick-start.js.map