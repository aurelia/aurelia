import { DataAttributeObserver } from '../element-observation';
import { bindingBehavior } from '../binding-behavior';
import { Binding } from '../binding';
import { IScope } from '../binding-context';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  bind(binding: Binding, scope: IScope) {
    binding.targetObserver = new DataAttributeObserver(binding.target, binding.targetProperty);
  }

  unbind(binding: Binding, scope: IScope) {}
}
