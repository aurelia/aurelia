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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../platform", "./shadow-dom-styles"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShadowDOMRegistry = exports.IShadowDOMStyleFactory = exports.shadowCSS = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const platform_1 = require("../platform");
    const shadow_dom_styles_1 = require("./shadow-dom-styles");
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
            if (shadow_dom_styles_1.AdoptedStyleSheetsStyles.supported(container.get(platform_1.IPlatform))) {
                return container.get(AdoptedStyleSheetsStylesFactory);
            }
            return container.get(StyleElementStylesFactory);
        }
    }
    exports.ShadowDOMRegistry = ShadowDOMRegistry;
    let AdoptedStyleSheetsStylesFactory = class AdoptedStyleSheetsStylesFactory {
        constructor(p) {
            this.p = p;
            this.cache = new Map();
        }
        createStyles(localStyles, sharedStyles) {
            return new shadow_dom_styles_1.AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
        }
    };
    AdoptedStyleSheetsStylesFactory = __decorate([
        __param(0, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object])
    ], AdoptedStyleSheetsStylesFactory);
    let StyleElementStylesFactory = class StyleElementStylesFactory {
        constructor(p) {
            this.p = p;
        }
        createStyles(localStyles, sharedStyles) {
            if (localStyles.some(x => typeof x !== 'string')) {
                // TODO: use reporter
                throw new Error('Shadow DOM CSS must be a string.');
            }
            return new shadow_dom_styles_1.StyleElementStyles(this.p, localStyles, sharedStyles);
        }
    };
    StyleElementStylesFactory = __decorate([
        __param(0, platform_1.IPlatform),
        __metadata("design:paramtypes", [Object])
    ], StyleElementStylesFactory);
});
//# sourceMappingURL=shadow-dom-registry.js.map