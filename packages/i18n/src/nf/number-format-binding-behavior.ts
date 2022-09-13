import { LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils';

import type { Scope } from '@aurelia/runtime';
import { bindingBehavior } from '@aurelia/runtime-html';

@bindingBehavior(ValueConverters.numberFormatValueConverterName)
export class NumberFormatBindingBehavior {

  public bind(flags: LifecycleFlags, _scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.numberFormatValueConverterName, binding);
  }
}
