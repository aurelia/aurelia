(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "../dom", "./css-modules-registry", "./shadow-dom-registry", "./shadow-dom-styles"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const dom_1 = require("../dom");
    const css_modules_registry_1 = require("./css-modules-registry");
    const shadow_dom_registry_1 = require("./shadow-dom-registry");
    const shadow_dom_styles_1 = require("./shadow-dom-styles");
    const ext = '.css';
    function styles(...styles) {
        return kernel_1.Registration.defer(ext, ...styles);
    }
    exports.styles = styles;
    exports.StyleConfiguration = {
        cssModulesProcessor() {
            return {
                register(container) {
                    container.register(kernel_1.Registration.singleton(ext, css_modules_registry_1.CSSModulesProcessorRegistry));
                }
            };
        },
        shadowDOM(config) {
            return runtime_1.StartTask.with(kernel_1.IContainer).beforeCreate().call(container => {
                const dom = container.get(dom_1.HTMLDOM);
                let createStyles;
                if (shadow_dom_styles_1.AdoptedStyleSheetsStyles.supported(dom)) {
                    const styleSheetCache = new Map();
                    createStyles = (localStyles, sharedStyles) => {
                        return new shadow_dom_styles_1.AdoptedStyleSheetsStyles(dom, localStyles, styleSheetCache, sharedStyles);
                    };
                }
                else {
                    createStyles = (localStyles, sharedStyles) => {
                        if (localStyles.find(x => typeof x !== 'string')) {
                            // TODO: use reporter
                            throw new Error('Shadow DOM CSS must be a string.');
                        }
                        return new shadow_dom_styles_1.StyleElementStyles(dom, localStyles, sharedStyles);
                    };
                }
                let globalStyles;
                if (config && config.sharedStyles) {
                    globalStyles = createStyles(config.sharedStyles, null);
                }
                else {
                    globalStyles = shadow_dom_styles_1.noopShadowDOMStyles;
                }
                container.register(kernel_1.Registration.instance(shadow_dom_styles_1.IShadowDOMGlobalStyles, globalStyles));
                container.register(kernel_1.Registration.instance(ext, new shadow_dom_registry_1.ShadowDOMRegistry(globalStyles, createStyles)));
            });
        }
    };
});
//# sourceMappingURL=style-configuration.js.map