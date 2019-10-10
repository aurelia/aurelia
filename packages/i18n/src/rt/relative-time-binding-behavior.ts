import { bindingBehavior, IScope, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils';

@bindingBehavior(ValueConverters.relativeTimeValueConverterName)
export class RelativeTimeBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.relativeTimeValueConverterName, binding);
  }
}
