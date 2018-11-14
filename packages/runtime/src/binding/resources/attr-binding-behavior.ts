import { ILifecycle } from '../../lifecycle';
import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { DataAttributeAccessor } from '../target-accessors';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), binding.target, binding.targetProperty);
  }

  // tslint:disable-next-line:no-empty
  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void { }
}
