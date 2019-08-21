import * as tslib_1 from "tslib";
import { bindingBehavior, ValueConverterExpression } from '@aurelia/runtime';
let TranslationBindingBehavior = class TranslationBindingBehavior {
    bind(flags, scope, binding) {
        const expression = binding.sourceExpression.expression;
        if (!(expression instanceof ValueConverterExpression)) {
            const vcExpression = new ValueConverterExpression(expression, "t" /* translationValueConverterName */, binding.sourceExpression.args);
            binding.sourceExpression.expression = vcExpression;
        }
    }
};
TranslationBindingBehavior = tslib_1.__decorate([
    bindingBehavior("t" /* translationValueConverterName */)
], TranslationBindingBehavior);
export { TranslationBindingBehavior };
//# sourceMappingURL=translation-binding-behavior.js.map