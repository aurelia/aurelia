import { Unwrap } from '@aurelia/kernel';
import * as AST from '@aurelia/runtime';
import { IHydrator } from '@aurelia/runtime/dist/ast';

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

type HydrateableExpression = { fromJSON(jsonObject: any, hydrator: IHydrator): any };
type ParsedRawExpression = any & { $TYPE: string };
export class Deserializer implements IHydrator {
  public static deserialize(serializedExpr: string): AST.IExpression {
    const deserializer = new Deserializer();
    const raw = JSON.parse(serializedExpr) as ParsedRawExpression;
    return deserializer.hydrate(raw);
  }

  private static readonly hydrationMap: { [$TYPE: string]: HydrateableExpression } = {
    [AST.AccessMemberExpression.$TYPE]:     AST.AccessMemberExpression,
    [AST.AccessKeyedExpression.$TYPE]:      AST.AccessKeyedExpression,
    [AST.AccessThisExpression.$TYPE]:       AST.AccessThisExpression,
    [AST.AccessScopeExpression.$TYPE]:      AST.AccessScopeExpression,
    [AST.ArrayLiteralExpression.$TYPE]:     AST.ArrayLiteralExpression,
    [AST.ObjectLiteralExpression.$TYPE]:    AST.ObjectLiteralExpression,
    [AST.PrimitiveLiteralExpression.$TYPE]: AST.PrimitiveLiteralExpression,
    [AST.CallFunctionExpression.$TYPE]:     AST.CallFunctionExpression,
    [AST.CallMemberExpression.$TYPE]:       AST.CallMemberExpression,
    [AST.CallScopeExpression.$TYPE]:        AST.CallScopeExpression,
    [AST.TemplateExpression.$TYPE]:         AST.TemplateExpression,
    [AST.TaggedTemplateExpression.$TYPE]:   AST.TaggedTemplateExpression,
    [AST.UnaryExpression.$TYPE]:            AST.UnaryExpression,
    [AST.BinaryExpression.$TYPE]:           AST.BinaryExpression,
    [AST.ConditionalExpression.$TYPE]:      AST.ConditionalExpression,
    [AST.AssignExpression.$TYPE]:           AST.AssignExpression,
    [AST.ValueConverterExpression.$TYPE]:   AST.ValueConverterExpression,
    [AST.BindingBehaviorExpression.$TYPE]:  AST.BindingBehaviorExpression,
    [AST.ArrayBindingPattern.$TYPE]:        AST.ArrayBindingPattern,
    [AST.ObjectBindingPattern.$TYPE]:       AST.ObjectBindingPattern,
    [AST.BindingIdentifier.$TYPE]:          AST.BindingIdentifier,
    [AST.ForOfStatement.$TYPE]:             AST.ForOfStatement,
    [AST.Interpolation.$TYPE]:              AST.Interpolation,
  } as const;

  public hydrate(raw: ParsedRawExpression): any {
    const expressionFunction = Deserializer.hydrationMap[raw.$TYPE];
    if (expressionFunction !== void 0) {
      return expressionFunction.fromJSON(raw, this);
    } else {
      if (Array.isArray(raw)) {
        if (typeof raw[0] === 'object') {
          return this.deserializeExpressions(raw);
        } else {
          return raw.map(deserializePrimitive);
        }
      } else if (typeof raw !== 'object') {
        return deserializePrimitive(raw);
      }
      throw new Error(`unable to deserialize the expression: ${raw}`); // TODO use reporter/logger
    }
  }

  private deserializeExpressions(exprs: unknown[]) {
    const expressions: AST.IExpression[] = [];
    for (const expr of exprs) {
      expressions.push(this.hydrate(expr));
    }
    return expressions;
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
    return `{"$TYPE":"${AST.AccessMemberExpression.$TYPE}","name":"${expr.name}","object":${expr.object.accept(this)}}`;
  }

