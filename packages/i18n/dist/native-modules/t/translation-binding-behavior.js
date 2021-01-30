var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bindingBehavior, ValueConverterExpression } from '../../../../runtime-html/dist/native-modules/index.js';
let TranslationBindingBehavior = class TranslationBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        const expression = binding.sourceExpression.expression;
        if (!(expression instanceof ValueConverterExpression)) {
            const vcExpression = new ValueConverterExpression(expression, "t" /* translationValueConverterName */, binding.sourceExpression.args);
            binding.sourceExpression.expression = vcExpression;
        }
    }
};
TranslationBindingBehavior = __decorate([
    bindingBehavior("t" /* translationValueConverterName */)
], TranslationBindingBehavior);
export { TranslationBindingBehavior };
//# sourceMappingURL=translation-binding-behavior.js.map