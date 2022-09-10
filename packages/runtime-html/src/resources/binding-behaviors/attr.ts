import { LifecycleFlags } from '@aurelia/runtime';
import { attrAccessor } from '../../observation/data-attribute-accessor';
import { bindingBehavior } from '../binding-behavior';

import type { Scope } from '@aurelia/runtime';
import type { PropertyBinding } from '../../binding/property-binding';

export class AttrBindingBehavior {
  public bind(_flags: LifecycleFlags, _scope: Scope, binding: PropertyBinding): void {
    binding.targetObserver = attrAccessor;
  }

  public unbind(_flags: LifecycleFlags, _scope: Scope, _binding: PropertyBinding): void {
    return;
  }
}
bindingBehavior('attr')(AttrBindingBehavior);
