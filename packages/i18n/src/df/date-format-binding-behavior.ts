import { type Scope } from '@aurelia/runtime';
import { type BindingBehaviorStaticAuDefinition, type BindingBehaviorInstance, } from '@aurelia/runtime-html';
import { type BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters, behaviorTypeName } from '../utils';

export class DateFormatBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: ValueConverters.dateFormatValueConverterName,
  };

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.dateFormatValueConverterName, binding);
  }
}
