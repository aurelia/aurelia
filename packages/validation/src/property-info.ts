import {
  AccessKeyed,
  AccessMember,
  AccessScope,
  BindingBehavior,
  BindingContext,
  IExpression,
  LifecycleFlags as LF,
  Scope,
  ValueConverter
} from '@aurelia/runtime';

function getObject(expression: IExpression, objectExpression: IExpression, scope: Scope): null | undefined | object {
  const value = objectExpression.evaluate(LF.none, scope, null);
  if (value === null || value === undefined || value instanceof Object) {
    return value as null | undefined | object;
  }
  // tslint:disable-next-line:max-line-length
  throw new Error(`The '${objectExpression}' part of '${expression}' evaluates to ${value} instead of an object, null or undefined.`);
}

/**
 * Retrieves the object and property name for the specified expression.
 * @param expression The expression
 * @param scope The scope
 */
export function getPropertyInfo(expression: IExpression, scope: Scope): { object: object; propertyName: string } | null {
  const originalExpression = expression;
  while (expression instanceof BindingBehavior || expression instanceof ValueConverter) {
    expression = expression.expression;
  }

  let object: null | undefined | object;
  let propertyName: string;
  if (expression instanceof AccessScope) {
    object = BindingContext.get(scope, expression.name, expression.ancestor, LF.none);
    propertyName = expression.name;
  } else if (expression instanceof AccessMember) {
    object = getObject(originalExpression, expression.object, scope);
    propertyName = expression.name;
  } else if (expression instanceof AccessKeyed) {
    object = getObject(originalExpression, expression.object, scope);
    propertyName = expression.key.evaluate(LF.none, scope, null) as string;
  } else {
    throw new Error(`Expression '${originalExpression}' is not compatible with the validate binding-behavior.`);
  }
  if (object === null || object === undefined) {
    return null;
  }
  return { object, propertyName };
}
