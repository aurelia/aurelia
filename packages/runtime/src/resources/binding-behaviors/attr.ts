import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { DOM } from '../../dom';
import { IHTMLElement } from '../../dom.interfaces';
import { ILifecycle } from '../../lifecycle';
import { IScope, LifecycleFlags } from '../../observation';
import { DataAttributeAccessor } from '../../observation/target-accessors';
import { bindingBehavior } from '../binding-behavior';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeAccessor(binding.locator.get(DOM), binding.locator.get(ILifecycle), binding.target as IHTMLElement, binding.targetProperty);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    return;
  }
}
