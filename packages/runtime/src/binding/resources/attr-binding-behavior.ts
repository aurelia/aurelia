import { DataAttributeObserver } from '../element-observation';
import { bindingBehavior } from '../binding-behavior';
import { Binding } from '../binding';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: Binding) {
    binding.targetObserver = new DataAttributeObserver(binding.target, binding.targetProperty);
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: Binding) {}
}
