import { IHydrator } from '@aurelia/runtime';
import * as AST from '@aurelia/runtime';

enum ASTExpressionTypes {
  BindingBehaviorExpression = 'BindingBehaviorExpression',
  ValueConverterExpression = 'ValueConverterExpression',
  AssignExpression = 'AssignExpression',
  ConditionalExpression = 'ConditionalExpression',
  AccessThisExpression = 'AccessThisExpression',
  AccessScopeExpression = 'AccessScopeExpression',
  AccessMemberExpression = 'AccessMemberExpression',
  AccessKeyedExpression = 'AccessKeyedExpression',
  CallScopeExpression = 'CallScopeExpression',
  CallMemberExpression = 'CallMemberExpression',
  CallFunctionExpression = 'CallFunctionExpression',
  BinaryExpression = 'BinaryExpression',
  UnaryExpression = 'UnaryExpression',
  PrimitiveLiteralExpression = 'PrimitiveLiteralExpression',
  ArrayLiteralExpression = 'ArrayLiteralExpression',
  ObjectLiteralExpression = 'ObjectLiteralExpression',
  TemplateExpression = 'TemplateExpression',
  TaggedTemplateExpression = 'TaggedTemplateExpression',
  ArrayBindingPattern = 'ArrayBindingPattern',
  ObjectBindingPattern = 'ObjectBindingPattern',
  BindingIdentifier = 'BindingIdentifier',
  ForOfStatement = 'ForOfStatement',
  Interpolation = 'Interpolation'
}

