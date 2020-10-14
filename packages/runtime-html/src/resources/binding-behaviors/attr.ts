import { LifecycleFlags, PropertyBinding, bindingBehavior, IScheduler } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';

import type { Scope } from '@aurelia/runtime';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: PropertyBinding): void {
    binding.targetObserver = new DataAttributeAccessor(
      binding.locator.get(IScheduler),
      flags,
      binding.target as HTMLElement,
      binding.targetProperty,
    );
  }

  public unbind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: PropertyBinding): void {
    return;
  }
}
