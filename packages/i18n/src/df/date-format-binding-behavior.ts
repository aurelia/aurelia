import { bindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression } from '../utils';
import { dateFormatValueConverterName } from './date-format-value-converter';

@bindingBehavior(dateFormatValueConverterName)
export class DateFormatBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(dateFormatValueConverterName, binding);
  }
}
