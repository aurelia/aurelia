var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { valueConverter } from '@aurelia/runtime';
import { I18N } from '../i18n';
let TranslationValueConverter = /** @class */ (() => {
    let TranslationValueConverter = class TranslationValueConverter {
        constructor(i18n) {
            this.i18n = i18n;
            this.signals = ["aurelia-translation-signal" /* I18N_SIGNAL */];
        }
        toView(value, options) {
            return this.i18n.tr(value, options);
        }
    };
    TranslationValueConverter = __decorate([
        valueConverter("t" /* translationValueConverterName */),
        __param(0, I18N),
        __metadata("design:paramtypes", [Object])
    ], TranslationValueConverter);
    return TranslationValueConverter;
})();
export { TranslationValueConverter };
//# sourceMappingURL=translation-value-converter.js.map