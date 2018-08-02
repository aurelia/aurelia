import { IExpression, Interpolation } from '@aurelia/runtime';
import { Access, Char, parse, ParserState, Precedence } from '../binding/expression-parser';
import { BindingType } from './attribute-name-parser';

export type AttributeValue = IExpression | string;

export function parseAttributeValue(value: string, $type: BindingType): AttributeValue {
  if ($type & BindingType.IsPlain) {
    // an attribute that is neither a resource nor a binding command will only become a binding if an interpolation is found
    // otherwise, the raw string value is simply returned
    return parseInterpolation(value, $type);
  }
  return parse(new ParserState(value), Access.Reset, Precedence.Variadic, $type);
}

function parseInterpolation(value: string, $type: BindingType): AttributeValue {
  const len = value.length;
  const parts = [];
  const expressions = [];
  let prev = 0;
  let i = 0;
  while (i < len) {
    if (value.charCodeAt(i) === Char.Dollar && value.charCodeAt(i + 1) === Char.OpenBrace) {
      parts.push(value.slice(prev, i));
      // skip the Dollar+OpenBrace; the expression parser only knows about the closing brace being a valid expression end when in an interpolation
      const state = new ParserState(value.slice(i + 2));
      expressions.push(parse(state, Access.Reset, Precedence.Variadic, $type | BindingType.Interpolation));
      // compensate for the skipped Dollar+OpenBrace
      prev = i = i + state.index + 2;
      continue;
    }
    i++;
  }
  if (expressions.length) {
    // add the string part that came after the last ClosingBrace
    parts.push(value.slice(prev));
    return new Interpolation(parts, expressions);
  }
  return value;
}
