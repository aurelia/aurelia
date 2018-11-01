import { BindingFlags, IScope } from '../../observation';
import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { DataAttributeAccessor } from '../target-accessors';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeAccessor(binding.target, binding.targetProperty);
  }

  // tslint:disable-next-line:no-empty
  public unbind(flags: BindingFlags, scope: IScope, binding: Binding): void { }
}
