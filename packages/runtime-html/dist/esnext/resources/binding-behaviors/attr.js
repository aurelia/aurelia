import { __decorate } from "tslib";
import { ILifecycle, bindingBehavior } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';
let AttrBindingBehavior = class AttrBindingBehavior {
    bind(flags, scope, binding) {
        binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), flags, binding.target, binding.targetProperty);
    }
    unbind(flags, scope, binding) {
        return;
    }
};
AttrBindingBehavior = __decorate([
    bindingBehavior('attr')
], AttrBindingBehavior);
export { AttrBindingBehavior };
//# sourceMappingURL=attr.js.map