export class Deserializer implements IHydrator {
  public static deserialize(serializedExpr: string): AST.IsExpressionOrStatement {
    const deserializer = new Deserializer();
    const raw = JSON.parse(serializedExpr);
    return deserializer.hydrate(raw);
  }
  public hydrate(raw: any): any {
    switch (raw.$TYPE) {
      case ASTExpressionTypes.AccessMemberExpression: {
        const expr: Pick<AST.AccessMemberExpression, 'object' | 'name'> = raw;
        return new AST.AccessMemberExpression(this.hydrate(expr.object), expr.name);
      }
      case ASTExpressionTypes.AccessKeyedExpression: {
        const expr: Pick<AST.AccessKeyedExpression, 'object' | 'key'> = raw;
        return new AST.AccessKeyedExpression(this.hydrate(expr.object), this.hydrate(expr.key));
      }
      case ASTExpressionTypes.AccessThisExpression: {
        const expr: Pick<AST.AccessThisExpression, 'ancestor'> = raw;
        return new AST.AccessThisExpression(expr.ancestor);
      }
      case ASTExpressionTypes.AccessScopeExpression: {
        const expr: Pick<AST.AccessScopeExpression, 'name' | 'ancestor'> = raw;
        return new AST.AccessScopeExpression(expr.name, expr.ancestor);
      }
      case ASTExpressionTypes.ArrayLiteralExpression: {
        const expr: Pick<AST.ArrayLiteralExpression, 'elements'> = raw;
        return new AST.ArrayLiteralExpression(this.hydrate(expr.elements));
      }
      case ASTExpressionTypes.ObjectLiteralExpression: {
        const expr: Pick<AST.ObjectLiteralExpression, 'keys' | 'values'> = raw;
        return new AST.ObjectLiteralExpression(this.hydrate(expr.keys), this.hydrate(expr.values));
      }
      case ASTExpressionTypes.PrimitiveLiteralExpression: {
        const expr: Pick<AST.PrimitiveLiteralExpression, 'value'> = raw;
        return new AST.PrimitiveLiteralExpression(this.hydrate(expr.value));
      }
      case ASTExpressionTypes.CallFunctionExpression: {
        const expr: Pick<AST.CallFunctionExpression, 'func' | 'args'> = raw;
        return new AST.CallFunctionExpression(this.hydrate(expr.func), this.hydrate(expr.args));
      }
      case ASTExpressionTypes.CallMemberExpression: {
        const expr: Pick<AST.CallMemberExpression, 'object' | 'name' | 'args'> = raw;
        return new AST.CallMemberExpression(this.hydrate(expr.object), expr.name, this.hydrate(expr.args));
      }
      case ASTExpressionTypes.CallScopeExpression: {
        const expr: Pick<AST.CallScopeExpression, 'name' | 'args' | 'ancestor'> = raw;
        return new AST.CallScopeExpression(expr.name, this.hydrate(expr.args), expr.ancestor);
      }
      case ASTExpressionTypes.TemplateExpression: {
        const expr: Pick<AST.TemplateExpression, 'cooked' | 'expressions'> = raw;
        return new AST.TemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
      }
      case ASTExpressionTypes.TaggedTemplateExpression: {
        const expr: Pick<AST.TaggedTemplateExpression, 'cooked' | 'func' | 'expressions'> & {
          raw: any;
        } = raw;
        return new AST.TaggedTemplateExpression(this.hydrate(expr.cooked), this.hydrate(expr.raw), this.hydrate(expr.func), this.hydrate(expr.expressions));
      }
      case ASTExpressionTypes.UnaryExpression: {
        const expr: Pick<AST.UnaryExpression, 'operation' | 'expression'> = raw;
        return new AST.UnaryExpression(expr.operation, this.hydrate(expr.expression));
      }
      case ASTExpressionTypes.BinaryExpression: {
        const expr: Pick<AST.BinaryExpression, 'operation' | 'left' | 'right'> = raw;
        return new AST.BinaryExpression(expr.operation, this.hydrate(expr.left), this.hydrate(expr.right));
      }
      case ASTExpressionTypes.ConditionalExpression: {
        const expr: Pick<AST.ConditionalExpression, 'condition' | 'yes' | 'no'> = raw;
        return new AST.ConditionalExpression(this.hydrate(expr.condition), this.hydrate(expr.yes), this.hydrate(expr.no));
      }
      case ASTExpressionTypes.AssignExpression: {
        const expr: Pick<AST.AssignExpression, 'target' | 'value'> = raw;
        return new AST.AssignExpression(this.hydrate(expr.target), this.hydrate(expr.value));
      }
      case ASTExpressionTypes.ValueConverterExpression: {
        const expr: Pick<AST.ValueConverterExpression, 'expression' | 'name' | 'args'> = raw;
        return new AST.ValueConverterExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
      }
      case ASTExpressionTypes.BindingBehaviorExpression: {
        const expr: Pick<AST.BindingBehaviorExpression, 'expression' | 'name' | 'args'> = raw;
        return new AST.BindingBehaviorExpression(this.hydrate(expr.expression), expr.name, this.hydrate(expr.args));
      }
      case ASTExpressionTypes.ArrayBindingPattern: {
        const expr: Pick<AST.ArrayBindingPattern, 'elements'> = raw;
        return new AST.ArrayBindingPattern(this.hydrate(expr.elements));
      }
      case ASTExpressionTypes.ObjectBindingPattern: {
        const expr: Pick<AST.ObjectBindingPattern, 'keys' | 'values'> = raw;
        return new AST.ObjectBindingPattern(this.hydrate(expr.keys), this.hydrate(expr.values));
      }
      case ASTExpressionTypes.BindingIdentifier: {
        const expr: Pick<AST.BindingIdentifier, 'name'> = raw;
        return new AST.BindingIdentifier(expr.name);
      }
      case ASTExpressionTypes.ForOfStatement: {
        const expr: Pick<AST.ForOfStatement, 'declaration' | 'iterable'> = raw;
        return new AST.ForOfStatement(this.hydrate(expr.declaration), this.hydrate(expr.iterable));
      }
      case ASTExpressionTypes.Interpolation: {
        const expr: {
          cooked: any;
          expressions: any;
        } = raw;
        return new AST.Interpolation(this.hydrate(expr.cooked), this.hydrate(expr.expressions));
      }
      default:
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
    const expressions: AST.IsExpressionOrStatement[] = [];
    for (const expr of exprs) {
      expressions.push(this.hydrate(expr));
    }
    return expressions;
  }
}
export class Serializer implements AST.IVisitor<string> {
  public static serialize(expr: AST.IsExpressionOrStatement): string {
    const visitor = new Serializer();
    if (expr == null || typeof expr.accept !== 'function') {
      return `${expr}`;
    }
    return expr.accept(visitor);
  }
  public visitAccessMember(expr: AST.AccessMemberExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.AccessMemberExpression}","name":"${expr.name}","object":${expr.object.accept(this)}}`;
  }
  public visitAccessKeyed(expr: AST.AccessKeyedExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.AccessKeyedExpression}","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
  }
  public visitAccessThis(expr: AST.AccessThisExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.AccessThisExpression}","ancestor":${expr.ancestor}}`;
  }
  public visitAccessScope(expr: AST.AccessScopeExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.AccessScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor}}`;
  }
  public visitArrayLiteral(expr: AST.ArrayLiteralExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.ArrayLiteralExpression}","elements":${this.serializeExpressions(expr.elements)}}`;
  }
  public visitObjectLiteral(expr: AST.ObjectLiteralExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.ObjectLiteralExpression}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }
  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteralExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.PrimitiveLiteralExpression}","value":${serializePrimitive(expr.value)}}`;
  }
  public visitCallFunction(expr: AST.CallFunctionExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.CallFunctionExpression}","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }
  public visitCallMember(expr: AST.CallMemberExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.CallMemberExpression}","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }
  public visitCallScope(expr: AST.CallScopeExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.CallScopeExpression}","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
  }
  public visitTemplate(expr: AST.TemplateExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.TemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }
  public visitTaggedTemplate(expr: AST.TaggedTemplateExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.TaggedTemplateExpression}","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw as readonly unknown[])},"func":${expr.func.accept(this)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }
  public visitUnary(expr: AST.UnaryExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.UnaryExpression}","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
  }
  public visitBinary(expr: AST.BinaryExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.BinaryExpression}","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
  }
  public visitConditional(expr: AST.ConditionalExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.ConditionalExpression}","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
  }
  public visitAssign(expr: AST.AssignExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.AssignExpression}","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
  }
  public visitValueConverter(expr: AST.ValueConverterExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.ValueConverterExpression}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }
  public visitBindingBehavior(expr: AST.BindingBehaviorExpression): string {
    return `{"$TYPE":"${ASTExpressionTypes.BindingBehaviorExpression}","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
  }
  public visitArrayBindingPattern(expr: AST.ArrayBindingPattern): string {
    return `{"$TYPE":"${ASTExpressionTypes.ArrayBindingPattern}","elements":${this.serializeExpressions(expr.elements)}}`;
  }
  public visitObjectBindingPattern(expr: AST.ObjectBindingPattern): string {
    return `{"$TYPE":"${ASTExpressionTypes.ObjectBindingPattern}","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
  }
  public visitBindingIdentifier(expr: AST.BindingIdentifier): string {
    return `{"$TYPE":"${ASTExpressionTypes.BindingIdentifier}","name":"${expr.name}"}`;
  }
  public visitHtmlLiteral(_expr: AST.HtmlLiteralExpression): string { throw new Error('visitHtmlLiteral'); }
  public visitForOfStatement(expr: AST.ForOfStatement): string {
    return `{"$TYPE":"${ASTExpressionTypes.ForOfStatement}","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
  }
  public visitInterpolation(expr: AST.Interpolation): string {
    return `{"$TYPE":"${ASTExpressionTypes.Interpolation}","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
  }
  private serializeExpressions(args: readonly AST.IsExpressionOrStatement[]): string {
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
    // case '\'': return '\\\''; /* when used in serialization context, escaping `'` (single quote) is not needed as the string is wrapped in a par of `"` (double quote) */
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
