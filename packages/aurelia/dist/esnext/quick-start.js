import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { DI } from '@aurelia/kernel';
import { Aurelia as $Aurelia, CustomElement } from '@aurelia/runtime';
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
        if (CustomElement.isType(config)) {
            // Default to custom element element name
            const definition = CustomElement.getDefinition(config);
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
//# sourceMappingURL=quick-start.js.map