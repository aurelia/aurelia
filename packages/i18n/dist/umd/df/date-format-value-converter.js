(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "../i18n"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const i18n_1 = require("../i18n");
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
    DateFormatValueConverter = tslib_1.__decorate([
        runtime_1.valueConverter("df" /* dateFormatValueConverterName */),
        tslib_1.__param(0, i18n_1.I18N)
    ], DateFormatValueConverter);
    exports.DateFormatValueConverter = DateFormatValueConverter;
});
//# sourceMappingURL=date-format-value-converter.js.map