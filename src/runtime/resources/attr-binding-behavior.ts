import { DataAttributeObserver } from '../binding/element-observation';
import { bindingBehavior } from '../templating/binding-behavior';
import { Binding } from '../binding/binding';
import { IScope } from '../binding/binding-context';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  bind(binding: Binding, scope: IScope) {
    binding.targetObserver = new DataAttributeObserver(binding.target, binding.targetProperty);
  }

  unbind(binding: Binding, scope: IScope) {}
}
