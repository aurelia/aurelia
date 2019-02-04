import {
  AccessKeyed,
  AccessMember,
  AccessScope,
  AccessThis,
  ArrayBindingPattern,
  ArrayLiteral,
  Assign,
  Binary,
  BindingBehavior,
  BindingIdentifier,
  CallFunction,
  CallMember,
  CallScope,
  Conditional,
  ForOfStatement,
  HtmlLiteral,
  IExpression,
  Interpolation,
  IVisitor,
  ObjectBindingPattern,
  ObjectLiteral,
  PrimitiveLiteral,
  TaggedTemplate,
  Template,
  Unary,
  ValueConverter
} from '@aurelia/runtime';

export class ExpressionVisitor implements IVisitor<void> {
  public visitAccessMember(expr: AccessMember): void {
    expr.object.accept(this);
  }

  public visitAccessKeyed(expr: AccessKeyed): void {
    expr.object.accept(this);
    expr.key.accept(this);
  }

  public visitAccessThis(expr: AccessThis): void {
    return;
  }

  public visitAccessScope(expr: AccessScope): void {
    return;
  }

  public visitArrayLiteral(expr: ArrayLiteral): void {
    const elements = expr.elements;
    for (let i = 0, length = elements.length; i < length; ++i) {
      elements[i].accept(this);
    }
  }

  public visitObjectLiteral(expr: ObjectLiteral): void {
    const keys = expr.keys;
    const values = expr.values;
    for (let i = 0, length = keys.length; i < length; ++i) {
      values[i].accept(this);
    }
  }

  public visitPrimitiveLiteral(expr: PrimitiveLiteral): void {
    return;
  }

  public visitCallFunction(expr: CallFunction): void {
    expr.func.accept(this);
    this.visitArgs(expr.args);
  }

  public visitCallMember(expr: CallMember): void {
    expr.object.accept(this);
    this.visitArgs(expr.args);
  }

  public visitCallScope(expr: CallScope): void {
    this.visitArgs(expr.args);
  }

  public visitTemplate(expr: Template): void {
    const { expressions } = expr;
    const length = expressions.length;
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
    }
  }

  public visitTaggedTemplate(expr: TaggedTemplate): void {
    const { expressions } = expr;
    const length = expressions.length;
    expr.func.accept(this);
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
    }
  }

  public visitUnary(expr: Unary): void {
    expr.expression.accept(this);
  }

  public visitBinary(expr: Binary): void {
    expr.left.accept(this);
    expr.right.accept(this);
  }

  public visitConditional(expr: Conditional): void {
    expr.condition.accept(this);
    expr.yes.accept(this);
    expr.no.accept(this);
  }

  public visitAssign(expr: Assign): void {
    expr.target.accept(this);
    expr.value.accept(this);
  }

  public visitValueConverter(expr: ValueConverter): void {
    const args = expr.args;
    expr.expression.accept(this);
    for (let i = 0, length = args.length; i < length; ++i) {
      args[i].accept(this);
    }
  }

  public visitBindingBehavior(expr: BindingBehavior): void {
    const args = expr.args;
    expr.expression.accept(this);
    for (let i = 0, length = args.length; i < length; ++i) {
      args[i].accept(this);
    }
  }

  public visitArrayBindingPattern(expr: ArrayBindingPattern): void {
    const elements = expr.elements;
    for (let i = 0, length = elements.length; i < length; ++i) {
      elements[i].accept(this);
    }
  }

  public visitObjectBindingPattern(expr: ObjectBindingPattern): void {
    const keys = expr.keys;
    const values = expr.values;
    for (let i = 0, length = keys.length; i < length; ++i) {
      values[i].accept(this);
    }
  }

  public visitBindingIdentifier(expr: BindingIdentifier): void {
    return;
  }

  public visitHtmlLiteral(expr: HtmlLiteral): void {
    return;
  }

  public visitForOfStatement(expr: ForOfStatement): void {
    expr.declaration.accept(this);
    expr.iterable.accept(this);
  }

  public visitInterpolation(expr: Interpolation): void {
    const { expressions } = expr;
    const length = expressions.length;
    for (let i = 0; i < length; i++) {
      expressions[i].accept(this);
    }
  }

  private visitArgs(args: ReadonlyArray<IExpression>): void {
    for (let i = 0, length = args.length; i < length; ++i) {
      args[i].accept(this);
    }
  }
}
