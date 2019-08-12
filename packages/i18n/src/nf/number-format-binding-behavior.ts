import { bindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression } from '../utils';
import { numberFormatValueConverterName } from './number-format-value-converter';

@bindingBehavior(numberFormatValueConverterName)
export class NumberFormatBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(numberFormatValueConverterName, binding);
  }
}
