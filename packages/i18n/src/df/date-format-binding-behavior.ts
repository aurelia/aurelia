import { type BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters, behaviorTypeName } from '../utils';

import { type Scope, type BindingBehaviorStaticAuDefinition, type BindingBehaviorInstance, } from '@aurelia/runtime-html';

export class DateFormatBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: ValueConverters.dateFormatValueConverterName,
  };

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.dateFormatValueConverterName, binding);
  }
}
