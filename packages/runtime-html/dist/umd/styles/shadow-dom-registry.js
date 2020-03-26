(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./shadow-dom-styles", "../dom", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const shadow_dom_styles_1 = require("./shadow-dom-styles");
    const dom_1 = require("../dom");
    const runtime_1 = require("@aurelia/runtime");
    function shadowCSS(...css) {
        return new ShadowDOMRegistry(css);
    }
    exports.shadowCSS = shadowCSS;
    const factoryCache = new WeakMap();
    exports.IShadowDOMStyleFactory = kernel_1.DI.createInterface('IShadowDOMStyleFactory')
        .withDefault(x => x.callback((handler, requestor, resolver) => {
        let factory = factoryCache.get(resolver);
        if (factory === void 0) {
            factoryCache.set(resolver, factory = ShadowDOMRegistry.createStyleFactory(handler));
        }
        return factory;
    }));
    class ShadowDOMRegistry {
        constructor(css) {
            this.css = css;
        }
        register(container) {
            const sharedStyles = container.get(shadow_dom_styles_1.IShadowDOMGlobalStyles);
            const factory = container.get(exports.IShadowDOMStyleFactory);
            container.register(kernel_1.Registration.instance(shadow_dom_styles_1.IShadowDOMStyles, factory.createStyles(this.css, sharedStyles)));
        }
        static createStyleFactory(container) {
            if (shadow_dom_styles_1.AdoptedStyleSheetsStyles.supported(container.get(dom_1.HTMLDOM))) {
                return container.get(AdoptedStyleSheetsStylesFactory);
            }
            return container.get(StyleElementStylesFactory);
        }
    }
    exports.ShadowDOMRegistry = ShadowDOMRegistry;
    let AdoptedStyleSheetsStylesFactory = class AdoptedStyleSheetsStylesFactory {
        constructor(dom) {
            this.dom = dom;
            this.cache = new Map();
        }
        createStyles(localStyles, sharedStyles) {
            return new shadow_dom_styles_1.AdoptedStyleSheetsStyles(this.dom, localStyles, this.cache, sharedStyles);
        }
    };
    AdoptedStyleSheetsStylesFactory = tslib_1.__decorate([
        tslib_1.__param(0, runtime_1.IDOM),
        tslib_1.__metadata("design:paramtypes", [dom_1.HTMLDOM])
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
            return new shadow_dom_styles_1.StyleElementStyles(this.dom, localStyles, sharedStyles);
        }
    };
    StyleElementStylesFactory = tslib_1.__decorate([
        tslib_1.__param(0, runtime_1.IDOM),
        tslib_1.__metadata("design:paramtypes", [dom_1.HTMLDOM])
    ], StyleElementStylesFactory);
});
//# sourceMappingURL=shadow-dom-registry.js.map