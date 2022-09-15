import { BindingBehaviorInstance } from '@aurelia/runtime';
import { attrAccessor } from '../../observation/data-attribute-accessor';
import { bindingBehavior } from '../binding-behavior';

import type { Scope } from '@aurelia/runtime';
import type { PropertyBinding } from '../../binding/property-binding';

export class AttrBindingBehavior implements BindingBehaviorInstance {
  public bind(_scope: Scope, binding: PropertyBinding): void {
    binding.targetObserver = attrAccessor;
  }

  public unbind(_scope: Scope, _binding: PropertyBinding): void {
    return;
  }
}
bindingBehavior('attr')(AttrBindingBehavior);
