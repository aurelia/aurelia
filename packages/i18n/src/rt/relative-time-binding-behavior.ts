import { type BindingBehaviorInstance, type Scope } from '@aurelia/runtime';
import { type BindingWithBehavior, createIntlFormatValueConverterExpression, ValueConverters, behaviorTypeName } from '../utils';

import { type BindingBehaviorStaticAuDefinition } from '@aurelia/runtime-html';

export class RelativeTimeBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: ValueConverters.relativeTimeValueConverterName,
  };

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    createIntlFormatValueConverterExpression(ValueConverters.relativeTimeValueConverterName, binding);
  }
}
