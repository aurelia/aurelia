(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime", "./i18n-configuration-options", "./i18next-wrapper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const i18n_configuration_options_1 = require("./i18n-configuration-options");
    const i18next_wrapper_1 = require("./i18next-wrapper");
    exports.I18N = kernel_1.DI.createInterface('I18nService').noDefault();
    /**
     * Translation service class.
     * @export
     */
    let I18nService = class I18nService {
        constructor(i18nextWrapper, options, dom) {
            this.dom = dom;
            this.i18next = i18nextWrapper.i18next;
            this.task = new runtime_1.PromiseTask(this.initializeI18next(options), null, this);
        }
        tr(key, options) {
            return this.i18next.t(key, options);
        }
        updateValue(node, value, params) {
            if (this.task.done) {
                this.updateValueCore(node, value, params);
            }
            else {
                this.task = new runtime_1.ContinuationTask(this.task, this.updateValueCore, this, node, value, params);
            }
            return this.task;
        }
        updateValueCore(node, value, params) {
            if (!value) {
                return;
            }
            const keys = value.toString().split(';');
            let i = keys.length;
            while (i--) {
                const { attr, key } = this.extractAttributesFromKey(node, keys[i]);
                this.applyTranslations(node, attr.split(','), key, params);
            }
        }
        extractAttributesFromKey(node, key) {
            const re = /\[([a-z\-, ]*)\]/ig;
            // set default attribute to src if this is an image node
            let attr = node.nodeName === 'IMG' ? 'src' : 'text';
            // check if a attribute was specified in the key
            const matches = re.exec(key);
            if (matches) {
                key = key.replace(matches[0], '');
                attr = matches[1];
            }
            return { attr, key };
        }
        applyTranslations(node, attrs, key, params) {
            let j = attrs.length;
            while (j--) {
                // handle various attributes
                // anything other than text,prepend,append or html will be added as an attribute on the element.
                switch (attrs[j].trim()) {
                    case 'text':
                        node.textContent = this.tr(key, params);
                        break;
                    default:
                        break;
                }
            }
        }
        async initializeI18next(options) {
            const defaultOptions = {
                lng: 'en',
                fallbackLng: ['en'],
                debug: false,
                plugins: [],
                attributes: ['t', 'i18n'],
                skipTranslationOnMissingKey: false,
            };
            this.options = { ...defaultOptions, ...options };
            for (const plugin of this.options.plugins) {
                this.i18next.use(plugin);
            }
            await this.i18next.init(this.options);
        }
    };
    I18nService = tslib_1.__decorate([
        tslib_1.__param(0, i18next_wrapper_1.I18nWrapper),
        tslib_1.__param(1, i18n_configuration_options_1.I18nConfigurationOptions),
        tslib_1.__param(2, runtime_1.IDOM)
    ], I18nService);
    exports.I18nService = I18nService;
});
//# sourceMappingURL=i18n.js.map