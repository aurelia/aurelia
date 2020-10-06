import { bindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils';

@bindingBehavior(ValueConverters.dateFormatValueConverterName)
export class DateFormatBindingBehavior {

  public bind(flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.dateFormatValueConverterName, binding);
  }
}
