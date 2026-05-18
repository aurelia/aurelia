import {
  type IsBindingBehavior,
} from '@aurelia/expression-parser';

/**
 * @internal
 */
export function unwrapExpression(expression: IsBindingBehavior) {
  let unwrapped = false;
  let current: IsBindingBehavior | undefined = expression;
  while (current.$kind === 'BindingBehavior') {
    current = current.expression;
  }
  while (current?.$kind === 'ValueConverter') {
    current = current.expression;
    unwrapped = true;
  }
  return unwrapped ? current ?? null : null;
}
