import { IExpressionParser, BindingType, AccessScopeExpression, AccessMemberExpression } from '@aurelia/runtime';
export type PropertyAccessor<TObject, TValue> = (object: TObject) => TValue;

export class PropertyAccessorParser {

  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
  ) { }

  public parse<TObject, TValue>(property: string | number | PropertyAccessor<TObject, TValue>): string | number {
    if (typeof property === 'string' || typeof property === 'number') {
      return property;
    }
    const accessorText = getAccessorExpression(property.toString());
    const accessor = this.parser.parse(accessorText, BindingType.None);
    if (accessor instanceof AccessScopeExpression
      || accessor instanceof AccessMemberExpression && accessor.object instanceof AccessScopeExpression) {
      return accessor.name;
    }
    throw new Error(`Invalid property expression: "${accessor}"`);
  }
}

export function getAccessorExpression(fn: string): string {
  /* tslint:disable:max-line-length */
  const classic = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*"use strict";)?\s*(?:[$_\w\d.['"\]+;]+)?\s*return\s+[$_\w\d]+\.([$_\w\d]+)\s*;?\s*\}$/;
  /* tslint:enable:max-line-length */
  const arrow = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+\.([$_\w\d]+)$/;
  const match = classic.exec(fn) || arrow.exec(fn);
  if (match === null) {
    throw new Error(`Unable to parse accessor function:\n${fn}`);
  }
  return match[1];
}
