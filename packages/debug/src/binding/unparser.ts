import { Unwrap } from '@aurelia/kernel';
import * as AST from '@aurelia/runtime';

const astTypeMap = [
  { type: AST.AccessKeyedExpression, name: 'AccessKeyedExpression' },
  { type: AST.AccessMemberExpression, name: 'AccessMemberExpression' },
  { type: AST.AccessScopeExpression, name: 'AccessScopeExpression' },
  { type: AST.AccessThisExpression, name: 'AccessThisExpression' },
  { type: AST.ArrayBindingPattern, name: 'ArrayBindingPattern' },
  { type: AST.ArrayLiteralExpression, name: 'ArrayLiteralExpression' },
  { type: AST.AssignExpression, name: 'AssignExpression' },
  { type: AST.BinaryExpression, name: 'BinaryExpression' },
  { type: AST.BindingBehaviorExpression, name: 'BindingBehaviorExpression' },
  { type: AST.BindingIdentifier, name: 'BindingIdentifier' },
  { type: AST.CallFunctionExpression, name: 'CallFunctionExpression' },
  { type: AST.CallMemberExpression, name: 'CallMemberExpression' },
  { type: AST.CallScopeExpression, name: 'CallScopeExpression' },
  { type: AST.ConditionalExpression, name: 'ConditionalExpression' },
  { type: AST.ForOfStatement, name: 'ForOfStatement' },
  { type: AST.HtmlLiteralExpression, name: 'HtmlLiteralExpression' },
  { type: AST.Interpolation, name: 'Interpolation' },
  { type: AST.ObjectBindingPattern, name: 'ObjectBindingPattern' },
  { type: AST.ObjectLiteralExpression, name: 'ObjectLiteralExpression' },
  { type: AST.PrimitiveLiteralExpression, name: 'PrimitiveLiteralExpression' },
  { type: AST.TaggedTemplateExpression, name: 'TaggedTemplateExpression' },
  { type: AST.TemplateExpression, name: 'TemplateExpression' },
  { type: AST.UnaryExpression, name: 'UnaryExpression' },
  { type: AST.ValueConverterExpression, name: 'ValueConverterExpression' }
];

export function enableImprovedExpressionDebugging(): void {
  astTypeMap.forEach(x => { adoptDebugMethods(x.type, x.name); });
}

/** @internal */
export function adoptDebugMethods($type: Unwrap<typeof astTypeMap>['type'], name: string): void {
  $type.prototype.toString = function (): string { return Unparser.unparse(this); };
}

export class Unparser implements AST.IVisitor<void> {
  public text: string = '';

  public static unparse(expr: AST.IExpression): string {
    const visitor = new Unparser();
    expr.accept(visitor);
    return visitor.text;
  }

  public visitAccessMember(expr: AST.AccessMemberExpression): void {
    expr.object.accept(this);
    this.text += `.${expr.name}`;
  }

  public visitAccessKeyed(expr: AST.AccessKeyedExpression): void {
    expr.object.accept(this);
    this.text += '[';
    expr.key.accept(this);
    this.text += ']';
  }

  public visitAccessThis(expr: AST.AccessThisExpression): void {
    if (expr.ancestor === 0) {
      this.text += '$this';
      return;
    }
    this.text += '$parent';
    let i = expr.ancestor - 1;
    while (i--) {
      this.text += '.$parent';
    }
  }

  public visitAccessScope(expr: AST.AccessScopeExpression): void {
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
  }

  public visitArrayLiteral(expr: AST.ArrayLiteralExpression): void {
    const elements = expr.elements;
    this.text += '[';
    for (let i = 0, length = elements.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      elements[i].accept(this);
    }
    this.text += ']';
  }

