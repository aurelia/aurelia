import {
  BindingBehaviorExpression,
  IsBindingBehavior,
  ValueConverterExpression,
} from '@aurelia/expression-parser';

export function unwrapExpression(expression: IsBindingBehavior) {
  let unwrapped = false;
  while (expression instanceof BindingBehaviorExpression) {
    expression = expression.expression;
  }
  while (expression instanceof ValueConverterExpression) {
    expression = expression.expression;
    unwrapped = true;
  }
  return unwrapped ? expression : null;
}
