import { BindingBehaviorExpression, IBinding, IsValueConverter, ValueConverterExpression } from '@aurelia/runtime';

export type BindingWithBehavior = IBinding & {
  sourceExpression: BindingBehaviorExpression;
};

export function createIntlFormatValueConverterExpression(name: string, binding: BindingWithBehavior) {

  const expression = binding.sourceExpression.expression;

  if (!(expression instanceof ValueConverterExpression)) {
    const vcExpression = new ValueConverterExpression(expression as IsValueConverter, name, binding.sourceExpression.args);
    binding.sourceExpression.expression = vcExpression;
  }
}
