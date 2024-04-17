import { type BindingBehaviorInstance, type BindingBehaviorStaticAuDefinition, type Scope } from '@aurelia/runtime-html';
import { ValueConverters, behaviorTypeName, createIntlFormatValueConverterExpression, type BindingWithBehavior } from '../utils';

export class RelativeTimeBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: ValueConverters.relativeTimeValueConverterName,
  };

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.relativeTimeValueConverterName, binding);
  }
}
