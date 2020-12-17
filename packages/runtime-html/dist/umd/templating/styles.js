var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
        define(["require", "exports", "@aurelia/kernel", "../app-task.js", "../dom.js", "../observation/class-attribute-accessor.js", "../platform.js", "../resources/custom-attribute.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StyleConfiguration = exports.StyleElementStyles = exports.AdoptedStyleSheetsStyles = exports.IShadowDOMGlobalStyles = exports.IShadowDOMStyles = exports.ShadowDOMRegistry = exports.IShadowDOMStyleFactory = exports.shadowCSS = exports.CSSModulesProcessorRegistry = exports.cssModules = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const app_task_js_1 = require("../app-task.js");
    const dom_js_1 = require("../dom.js");
    const class_attribute_accessor_js_1 = require("../observation/class-attribute-accessor.js");
    const platform_js_1 = require("../platform.js");
    const custom_attribute_js_1 = require("../resources/custom-attribute.js");
    function cssModules(...modules) {
        return new CSSModulesProcessorRegistry(modules);
    }
    exports.cssModules = cssModules;
    class CSSModulesProcessorRegistry {
        constructor(modules) {
            this.modules = modules;
        }
        register(container) {
            var _a;
            const classLookup = Object.assign({}, ...this.modules);
            const ClassCustomAttribute = custom_attribute_js_1.CustomAttribute.define({
                name: 'class',
                bindables: ['value'],
            }, (_a = class CustomAttributeClass {
                    constructor(element) {
                        this.element = element;
                    }
                    binding() {
                        this.valueChanged();
                    }
                    valueChanged() {
                        if (!this.value) {
                            this.element.className = '';
                            return;
                        }
                        this.element.className = class_attribute_accessor_js_1.getClassesToAdd(this.value).map(x => classLookup[x] || x).join(' ');
                    }
                },
                _a.inject = [dom_js_1.INode],
                _a));
            container.register(ClassCustomAttribute);
        }
    }
    exports.CSSModulesProcessorRegistry = CSSModulesProcessorRegistry;
    function shadowCSS(...css) {
        return new ShadowDOMRegistry(css);
    }
    exports.shadowCSS = shadowCSS;
    exports.IShadowDOMStyleFactory = kernel_1.DI.createInterface('IShadowDOMStyleFactory', x => x.cachedCallback(handler => {
        if (AdoptedStyleSheetsStyles.supported(handler.get(platform_js_1.IPlatform))) {
            return handler.get(AdoptedStyleSheetsStylesFactory);
        }
        return handler.get(StyleElementStylesFactory);
    }));
    class ShadowDOMRegistry {
        constructor(css) {
            this.css = css;
        }
        register(container) {
            const sharedStyles = container.get(exports.IShadowDOMGlobalStyles);
            const factory = container.get(exports.IShadowDOMStyleFactory);
            container.register(kernel_1.Registration.instance(exports.IShadowDOMStyles, factory.createStyles(this.css, sharedStyles)));
        }
    }
    exports.ShadowDOMRegistry = ShadowDOMRegistry;
    let AdoptedStyleSheetsStylesFactory = class AdoptedStyleSheetsStylesFactory {
        constructor(p) {
            this.p = p;
            this.cache = new Map();
        }
        createStyles(localStyles, sharedStyles) {
            return new AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
        }
    };
    AdoptedStyleSheetsStylesFactory = __decorate([
        __param(0, platform_js_1.IPlatform)
    ], AdoptedStyleSheetsStylesFactory);
    let StyleElementStylesFactory = class StyleElementStylesFactory {
        constructor(p) {
            this.p = p;
        }
        createStyles(localStyles, sharedStyles) {
            return new StyleElementStyles(this.p, localStyles, sharedStyles);
        }
    };
    StyleElementStylesFactory = __decorate([
        __param(0, platform_js_1.IPlatform)
    ], StyleElementStylesFactory);
    exports.IShadowDOMStyles = kernel_1.DI.createInterface('IShadowDOMStyles');
    exports.IShadowDOMGlobalStyles = kernel_1.DI.createInterface('IShadowDOMGlobalStyles', x => x.instance({ applyTo: kernel_1.noop }));
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
                    if (sheet === void 0) {
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
    exports.StyleConfiguration = {
        shadowDOM(config) {
            return app_task_js_1.AppTask.with(kernel_1.IContainer).beforeCreate().call(container => {
                if (config.sharedStyles != null) {
                    const factory = container.get(exports.IShadowDOMStyleFactory);
                    container.register(kernel_1.Registration.instance(exports.IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
                }
            });
        }
    };
});
//# sourceMappingURL=styles.js.map