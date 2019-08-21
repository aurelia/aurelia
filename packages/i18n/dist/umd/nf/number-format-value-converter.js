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
    let NumberFormatValueConverter = class NumberFormatValueConverter {
        constructor(i18n) {
            this.i18n = i18n;
            this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
        }
        toView(value, options, locale) {
            if (typeof value !== 'number') {
                return value;
            }
            return this.i18n.nf(value, options, locale);
        }
    };
    NumberFormatValueConverter = tslib_1.__decorate([
        runtime_1.valueConverter("nf" /* numberFormatValueConverterName */),
        tslib_1.__param(0, i18n_1.I18N)
    ], NumberFormatValueConverter);
    exports.NumberFormatValueConverter = NumberFormatValueConverter;
});
//# sourceMappingURL=number-format-value-converter.js.map