  public visitAccessKeyed(expr: AST.AccessKeyedExpression): string {
    return `{"$TYPE":"${AST.AccessKeyedExpression.$TYPE}","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
  }

  public visitAccessThis(expr: AST.AccessThisExpression): string {
    return `{"$TYPE":"${AST.AccessThisExpression.$TYPE}","ancestor":${expr.ancestor}}`;
  }

  public visitAccessScope(expr: AST.AccessScopeExpression): string {
    return `{"$TYPE":"${AST.AccessScopeExpression.$TYPE}","name":"${expr.name}","ancestor":${expr.ancestor}}`;
  }

  public visitArrayLiteral(expr: AST.ArrayLiteralExpression): string {
    return `{"$TYPE":"${AST.ArrayLiteralExpression.$TYPE}","elements":${this.serializeExpressions(expr.elements)}}`;
  }

  public visitObjectLiteral(expr: AST.ObjectLiteralExpression): string {
    return `{"$TYPE":"${AST.ObjectLiteralExpression.$TYPE}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }

  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteralExpression): string {
    return `{"$TYPE":"${AST.PrimitiveLiteralExpression.$TYPE}","value":${serializePrimitive(expr.value)}}`;
  }

  public visitCallFunction(expr: AST.CallFunctionExpression): string {
    return `{"$TYPE":"${AST.CallFunctionExpression.$TYPE}","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitCallMember(expr: AST.CallMemberExpression): string {
    return `{"$TYPE":"${AST.CallMemberExpression.$TYPE}","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitCallScope(expr: AST.CallScopeExpression): string {
    return `{"$TYPE":"${AST.CallScopeExpression.$TYPE}","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitTemplate(expr: AST.TemplateExpression): string {
    return `{"$TYPE":"${AST.TemplateExpression.$TYPE}","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  public visitTaggedTemplate(expr: AST.TaggedTemplateExpression): string {
    return `{"$TYPE":"${AST.TaggedTemplateExpression.$TYPE}","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw as readonly unknown[])},"func":${expr.func.accept(this)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  public visitUnary(expr: AST.UnaryExpression): string {
    return `{"$TYPE":"${AST.UnaryExpression.$TYPE}","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
  }

  public visitBinary(expr: AST.BinaryExpression): string {
    return `{"$TYPE":"${AST.BinaryExpression.$TYPE}","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
  }

  public visitConditional(expr: AST.ConditionalExpression): string {
    return `{"$TYPE":"${AST.ConditionalExpression.$TYPE}","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
  }

  public visitAssign(expr: AST.AssignExpression): string {
    return `{"$TYPE":"${AST.AssignExpression.$TYPE}","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
  }

  public visitValueConverter(expr: AST.ValueConverterExpression): string {
    return `{"$TYPE":"${AST.ValueConverterExpression.$TYPE}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitBindingBehavior(expr: AST.BindingBehaviorExpression): string {
    return `{"$TYPE":"${AST.BindingBehaviorExpression.$TYPE}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitArrayBindingPattern(expr: AST.ArrayBindingPattern): string {
    return `{"$TYPE":"${AST.ArrayBindingPattern.$TYPE}","elements":${this.serializeExpressions(expr.elements)}}`;
  }

  public visitObjectBindingPattern(expr: AST.ObjectBindingPattern): string {
    return `{"$TYPE":"${AST.ObjectBindingPattern.$TYPE}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }

  public visitBindingIdentifier(expr: AST.BindingIdentifier): string {
    return `{"$TYPE":"${AST.BindingIdentifier.$TYPE}","name":"${expr.name}"}`;
  }

  public visitHtmlLiteral(expr: AST.HtmlLiteralExpression): string { throw new Error('visitHtmlLiteral'); }

  public visitForOfStatement(expr: AST.ForOfStatement): string {
    return `{"$TYPE":"${AST.ForOfStatement.$TYPE}","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
  }

  public visitInterpolation(expr: AST.Interpolation): string {
    return `{"$TYPE":"${AST.Interpolation.$TYPE}","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
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

export function serializePrimitives(values: readonly unknown[]): string {
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

export function serializePrimitive(value: unknown): string {
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

export function deserializePrimitive(value: unknown): any {
  if (typeof value === 'string') {
    if (value === 'null') { return null; }
    if (value === 'undefined') { return undefined; }
    return value.substring(1, value.length - 1);
  } else {
    return value;
  }
}
