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
