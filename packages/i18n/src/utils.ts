import { BindingBehaviorExpression, IBinding, IsValueConverter, ValueConverterExpression } from '@aurelia/runtime';
import { Writable } from '@aurelia/kernel';

export const enum Signals {
  I18N_EA_CHANNEL = 'i18n:locale:changed',
  I18N_SIGNAL = 'aurelia-translation-signal',
  RT_SIGNAL = 'aurelia-relativetime-signal'
}

export const enum ValueConverters {
  translationValueConverterName = 't',
  dateFormatValueConverterName = 'df',
  numberFormatValueConverterName = 'nf',
  relativeTimeValueConverterName = 'rt'
}

export type BindingWithBehavior = IBinding & {
  sourceExpression: BindingBehaviorExpression;
};

export function createIntlFormatValueConverterExpression(name: string, binding: BindingWithBehavior) {

  const expression = binding.sourceExpression.expression;

  if (!(expression instanceof ValueConverterExpression)) {
    const vcExpression = new ValueConverterExpression(expression as IsValueConverter, name, binding.sourceExpression.args);
    (binding.sourceExpression as Writable<BindingBehaviorExpression>).expression = vcExpression;
  }
}
