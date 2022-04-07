import { bindingBehavior, LifecycleFlags } from '@aurelia/runtime';
import { BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils.js';

import type { Scope } from '@aurelia/runtime';

@bindingBehavior(ValueConverters.relativeTimeValueConverterName)
export class RelativeTimeBindingBehavior {

  public bind(flags: LifecycleFlags, _scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.relativeTimeValueConverterName, binding);
  }
}
