import { Writable } from '@aurelia/kernel';
import { BindingBehaviorExpression, IsValueConverter, LifecycleFlags, ValueConverterExpression } from '@aurelia/runtime';
import { bindingBehavior } from '@aurelia/runtime-html';
import { BindingWithBehavior, ValueConverters } from '../utils';

import type { Scope } from '@aurelia/runtime';

@bindingBehavior(ValueConverters.translationValueConverterName)
export class TranslationBindingBehavior {

  public bind(flags: LifecycleFlags, _scope: Scope, binding: BindingWithBehavior) {
    const expression = binding.ast.expression;

    if (!(expression instanceof ValueConverterExpression)) {
      const vcExpression = new ValueConverterExpression(expression as IsValueConverter, ValueConverters.translationValueConverterName, binding.ast.args);
      (binding.ast as Writable<BindingBehaviorExpression>).expression = vcExpression;
    }
  }
}
