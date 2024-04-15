import { type Writable } from '@aurelia/kernel';
import { type BindingBehaviorInstance, type Scope } from '@aurelia/runtime';
import { BindingBehavior } from '@aurelia/runtime-html';
import { type BindingWithBehavior, ValueConverters } from '../utils';
import { type BindingBehaviorExpression, IsValueConverter, ValueConverterExpression } from '@aurelia/expression-parser';

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
