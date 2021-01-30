var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bindingBehavior } from '../../../../runtime/dist/native-modules/index.js';
import { createIntlFormatValueConverterExpression } from '../utils.js';
let NumberFormatBindingBehavior = class NumberFormatBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        createIntlFormatValueConverterExpression("nf" /* numberFormatValueConverterName */, binding);
    }
};
NumberFormatBindingBehavior = __decorate([
    bindingBehavior("nf" /* numberFormatValueConverterName */)
], NumberFormatBindingBehavior);
export { NumberFormatBindingBehavior };
//# sourceMappingURL=number-format-binding-behavior.js.map