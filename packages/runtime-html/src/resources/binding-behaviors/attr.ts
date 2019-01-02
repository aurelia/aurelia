import { IRegistry } from '@aurelia/kernel';
import { Binding, BindingBehaviorResource, ILifecycle, IScope, LifecycleFlags } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../../observation/data-attribute-accessor';

export class AttrBindingBehavior {
  public static readonly register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), binding.target as HTMLElement, binding.targetProperty);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    return;
  }
}
BindingBehaviorResource.define('attr', AttrBindingBehavior);
