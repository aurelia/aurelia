import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { DataAttributeObserver } from '../element-observation';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: Binding) {
    binding.targetObserver = new DataAttributeObserver(binding.target, binding.targetProperty);
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: Binding) {}
}
