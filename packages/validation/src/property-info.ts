import { IExpression, IScope } from '@aurelia/runtime';

// import {
//   AccessMember,
//   AccessScope,
//   AccessKeyed,
//   BindingBehavior,
//   Expression,
//   ValueConverter,
//   Scope,
//   getContextFor
// } from 'aurelia-binding';

// function getObject(expression: IExpression, objectExpression: IExpression, source: any): null | undefined | object {
//   const value = objectExpression.evaluate(source, null as any);
//   if (value === null || value === undefined || value instanceof Object) {
//     return value;
//   }
//   // tslint:disable-next-line:max-line-length
//   throw new Error(`The '${objectExpression}' part of '${expression}' evaluates to ${value} instead of an object, null or undefined.`);
// }

/**
 * Retrieves the object and property name for the specified expression.
 * @param expression The expression
 * @param source The scope
 */
export function getPropertyInfo(
  expression: IExpression,
  source: IScope
): { object: object; propertyName: string; } | null {
  // const originalExpression = expression;
  // while (expression instanceof BindingBehavior || expression instanceof ValueConverter) {
  //   expression = expression.expression;
  // }

  // let object: null | undefined | object;
  // let propertyName: string;
  // if (expression instanceof AccessScope) {
  //   object = getContextFor(expression.name, source, expression.ancestor);
  //   propertyName = expression.name;
  // } else if (expression instanceof AccessMember) {
  //   object = getObject(originalExpression, expression.object, source);
  //   propertyName = expression.name;
  // } else if (expression instanceof AccessKeyed) {
  //   object = getObject(originalExpression, expression.object, source);
  //   propertyName = expression.key.evaluate(source);
  // } else {
  //   throw new Error(`Expression '${originalExpression}' is not compatible with the validate binding-behavior.`);
  // }
  // if (object === null || object === undefined) {
  //   return null;
  // }
  // return { object, propertyName };
  return null;
}
