var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IContainer, Registration, DI, noop } from '@aurelia/kernel';
import { AppTask } from '../app-task.js';
import { INode } from '../dom.js';
import { getClassesToAdd } from '../observation/class-attribute-accessor.js';
import { IPlatform } from '../platform.js';
import { CustomAttribute } from '../resources/custom-attribute.js';
export function cssModules(...modules) {
    return new CSSModulesProcessorRegistry(modules);
}
export class CSSModulesProcessorRegistry {
    constructor(modules) {
        this.modules = modules;
    }
    register(container) {
        var _a;
        const classLookup = Object.assign({}, ...this.modules);
        const ClassCustomAttribute = CustomAttribute.define({
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
                    this.element.className = getClassesToAdd(this.value).map(x => classLookup[x] || x).join(' ');
                }
            },
            _a.inject = [INode],
            _a));
        container.register(ClassCustomAttribute);
    }
}
export function shadowCSS(...css) {
    return new ShadowDOMRegistry(css);
}
export const IShadowDOMStyleFactory = DI.createInterface('IShadowDOMStyleFactory', x => x.cachedCallback(handler => {
    if (AdoptedStyleSheetsStyles.supported(handler.get(IPlatform))) {
        return handler.get(AdoptedStyleSheetsStylesFactory);
    }
    return handler.get(StyleElementStylesFactory);
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
}
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
    __param(0, IPlatform)
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
    __param(0, IPlatform)
], StyleElementStylesFactory);
export const IShadowDOMStyles = DI.createInterface('IShadowDOMStyles');
export const IShadowDOMGlobalStyles = DI.createInterface('IShadowDOMGlobalStyles', x => x.instance({ applyTo: noop }));
export class AdoptedStyleSheetsStyles {
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
export class StyleElementStyles {
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
export const StyleConfiguration = {
    shadowDOM(config) {
        return AppTask.with(IContainer).beforeCreate().call(container => {
            if (config.sharedStyles != null) {
                const factory = container.get(IShadowDOMStyleFactory);
                container.register(Registration.instance(IShadowDOMGlobalStyles, factory.createStyles(config.sharedStyles, null)));
            }
        });
    }
};
//# sourceMappingURL=styles.js.map