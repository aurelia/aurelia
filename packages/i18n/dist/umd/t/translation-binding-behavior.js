(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    let TranslationBindingBehavior = class TranslationBindingBehavior {
        bind(flags, scope, binding) {
            const expression = binding.sourceExpression.expression;
            if (!(expression instanceof runtime_1.ValueConverterExpression)) {
                const vcExpression = new runtime_1.ValueConverterExpression(expression, "t" /* translationValueConverterName */, binding.sourceExpression.args);
                binding.sourceExpression.expression = vcExpression;
            }
        }
    };
    TranslationBindingBehavior = tslib_1.__decorate([
        runtime_1.bindingBehavior("t" /* translationValueConverterName */)
    ], TranslationBindingBehavior);
    exports.TranslationBindingBehavior = TranslationBindingBehavior;
});
//# sourceMappingURL=translation-binding-behavior.js.map