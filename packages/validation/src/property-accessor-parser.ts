import {
  Parser,
  AccessMember,
  AccessScope
} from 'aurelia-binding';
import { isString, isNumber } from './util';

export type PropertyAccessor<TObject, TValue> = (object: TObject) => TValue;

export class PropertyAccessorParser {
  public static inject = [Parser];

  constructor(private parser: Parser) { }

  public parse<TObject, TValue>(property: string | number | PropertyAccessor<TObject, TValue>): string | number {
    if (isString(property) || isNumber(property)) {
      return property as string | number;
    }
    const accessorText = getAccessorExpression(property.toString());
    const accessor = this.parser.parse(accessorText);
    if (accessor instanceof AccessScope
      || accessor instanceof AccessMember && accessor.object instanceof AccessScope) {
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
