import { __decorate, __param } from "tslib";
import { valueConverter } from '@aurelia/runtime';
import { I18N } from '../i18n';
let DateFormatValueConverter = class DateFormatValueConverter {
    constructor(i18n) {
        this.i18n = i18n;
        this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
    }
    toView(value, options, locale) {
        if ((!value && value !== 0) || (typeof value === 'string' && value.trim() === '')) {
            return value;
        }
        // convert '0' to 01/01/1970 or ISO string to Date and return the original value if invalid date is constructed
        if (typeof value === 'string') {
            const numValue = Number(value);
            const tempDate = new Date(Number.isInteger(numValue) ? numValue : value);
            if (isNaN(tempDate.getTime())) {
                return value;
            }
            value = tempDate;
        }
        return this.i18n.df(value, options, locale);
    }
};
DateFormatValueConverter = __decorate([
    valueConverter("df" /* dateFormatValueConverterName */),
    __param(0, I18N)
], DateFormatValueConverter);
export { DateFormatValueConverter };
//# sourceMappingURL=date-format-value-converter.js.map