  public visitObjectLiteral(expr: AST.ObjectLiteralExpression): void {
    const keys = expr.keys;
    const values = expr.values;
    this.text += '{';
    for (let i = 0, length = keys.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      this.text += `'${keys[i]}':`;
      values[i].accept(this);
    }
    this.text += '}';
  }

  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteralExpression): void {
    this.text += '(';
    if (typeof expr.value === 'string') {
      const escaped = expr.value.replace(/'/g, '\\\'');
      this.text += `'${escaped}'`;
    } else {
      this.text += `${expr.value}`;
    }
    this.text += ')';
  }

  public visitCallFunction(expr: AST.CallFunctionExpression): void {
    this.text += '(';
    expr.func.accept(this);
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallMember(expr: AST.CallMemberExpression): void {
    this.text += '(';
    expr.object.accept(this);
    this.text += `.${expr.name}`;
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallScope(expr: AST.CallScopeExpression): void {
    this.text += '(';
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitTemplate(expr: AST.TemplateExpression): void {
    const { cooked, expressions } = expr;
    const length = expressions.length;
    this.text += '`';
    this.text += cooked[0];
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
      this.text += cooked[i + 1];
    }
    this.text += '`';
  }

  public visitTaggedTemplate(expr: AST.TaggedTemplateExpression): void {
    const { cooked, expressions } = expr;
    const length = expressions.length;
    expr.func.accept(this);
    this.text += '`';
    this.text += cooked[0];
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
      this.text += cooked[i + 1];
    }
    this.text += '`';
  }

  public visitUnary(expr: AST.UnaryExpression): void {
    this.text += `(${expr.operation}`;
    if (expr.operation.charCodeAt(0) >= /* a */97) {
      this.text += ' ';
    }
    expr.expression.accept(this);
    this.text += ')';
  }

  public visitBinary(expr: AST.BinaryExpression): void {
    this.text += '(';
    expr.left.accept(this);
    if (expr.operation.charCodeAt(0) === /* i */105) {
      this.text += ` ${expr.operation} `;
    } else {
      this.text += expr.operation;
    }
    expr.right.accept(this);
    this.text += ')';
  }

  public visitConditional(expr: AST.ConditionalExpression): void {
    this.text += '(';
    expr.condition.accept(this);
    this.text += '?';
    expr.yes.accept(this);
    this.text += ':';
    expr.no.accept(this);
    this.text += ')';
  }

  public visitAssign(expr: AST.AssignExpression): void {
    this.text += '(';
    expr.target.accept(this);
    this.text += '=';
    expr.value.accept(this);
    this.text += ')';
  }

  public visitValueConverter(expr: AST.ValueConverterExpression): void {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `|${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
  }

  public visitBindingBehavior(expr: AST.BindingBehaviorExpression): void {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `&${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
  }

  public visitArrayBindingPattern(expr: AST.ArrayBindingPattern): void {
    const elements = expr.elements;
    this.text += '[';
    for (let i = 0, length = elements.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      elements[i].accept(this);
    }
    this.text += ']';
  }

  public visitObjectBindingPattern(expr: AST.ObjectBindingPattern): void {
    const keys = expr.keys;
    const values = expr.values;
    this.text += '{';
    for (let i = 0, length = keys.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      this.text += `'${keys[i]}':`;
      values[i].accept(this);
    }
    this.text += '}';
  }

  public visitBindingIdentifier(expr: AST.BindingIdentifier): void {
    this.text += expr.name;
  }

  public visitHtmlLiteral(expr: AST.HtmlLiteralExpression): void { throw new Error('visitHtmlLiteral'); }

  public visitForOfStatement(expr: AST.ForOfStatement): void {
    expr.declaration.accept(this);
    this.text += ' of ';
    expr.iterable.accept(this);
  }

  public visitInterpolation(expr: AST.Interpolation): void {
    const { parts, expressions } = expr;
    const length = expressions.length;
    this.text += '${';
    this.text += parts[0];
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
      this.text += parts[i + 1];
    }
    this.text += '}';
  }

  private writeArgs(args: readonly AST.IExpression[]): void {
    this.text += '(';
    for (let i = 0, length = args.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      args[i].accept(this);
    }
    this.text += ')';
  }
}

export class Serializer implements AST.IVisitor<string> {
  public static serialize(expr: AST.IExpression): string {
    const visitor = new Serializer();
    if (expr == null || typeof expr.accept !== 'function') {
      return `${expr}`;
    }
    return expr.accept(visitor);
  }

  public visitAccessMember(expr: AST.AccessMemberExpression): string {
    return `{"type":"AccessMemberExpression","name":${expr.name},"object":${expr.object.accept(this)}}`;
  }

