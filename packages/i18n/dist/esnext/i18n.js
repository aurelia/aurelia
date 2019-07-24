import * as tslib_1 from "tslib";
import { DI } from '@aurelia/kernel';
import { ContinuationTask, IDOM, PromiseTask } from '@aurelia/runtime';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nWrapper } from './i18next-wrapper';
export const I18N = DI.createInterface('I18nService').noDefault();
/**
 * Translation service class.
 * @export
 */
let I18nService = class I18nService {
    constructor(i18nextWrapper, options, dom) {
        this.dom = dom;
        this.i18next = i18nextWrapper.i18next;
        this.task = new PromiseTask(this.initializeI18next(options), null, this);
    }
    tr(key, options) {
        return this.i18next.t(key, options);
    }
    updateValue(node, value, params) {
        if (this.task.done) {
            this.updateValueCore(node, value, params);
        }
        else {
            this.task = new ContinuationTask(this.task, this.updateValueCore, this, node, value, params);
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
    tslib_1.__param(0, I18nWrapper),
    tslib_1.__param(1, I18nConfigurationOptions),
    tslib_1.__param(2, IDOM)
], I18nService);
export { I18nService };
//# sourceMappingURL=i18n.js.map