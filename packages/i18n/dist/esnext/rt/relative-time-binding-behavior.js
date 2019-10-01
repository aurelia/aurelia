import { __decorate } from "tslib";
import { bindingBehavior } from '@aurelia/runtime';
import { createIntlFormatValueConverterExpression } from '../utils';
let RelativeTimeBindingBehavior = class RelativeTimeBindingBehavior {
    bind(flags, scope, binding) {
        createIntlFormatValueConverterExpression("rt" /* relativeTimeValueConverterName */, binding);
    }
};
RelativeTimeBindingBehavior = __decorate([
    bindingBehavior("rt" /* relativeTimeValueConverterName */)
], RelativeTimeBindingBehavior);
export { RelativeTimeBindingBehavior };
//# sourceMappingURL=relative-time-binding-behavior.js.map