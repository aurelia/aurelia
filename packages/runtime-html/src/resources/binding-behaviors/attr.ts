import { IRegistry } from '@aurelia/kernel';
import { PropertyBinding, BindingBehavior, ILifecycle, IScope, LifecycleFlags } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';

export class AttrBindingBehavior {
  public static readonly register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding): void {
    binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), binding.target as HTMLElement, binding.targetProperty);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding): void {
    return;
  }
}
BindingBehavior.define('attr', AttrBindingBehavior);
