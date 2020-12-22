"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntlFormatValueConverterExpression = exports.ValueConverters = exports.Signals = void 0;
const runtime_1 = require("@aurelia/runtime");
var Signals;
(function (Signals) {
    Signals["I18N_EA_CHANNEL"] = "i18n:locale:changed";
    Signals["I18N_SIGNAL"] = "aurelia-translation-signal";
    Signals["RT_SIGNAL"] = "aurelia-relativetime-signal";
})(Signals = exports.Signals || (exports.Signals = {}));
var ValueConverters;
(function (ValueConverters) {
    ValueConverters["translationValueConverterName"] = "t";
    ValueConverters["dateFormatValueConverterName"] = "df";
    ValueConverters["numberFormatValueConverterName"] = "nf";
    ValueConverters["relativeTimeValueConverterName"] = "rt";
})(ValueConverters = exports.ValueConverters || (exports.ValueConverters = {}));
function createIntlFormatValueConverterExpression(name, binding) {
    const expression = binding.sourceExpression.expression;
    if (!(expression instanceof runtime_1.ValueConverterExpression)) {
        const vcExpression = new runtime_1.ValueConverterExpression(expression, name, binding.sourceExpression.args);
        binding.sourceExpression.expression = vcExpression;
    }
}
exports.createIntlFormatValueConverterExpression = createIntlFormatValueConverterExpression;
//# sourceMappingURL=utils.js.map