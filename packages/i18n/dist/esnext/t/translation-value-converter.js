import * as tslib_1 from "tslib";
import { valueConverter } from '@aurelia/runtime';
import { I18N } from '../i18n';
let TranslationValueConverter = class TranslationValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
    }
    toView(value, options) {
        return this.i18n.tr(value, options);
    }
};
TranslationValueConverter = tslib_1.__decorate([
    valueConverter("t" /* translationValueConverterName */),
    tslib_1.__param(0, I18N)
], TranslationValueConverter);
export { TranslationValueConverter };
//# sourceMappingURL=translation-value-converter.js.map