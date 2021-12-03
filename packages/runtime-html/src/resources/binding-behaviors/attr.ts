import { LifecycleFlags, bindingBehavior } from '@aurelia/runtime';
import { attrAccessor } from '../../observation/data-attribute-accessor';

import type { Scope } from '@aurelia/runtime';
import type { PropertyBinding } from '../../binding/property-binding';

export class AttrBindingBehavior {
  public bind(flags: LifecycleFlags, _scope: Scope, binding: PropertyBinding): void {
    binding.targetObserver = attrAccessor;
  }

  public unbind(flags: LifecycleFlags, _scope: Scope, binding: PropertyBinding): void {
    return;
  }
}
bindingBehavior('attr')(AttrBindingBehavior);
