import { __decorate, __metadata, __param } from "tslib";
import { Registration, DI } from '@aurelia/kernel';
import { IShadowDOMStyles, IShadowDOMGlobalStyles, AdoptedStyleSheetsStyles, StyleElementStyles } from './shadow-dom-styles';
import { HTMLDOM } from '../dom';
import { IDOM } from '@aurelia/runtime';
export function shadowCSS(...css) {
    return new ShadowDOMRegistry(css);
}
const factoryCache = new WeakMap();
export const IShadowDOMStyleFactory = DI.createInterface('IShadowDOMStyleFactory')
    .withDefault(x => x.callback((handler, requestor, resolver) => {
    let factory = factoryCache.get(resolver);
    if (factory === void 0) {
        factoryCache.set(resolver, factory = ShadowDOMRegistry.createStyleFactory(handler));
    }
    return factory;
}));
export class ShadowDOMRegistry {
    constructor(css) {
        this.css = css;
    }
    register(container) {
        const sharedStyles = container.get(IShadowDOMGlobalStyles);
        const factory = container.get(IShadowDOMStyleFactory);
        container.register(Registration.instance(IShadowDOMStyles, factory.createStyles(this.css, sharedStyles)));
    }
    static createStyleFactory(container) {
        if (AdoptedStyleSheetsStyles.supported(container.get(HTMLDOM))) {
            return container.get(AdoptedStyleSheetsStylesFactory);
        }
        return container.get(StyleElementStylesFactory);
    }
}
let AdoptedStyleSheetsStylesFactory = class AdoptedStyleSheetsStylesFactory {
    constructor(dom) {
        this.dom = dom;
        this.cache = new Map();
    }
    createStyles(localStyles, sharedStyles) {
        return new AdoptedStyleSheetsStyles(this.dom, localStyles, this.cache, sharedStyles);
    }
};
AdoptedStyleSheetsStylesFactory = __decorate([
    __param(0, IDOM),
    __metadata("design:paramtypes", [HTMLDOM])
], AdoptedStyleSheetsStylesFactory);
let StyleElementStylesFactory = class StyleElementStylesFactory {
    constructor(dom) {
        this.dom = dom;
    }
    createStyles(localStyles, sharedStyles) {
        if (localStyles.some(x => typeof x !== 'string')) {
            // TODO: use reporter
            throw new Error('Shadow DOM CSS must be a string.');
        }
        return new StyleElementStyles(this.dom, localStyles, sharedStyles);
    }
};
StyleElementStylesFactory = __decorate([
    __param(0, IDOM),
    __metadata("design:paramtypes", [HTMLDOM])
], StyleElementStylesFactory);
//# sourceMappingURL=shadow-dom-registry.js.map