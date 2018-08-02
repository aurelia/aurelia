import { IServiceLocator } from '@aurelia/kernel';
import { BindingFlags, IBinding, IExpression, IScope, IExpressionParser } from '@aurelia/runtime';
import { AttributeName, BindingType } from './attribute-name-parser';
import { parse, ParserState } from '../binding/expression-parser';

export type AttributeValue = IExpression | Interpolation;

// Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
// so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction, just in case
// but this class might be a candidate for removal if it turns out it does provide all we need
export class Interpolation {
  constructor(public parts: string[], public expressions: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const length = expressions.length;
    const parts = this.parts;

    let result = parts[0];
    let i = 0;
    while (i < length) {
      result += expressions[i].evaluate(flags, scope, locator);
      result += parts[i + 1];
      i++;
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const expressions = this.expressions;
    const length = expressions.length;

    let i = 0;
    while (i < length) {
      expressions[i].connect(flags, scope, binding);
      i++;
    }
  }
}

const enum Char {
  Dollar     = 0x24,
  OpenBrace  = 0x7B,
  CloseBrace = 0x7D
}


export function parseAttributeValue(value: string, $type: BindingType, exprParser: IExpressionParser): AttributeValue {
  if ($type & BindingType.IsPlain) {
    return parseInterpolation(value, $type, exprParser);
  }
  return exprParser.parse(value);
}

function parseInterpolation(value: string, $type: BindingType, exprParser: IExpressionParser): any {// AttributeValue {
  const len = value.length;
  const parts = [];
  const expressions = [];
  let prev = 0;
  let i = 0;
  while (i < len) {
    if (value.charCodeAt(i) === Char.Dollar && value.charCodeAt(i + 1) === Char.OpenBrace) {
      parts.push(value.slice(prev, i));
      expressions.push(parse(new ParserState(value.slice(i + 2)), 0, 0, $type | BindingType.Interpolation))
    }
    i++;
  }

}
