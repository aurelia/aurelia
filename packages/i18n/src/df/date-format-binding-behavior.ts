import { type BindingBehaviorInstance } from '@aurelia/runtime';
import { type BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters } from '../utils';

import type { Scope } from '@aurelia/runtime';
import { bindingBehavior } from '@aurelia/runtime-html';

@bindingBehavior(ValueConverters.dateFormatValueConverterName)
export class DateFormatBindingBehavior implements BindingBehaviorInstance {

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.dateFormatValueConverterName, binding);
  }
}
