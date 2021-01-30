import { ValueConverterExpression } from '../../../runtime/dist/native-modules/index.js';
export var Signals;
(function (Signals) {
    Signals["I18N_EA_CHANNEL"] = "i18n:locale:changed";
    Signals["I18N_SIGNAL"] = "aurelia-translation-signal";
    Signals["RT_SIGNAL"] = "aurelia-relativetime-signal";
})(Signals || (Signals = {}));
export var ValueConverters;
(function (ValueConverters) {
    ValueConverters["translationValueConverterName"] = "t";
    ValueConverters["dateFormatValueConverterName"] = "df";
    ValueConverters["numberFormatValueConverterName"] = "nf";
    ValueConverters["relativeTimeValueConverterName"] = "rt";
})(ValueConverters || (ValueConverters = {}));
export function createIntlFormatValueConverterExpression(name, binding) {
    const expression = binding.sourceExpression.expression;
    if (!(expression instanceof ValueConverterExpression)) {
        const vcExpression = new ValueConverterExpression(expression, name, binding.sourceExpression.args);
        binding.sourceExpression.expression = vcExpression;
    }
}
//# sourceMappingURL=utils.js.map