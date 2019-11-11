import { IScope, LifecycleFlags, PropertyBinding, bindingBehavior, IScheduler } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding): void {
    binding.targetObserver = new DataAttributeAccessor(
      binding.locator.get(IScheduler),
      flags,
      binding.target as HTMLElement,
      binding.targetProperty,
    );
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding): void {
    return;
  }
}
