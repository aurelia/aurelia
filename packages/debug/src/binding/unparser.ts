import { Unwrap } from '@aurelia/kernel';
import * as AST from '@aurelia/runtime';

const astTypeMap = [
  { type: AST.AccessKeyed, name: 'AccessKeyed' },
  { type: AST.AccessMember, name: 'AccessMember' },
  { type: AST.AccessScope, name: 'AccessScope' },
  { type: AST.AccessThis, name: 'AccessThis' },
  { type: AST.ArrayBindingPattern, name: 'ArrayBindingPattern' },
  { type: AST.ArrayLiteral, name: 'ArrayLiteral' },
  { type: AST.Assign, name: 'Assign' },
  { type: AST.Binary, name: 'Binary' },
  { type: AST.BindingBehavior, name: 'BindingBehavior' },
  { type: AST.BindingIdentifier, name: 'BindingIdentifier' },
  { type: AST.CallFunction, name: 'CallFunction' },
  { type: AST.CallMember, name: 'CallMember' },
  { type: AST.CallScope, name: 'CallScope' },
  { type: AST.Conditional, name: 'Conditional' },
  { type: AST.ForOfStatement, name: 'ForOfStatement' },
  { type: AST.HtmlLiteral, name: 'HtmlLiteral' },
  { type: AST.Interpolation, name: 'Interpolation' },
  { type: AST.ObjectBindingPattern, name: 'ObjectBindingPattern' },
  { type: AST.ObjectLiteral, name: 'ObjectLiteral' },
  { type: AST.PrimitiveLiteral, name: 'PrimitiveLiteral' },
  { type: AST.TaggedTemplate, name: 'TaggedTemplate' },
  { type: AST.Template, name: 'Template' },
  { type: AST.Unary, name: 'Unary' },
  { type: AST.ValueConverter, name: 'ValueConverter' }
];

export function enableImprovedExpressionDebugging(): void {
  astTypeMap.forEach(x => adoptDebugMethods(x.type, x.name));
}

/*@internal*/
export function adoptDebugMethods($type: Unwrap<typeof astTypeMap>['type'], name: string): void {
  $type.prototype.toString = function(): string { return Unparser.unparse(this); };
}

/*@internal*/
export class Unparser implements AST.IVisitor<void> {
  public text: string = '';

  public static unparse(expr: AST.IExpression): string {
    const visitor = new Unparser();
    expr.accept(visitor);
    return visitor.text;
  }

  public visitAccessMember(expr: AST.AccessMember): void {
    expr.object.accept(this);
    this.text += `.${expr.name}`;
  }

  public visitAccessKeyed(expr: AST.AccessKeyed): void {
    expr.object.accept(this);
    this.text += '[';
    expr.key.accept(this);
    this.text += ']';
  }

