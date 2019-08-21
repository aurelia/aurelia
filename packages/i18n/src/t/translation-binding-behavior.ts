import { bindingBehavior, IScope, IsValueConverter, LifecycleFlags, ValueConverterExpression } from '@aurelia/runtime';
import { BindingWithBehavior, ValueConverters } from '../utils';

@bindingBehavior(ValueConverters.translationValueConverterName)
export class TranslationBindingBehavior {

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior) {
    const expression = binding.sourceExpression.expression;

    if (!(expression instanceof ValueConverterExpression)) {
      const vcExpression = new ValueConverterExpression(expression as IsValueConverter, ValueConverters.translationValueConverterName, binding.sourceExpression.args);
      binding.sourceExpression.expression = vcExpression;
    }
  }
}
