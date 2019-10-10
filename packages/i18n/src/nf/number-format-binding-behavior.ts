import { bindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils';

@bindingBehavior(ValueConverters.numberFormatValueConverterName)
export class NumberFormatBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.numberFormatValueConverterName, binding);
  }
}
