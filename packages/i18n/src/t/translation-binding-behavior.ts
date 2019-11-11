import { bindingBehavior, IScope, IsValueConverter, LifecycleFlags, ValueConverterExpression, BindingBehaviorExpression } from '@aurelia/runtime';
import { BindingWithBehavior, ValueConverters } from '../utils';
import { Writable } from '@aurelia/kernel';

@bindingBehavior(ValueConverters.translationValueConverterName)
export class TranslationBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    const expression = binding.sourceExpression.expression;

    if (!(expression instanceof ValueConverterExpression)) {
      const vcExpression = new ValueConverterExpression(expression as IsValueConverter, ValueConverters.translationValueConverterName, binding.sourceExpression.args);
      (binding.sourceExpression as Writable<BindingBehaviorExpression>).expression = vcExpression;
    }
  }
}
