var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { valueConverter } from '../../../../runtime/dist/native-modules/index.js';
import { I18N } from '../i18n.js';
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