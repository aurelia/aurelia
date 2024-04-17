import { type Scope } from '@aurelia/runtime';
import { type BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters, behaviorTypeName } from '../utils';
import { type BindingBehaviorStaticAuDefinition, type BindingBehaviorInstance, } from '@aurelia/runtime-html';

export class NumberFormatBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: ValueConverters.numberFormatValueConverterName,
  };

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.numberFormatValueConverterName, binding);
  }
}
