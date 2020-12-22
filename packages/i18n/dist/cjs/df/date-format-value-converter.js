"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormatValueConverter = void 0;
const runtime_1 = require("@aurelia/runtime");
const i18n_js_1 = require("../i18n.js");
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
    runtime_1.valueConverter("df" /* dateFormatValueConverterName */),
    __param(0, i18n_js_1.I18N)
], DateFormatValueConverter);
exports.DateFormatValueConverter = DateFormatValueConverter;
//# sourceMappingURL=date-format-value-converter.js.map