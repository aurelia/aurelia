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
export class Unparser implements AST.IVisitor {
  public text: string = '';

  public static unparse(expr: AST.IExpression): string {
    const visitor = new Unparser();
    expr.accept(visitor);
    return visitor.text;
  }

  public visitAccessMember(expr: AST.AccessMember): boolean {
    expr.object.accept(this);
    this.text += `.${expr.name}`;
    return true;
  }
  public visitAccessKeyed(expr: AST.AccessKeyed): boolean {
    expr.object.accept(this);
    this.text += '[';
    expr.key.accept(this);
    this.text += ']';
    return true;
  }
  public visitAccessThis(expr: AST.AccessThis): boolean {
    if (expr.ancestor === 0) {
      this.text += '$this';
      return;
    }
    this.text += '$parent';
    let i = expr.ancestor - 1;
    while (i--) {
      this.text += '.$parent';
    }
    return true;
  }
  public visitAccessScope(expr: AST.AccessScope): boolean {
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
    return true;
  }
  public visitArrayLiteral(expr: AST.ArrayLiteral): boolean {
    const elements = expr.elements;
    this.text += '[';
    for (let i = 0, length = elements.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      elements[i].accept(this);
    }
    this.text += ']';
    return true;
  }
  public visitObjectLiteral(expr: AST.ObjectLiteral): boolean {
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
    return true;
  }
  public visitPrimitiveLiteral(expr: AST.PrimitiveLiteral): boolean {
    if (typeof expr.value === 'string') {
      const escaped = expr.value.replace(/'/g, '\'');
      this.text += `'${escaped}'`;
    } else {
      this.text += `${expr.value}`;
    }
    return true;
  }
  public visitCallFunction(expr: AST.CallFunction): boolean {
    expr.func.accept(this);
    this.writeArgs(expr.args);
    return true;
  }
  public visitCallMember(expr: AST.CallMember): boolean {
    expr.object.accept(this);
    this.text += `.${expr.name}`;
    this.writeArgs(<AST.IExpression[]>expr.args);
    return true;
  }
  public visitCallScope(expr: AST.CallScope): boolean {
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
    this.writeArgs(<AST.IExpression[]>expr.args);
    return true;
  }
  public visitTemplate(expr: AST.Template): boolean {
    const { cooked, expressions } = expr;
    const length = expressions.length;
    this.text += '`';
    this.text += cooked[0];
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
      this.text += cooked[i + 1];
    }
    this.text += '`';
    return true;
  }
  public visitTaggedTemplate(expr: AST.TaggedTemplate): boolean {
    return true;
  }
  public visitUnary(expr: AST.Unary): boolean {
    this.text += `(${expr.operation}`;
    if (expr.operation.charCodeAt(0) >= /*a*/97) {
      this.text += ' ';
    }
    expr.expression.accept(this);
    this.text += ')';
    return true;
  }
  public visitBinary(expr: AST.Binary): boolean {
    expr.left.accept(this);
    if (expr.operation.charCodeAt(0) === /*i*/105) {
      this.text += ` ${expr.operation} `;
    } else {
      this.text += expr.operation;
    }
    expr.right.accept(this);
    return true;
  }
  public visitConditional(expr: AST.Conditional): boolean {
    expr.condition.accept(this);
    this.text += '?';
    expr.yes.accept(this);
    this.text += ':';
    expr.no.accept(this);
    return true;
  }
  public visitAssign(expr: AST.Assign): boolean {
    expr.target.accept(this);
    this.text += '=';
    expr.value.accept(this);
    return true;
  }
  public visitValueConverter(expr: AST.ValueConverter): boolean {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `|${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
    return true;
  }
  public visitBindingBehavior(expr: AST.BindingBehavior): boolean {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `&${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
    return true;
  }
  public visitArrayBindingPattern(expr: AST.ArrayBindingPattern): boolean {
    return true;
  }
  public visitObjectBindingPattern(expr: AST.ObjectBindingPattern): boolean {
    return true;
  }
  public visitBindingIdentifier(expr: AST.BindingIdentifier): boolean {
    return true;
  }
  public visitHtmlLiteral(expr: AST.HtmlLiteral): boolean {
    return true;
  }
  public visitForOfStatement(expr: AST.ForOfStatement): boolean {
    return true;
  }
  public visitInterpolation(expr: AST.Interpolation): boolean {
    return true;
  }

  private writeArgs(args: AST.IExpression[]): void {
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
