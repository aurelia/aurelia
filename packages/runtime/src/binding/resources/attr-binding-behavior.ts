import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { IChangeSet } from '../change-set';
import { DataAttributeObserver } from '../element-observation';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeObserver(binding.locator.get(IChangeSet), binding.target, binding.targetProperty);
  }

  // tslint:disable-next-line:no-empty
  public unbind(flags: BindingFlags, scope: IScope, binding: Binding): void { }
}
