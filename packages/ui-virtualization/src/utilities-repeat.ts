import {
  type IsBindingBehavior,
} from '@aurelia/expression-parser';

export function unwrapExpression(expression: IsBindingBehavior) {
  let unwrapped = false;
  let current: IsBindingBehavior | undefined = expression;
  while (current.$kind === 'BindingBehavior') {
    current = current.expression as IsBindingBehavior;
  }
  while (current?.$kind === 'ValueConverter') {
    current = current.expression as IsBindingBehavior;
    unwrapped = true;
  }
  return unwrapped ? current ?? null : null;
}
