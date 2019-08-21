import * as tslib_1 from "tslib";
import { bindingBehavior } from '@aurelia/runtime';
import { createIntlFormatValueConverterExpression } from '../utils';
let NumberFormatBindingBehavior = class NumberFormatBindingBehavior {
    bind(flags, scope, binding) {
        createIntlFormatValueConverterExpression("nf" /* numberFormatValueConverterName */, binding);
    }
};
NumberFormatBindingBehavior = tslib_1.__decorate([
    bindingBehavior("nf" /* numberFormatValueConverterName */)
], NumberFormatBindingBehavior);
export { NumberFormatBindingBehavior };
//# sourceMappingURL=number-format-binding-behavior.js.map