  public visitAccessKeyed(expr: AST.AccessKeyedExpression): string {
    return `{"type":"AccessKeyedExpression","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
  }

  public visitAccessThis(expr: AST.AccessThisExpression): string {
    return `{"type":"AccessThisExpression","ancestor":${expr.ancestor}}`;
  }

  public visitAccessScope(expr: AST.AccessScopeExpression): string {
    return `{"type":"AccessScopeExpression","name":"${expr.name}","ancestor":${expr.ancestor}}`;
  }

  public visitArrayLiteral(expr: AST.ArrayLiteralExpression): string {
    return `{"type":"ArrayLiteralExpression","elements":${this.serializeExpressions(expr.elements)}}`;
  }

  public visitObjectLiteral(expr: AST.ObjectLiteralExpression): string {
    return `{"type":"ObjectLiteralExpression","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }

  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteralExpression): string {
    return `{"type":"PrimitiveLiteralExpression","value":${serializePrimitive(expr.value)}}`;
  }

  public visitCallFunction(expr: AST.CallFunctionExpression): string {
    return `{"type":"CallFunctionExpression","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitCallMember(expr: AST.CallMemberExpression): string {
    return `{"type":"CallMemberExpression","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitCallScope(expr: AST.CallScopeExpression): string {
    return `{"type":"CallScopeExpression","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitTemplate(expr: AST.TemplateExpression): string {
    return `{"type":"TemplateExpression","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  public visitTaggedTemplate(expr: AST.TaggedTemplateExpression): string {
    return `{"type":"TaggedTemplateExpression","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw as readonly unknown[])},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  public visitUnary(expr: AST.UnaryExpression): string {
    return `{"type":"UnaryExpression","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
  }

  public visitBinary(expr: AST.BinaryExpression): string {
    return `{"type":"BinaryExpression","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
  }

  public visitConditional(expr: AST.ConditionalExpression): string {
    return `{"type":"ConditionalExpression","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
  }

  public visitAssign(expr: AST.AssignExpression): string {
    return `{"type":"AssignExpression","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
  }

  public visitValueConverter(expr: AST.ValueConverterExpression): string {
    return `{"type":"ValueConverterExpression","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitBindingBehavior(expr: AST.BindingBehaviorExpression): string {
    return `{"type":"BindingBehaviorExpression","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitArrayBindingPattern(expr: AST.ArrayBindingPattern): string {
    return `{"type":"ArrayBindingPattern","elements":${this.serializeExpressions(expr.elements)}}`;
  }

  public visitObjectBindingPattern(expr: AST.ObjectBindingPattern): string {
    return `{"type":"ObjectBindingPattern","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }

  public visitBindingIdentifier(expr: AST.BindingIdentifier): string {
    return `{"type":"BindingIdentifier","name":"${expr.name}"}`;
  }

  public visitHtmlLiteral(expr: AST.HtmlLiteralExpression): string { throw new Error('visitHtmlLiteral'); }

  public visitForOfStatement(expr: AST.ForOfStatement): string {
    return `{"type":"ForOfStatement","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
  }

  public visitInterpolation(expr: AST.Interpolation): string {
    return `{"type":"Interpolation","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  private serializeExpressions(args: readonly AST.IExpression[]): string {
    let text = '[';
    for (let i = 0, ii = args.length; i < ii; ++i) {
      if (i !== 0) {
        text += ',';
      }
      text += args[i].accept(this);
    }
    text += ']';
    return text;
  }
}

function serializePrimitives(values: readonly unknown[]): string {
  let text = '[';
  for (let i = 0, ii = values.length; i < ii; ++i) {
    if (i !== 0) {
      text += ',';
    }
    text += serializePrimitive(values[i]);
  }
  text += ']';
  return text;
}

function serializePrimitive(value: unknown): string {
  if (typeof value === 'string') {
    return `"\\"${escapeString(value)}\\""`;
  } else if (value == null) {
    return `"${value}"`;
  } else {
    return `${value}`;
  }
}

function escapeString(str: string): string {
  let ret = '';
  for (let i = 0, ii = str.length; i < ii; ++i) {
    ret += escape(str.charAt(i));
  }
  return ret;
}

function escape(ch: string): string {
  switch (ch) {
    case '\b': return '\\b';
    case '\t': return '\\t';
    case '\n': return '\\n';
    case '\v': return '\\v';
    case '\f': return '\\f';
    case '\r': return '\\r';
    case '"': return '\\"';
    case '\'': return '\\\'';
    case '\\': return '\\\\';
    default: return ch;
  }
}
