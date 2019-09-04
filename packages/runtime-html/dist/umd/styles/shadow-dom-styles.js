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
    const kernel_1 = require("@aurelia/kernel");
    exports.noopShadowDOMStyles = Object.freeze({
        applyTo: kernel_1.PLATFORM.noop
    });
    exports.IShadowDOMStyles = kernel_1.DI.createInterface('IShadowDOMStyles').noDefault();
    exports.IShadowDOMGlobalStyles = kernel_1.DI.createInterface('IShadowDOMGlobalStyles')
        .withDefault(x => x.instance(exports.noopShadowDOMStyles));
    class AdoptedStyleSheetsStyles {
        constructor(dom, localStyles, styleSheetCache, sharedStyles = null) {
            this.sharedStyles = sharedStyles;
            this.styleSheets = localStyles.map(x => {
                let sheet;
                if (x instanceof dom.CSSStyleSheet) {
                    sheet = x;
                }
                else {
                    sheet = styleSheetCache.get(x);
                    if (!sheet) {
                        sheet = new dom.CSSStyleSheet();
                        sheet.replaceSync(x);
                        styleSheetCache.set(x, sheet);
                    }
                }
                return sheet;
            });
        }
        static supported(dom) {
            return 'adoptedStyleSheets' in dom.ShadowRoot.prototype;
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
        constructor(dom, localStyles, sharedStyles = null) {
            this.dom = dom;
            this.localStyles = localStyles;
            this.sharedStyles = sharedStyles;
        }
        applyTo(shadowRoot) {
            const styles = this.localStyles;
            const dom = this.dom;
            for (let i = styles.length - 1; i > -1; --i) {
                const element = dom.createElement('style');
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