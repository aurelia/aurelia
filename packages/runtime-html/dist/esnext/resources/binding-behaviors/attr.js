import { BindingBehavior, ILifecycle } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';
export class AttrBindingBehavior {
    bind(flags, scope, binding) {
        binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), flags, binding.target, binding.targetProperty);
    }
    unbind(flags, scope, binding) {
        return;
    }
}
BindingBehavior.define('attr', AttrBindingBehavior);
//# sourceMappingURL=attr.js.map