import { bindingBehavior, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils.js';

import type { Scope } from '@aurelia/runtime';

@bindingBehavior(ValueConverters.dateFormatValueConverterName)
export class DateFormatBindingBehavior {

  public bind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.dateFormatValueConverterName, binding);
  }
}