  public visitAccessThis(expr: AST.AccessThis): void {
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

  public visitAccessScope(expr: AST.AccessScope): void {
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
  }

  public visitArrayLiteral(expr: AST.ArrayLiteral): void {
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

  public visitObjectLiteral(expr: AST.ObjectLiteral): void {
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

  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteral): void {
    this.text += '(';
    if (typeof expr.value === 'string') {
      const escaped = expr.value.replace(/'/g, '\'');
      this.text += `'${escaped}'`;
    } else {
      this.text += `${expr.value}`;
    }
    this.text += ')';
  }

  public visitCallFunction(expr: AST.CallFunction): void {
    this.text += '(';
    expr.func.accept(this);
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallMember(expr: AST.CallMember): void {
    this.text += '(';
    expr.object.accept(this);
    this.text += `.${expr.name}`;
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallScope(expr: AST.CallScope): void {
    this.text += '(';
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitTemplate(expr: AST.Template): void {
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

  public visitTaggedTemplate(expr: AST.TaggedTemplate): void {
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

  public visitUnary(expr: AST.Unary): void {
    this.text += `(${expr.operation}`;
    if (expr.operation.charCodeAt(0) >= /*a*/97) {
      this.text += ' ';
    }
    expr.expression.accept(this);
    this.text += ')';
  }

  public visitBinary(expr: AST.Binary): void {
    this.text += '(';
    expr.left.accept(this);
    if (expr.operation.charCodeAt(0) === /*i*/105) {
      this.text += ` ${expr.operation} `;
    } else {
      this.text += expr.operation;
    }
    expr.right.accept(this);
    this.text += ')';
  }

  public visitConditional(expr: AST.Conditional): void {
    this.text += '(';
    expr.condition.accept(this);
    this.text += '?';
    expr.yes.accept(this);
    this.text += ':';
    expr.no.accept(this);
    this.text += ')';
  }

  public visitAssign(expr: AST.Assign): void {
    this.text += '(';
    expr.target.accept(this);
    this.text += '=';
    expr.value.accept(this);
    this.text += ')';
  }

  public visitValueConverter(expr: AST.ValueConverter): void {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `|${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
  }

  public visitBindingBehavior(expr: AST.BindingBehavior): void {
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

  public visitHtmlLiteral(expr: AST.HtmlLiteral): void { throw new Error('visitHtmlLiteral'); }

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

  private writeArgs(args: ReadonlyArray<AST.IExpression>): void {
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

/*@internal*/
export class Serializer implements AST.IVisitor<string> {
  public static serialize(expr: AST.IExpression): string {
    const visitor = new Serializer();
    if (expr === null || expr === undefined || typeof expr.accept !== 'function') {
      return `${expr}`;
    }
    return expr.accept(visitor);
  }

  public visitAccessMember(expr: AST.AccessMember): string {
    return `{"type":"AccessMember","name":${expr.name},"object":${expr.object.accept(this)}}`;
  }

  public visitAccessKeyed(expr: AST.AccessKeyed): string {
    return `{"type":"AccessKeyed","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
  }

  public visitAccessThis(expr: AST.AccessThis): string {
    return `{"type":"AccessThis","ancestor":${expr.ancestor}}`;
  }

  public visitAccessScope(expr: AST.AccessScope): string {
    return `{"type":"AccessScope","name":"${expr.name}","ancestor":${expr.ancestor}}`;
  }

  public visitArrayLiteral(expr: AST.ArrayLiteral): string {
    return `{"type":"ArrayLiteral","elements":${this.serializeExpressions(expr.elements)}}`;
  }

  public visitObjectLiteral(expr: AST.ObjectLiteral): string {
    return `{"type":"ObjectLiteral","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }

  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteral): string {
    return `{"type":"PrimitiveLiteral","value":${serializePrimitive(expr.value)}}`;
  }

  public visitCallFunction(expr: AST.CallFunction): string {
    return `{"type":"CallFunction","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitCallMember(expr: AST.CallMember): string {
    return `{"type":"CallMember","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitCallScope(expr: AST.CallScope): string {
    return `{"type":"CallScope","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitTemplate(expr: AST.Template): string {
    return `{"type":"Template","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  public visitTaggedTemplate(expr: AST.TaggedTemplate): string {
    return `{"type":"TaggedTemplate","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  public visitUnary(expr: AST.Unary): string {
    return `{"type":"Unary","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
  }

  public visitBinary(expr: AST.Binary): string {
    return `{"type":"Binary","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
  }

  public visitConditional(expr: AST.Conditional): string {
    return `{"type":"Conditional","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
  }

  public visitAssign(expr: AST.Assign): string {
    return `{"type":"Assign","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
  }

  public visitValueConverter(expr: AST.ValueConverter): string {
    return `{"type":"ValueConverter","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }

  public visitBindingBehavior(expr: AST.BindingBehavior): string {
    return `{"type":"BindingBehavior","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
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

  public visitHtmlLiteral(expr: AST.HtmlLiteral): string { throw new Error('visitHtmlLiteral'); }

  public visitForOfStatement(expr: AST.ForOfStatement): string {
    return `{"type":"ForOfStatement","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
  }

  public visitInterpolation(expr: AST.Interpolation): string {
    return `{"type":"Interpolation","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }

  // tslint:disable-next-line:no-any
  private serializeExpressions(args: ReadonlyArray<AST.IExpression>): string {
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

  // tslint:disable-next-line:no-any
function serializePrimitives(values: ReadonlyArray<any>): string {
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

  // tslint:disable-next-line:no-any
function serializePrimitive(value: any): string {
  if (typeof value === 'string') {
    return `"\\"${escapeString(value)}\\""`;
  } else if (value === null || value === undefined) {
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
    case '\"': return '\\"';
    case '\'': return '\\\'';
    case '\\': return '\\\\';
    default: return ch;
  }
}
