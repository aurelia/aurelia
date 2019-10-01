import { __decorate, __param } from "tslib";
import { valueConverter } from '@aurelia/runtime';
import { I18N } from '../i18n';
let RelativeTimeValueConverter = class RelativeTimeValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */, "aurelia-relativetime-signal" /* RT_SIGNAL */];
    }
    toView(value, options, locale) {
        if (!(value instanceof Date)) {
            return value;
        }
        return this.i18n.rt(value, options, locale);
    }
};
RelativeTimeValueConverter = __decorate([
    valueConverter("rt" /* relativeTimeValueConverterName */),
    __param(0, I18N)
], RelativeTimeValueConverter);
export { RelativeTimeValueConverter };
//# sourceMappingURL=relative-time-value-converter.js.map