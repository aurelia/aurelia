(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
});
//# sourceMappingURL=utils.js.map