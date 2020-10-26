(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StyleElementStyles = exports.AdoptedStyleSheetsStyles = exports.IShadowDOMGlobalStyles = exports.IShadowDOMStyles = exports.noopShadowDOMStyles = void 0;
    const kernel_1 = require("@aurelia/kernel");
    exports.noopShadowDOMStyles = Object.freeze({
        applyTo: kernel_1.noop
    });
    exports.IShadowDOMStyles = kernel_1.DI.createInterface('IShadowDOMStyles').noDefault();
    exports.IShadowDOMGlobalStyles = kernel_1.DI.createInterface('IShadowDOMGlobalStyles')
        .withDefault(x => x.instance(exports.noopShadowDOMStyles));
    class AdoptedStyleSheetsStyles {
        constructor(p, localStyles, styleSheetCache, sharedStyles = null) {
            this.sharedStyles = sharedStyles;
            this.styleSheets = localStyles.map(x => {
                let sheet;
                if (x instanceof p.CSSStyleSheet) {
                    sheet = x;
                }
                else {
                    sheet = styleSheetCache.get(x);
                    if (!sheet) {
                        sheet = new p.CSSStyleSheet();
                        sheet.replaceSync(x);
                        styleSheetCache.set(x, sheet);
                    }
                }
                return sheet;
            });
        }
        static supported(p) {
            return 'adoptedStyleSheets' in p.ShadowRoot.prototype;
        }
        applyTo(shadowRoot) {
            if (this.sharedStyles !== null) {
                this.sharedStyles.applyTo(shadowRoot);
            }
            // https://wicg.github.io/construct-stylesheets/
            // https://developers.google.com/web/updates/2019/02/constructable-stylesheets
            shadowRoot.adoptedStyleSheets = [
                ...shadowRoot.adoptedStyleSheets,
                ...this.styleSheets
            ];
        }
    }
    exports.AdoptedStyleSheetsStyles = AdoptedStyleSheetsStyles;
    class StyleElementStyles {
        constructor(p, localStyles, sharedStyles = null) {
            this.p = p;
            this.localStyles = localStyles;
            this.sharedStyles = sharedStyles;
        }
        applyTo(shadowRoot) {
            const styles = this.localStyles;
            const p = this.p;
            for (let i = styles.length - 1; i > -1; --i) {
                const element = p.document.createElement('style');
                element.innerHTML = styles[i];
                shadowRoot.prepend(element);
            }
            if (this.sharedStyles !== null) {
                this.sharedStyles.applyTo(shadowRoot);
            }
        }
    }
    exports.StyleElementStyles = StyleElementStyles;
});
//# sourceMappingURL=shadow-dom-styles.js.map