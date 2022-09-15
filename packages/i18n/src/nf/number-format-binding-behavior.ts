import { type BindingBehaviorInstance } from '@aurelia/runtime';
import { type BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils';

import type { Scope } from '@aurelia/runtime';
import { bindingBehavior } from '@aurelia/runtime-html';

@bindingBehavior(ValueConverters.numberFormatValueConverterName)
export class NumberFormatBindingBehavior implements BindingBehaviorInstance {

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.numberFormatValueConverterName, binding);
  }
}
