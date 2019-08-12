import { bindingBehavior, BindingType, ensureExpression, IExpressionParser, IScope, IsValueConverter, LifecycleFlags, ValueConverterExpression } from '@aurelia/runtime';
import i18next from 'i18next';
import { BindingWithBehavior } from '../utils';
import { translationValueConverterName } from './translation-value-converter';

@bindingBehavior(translationValueConverterName)
export class TranslationBindingBehavior {

  constructor(@IExpressionParser private readonly parser: IExpressionParser) { }

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithBehavior, options?: i18next.TOptions) {
    const expression = binding.sourceExpression.expression;

    if (!(expression instanceof ValueConverterExpression)) {
      const vcExpression = new ValueConverterExpression(expression as IsValueConverter, translationValueConverterName, binding.sourceExpression.args);
      binding.sourceExpression.expression = vcExpression;
    }
  }
}
