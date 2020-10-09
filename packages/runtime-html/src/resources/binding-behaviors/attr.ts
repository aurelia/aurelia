import { IScope, LifecycleFlags, PropertyBinding, bindingBehavior, IScheduler } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, binding: PropertyBinding): void {
    binding.targetObserver = new DataAttributeAccessor(
      binding.locator.get(IScheduler),
      flags,
      binding.target as HTMLElement,
      binding.targetProperty,
    );
  }

  public unbind(flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, binding: PropertyBinding): void {
    return;
  }
}
