import { type Writable } from '@aurelia/kernel';
import { type BindingBehaviorExpression, type BindingBehaviorInstance, type IsValueConverter, ValueConverterExpression, type Scope } from '@aurelia/runtime';
import { BindingBehavior } from '@aurelia/runtime-html';
import { type BindingWithBehavior, ValueConverters } from '../utils';

export class TranslationBindingBehavior implements BindingBehaviorInstance {

  public bind(_scope: Scope, binding: BindingWithBehavior) {
    const expression = binding.ast.expression;

    if (!(expression instanceof ValueConverterExpression)) {
      const vcExpression = new ValueConverterExpression(expression as IsValueConverter, ValueConverters.translationValueConverterName, binding.ast.args);
      (binding.ast as Writable<BindingBehaviorExpression>).expression = vcExpression;
    }
  }
}
BindingBehavior.define(ValueConverters.translationValueConverterName, TranslationBindingBehavior);
