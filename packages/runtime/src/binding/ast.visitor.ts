import { createError, isString, safeString } from '../utilities';
import { CustomExpression, ExpressionKind } from './ast';

import type { AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, ArrayBindingPattern, ArrayLiteralExpression, ArrowFunction, AssignExpression, BinaryExpression, BindingBehaviorExpression, BindingIdentifier, CallFunctionExpression, CallMemberExpression, CallScopeExpression, ConditionalExpression, ForOfStatement, Interpolation, ObjectBindingPattern, ObjectLiteralExpression, PrimitiveLiteralExpression, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverterExpression, DestructuringAssignmentExpression, DestructuringAssignmentSingleExpression, DestructuringAssignmentRestExpression, IsExpressionOrStatement, IsBindingBehavior } from './ast';

export interface IVisitor<T = unknown> {
  visitAccessKeyed(expr: AccessKeyedExpression): T;
  visitAccessMember(expr: AccessMemberExpression): T;
  visitAccessScope(expr: AccessScopeExpression): T;
  visitAccessThis(expr: AccessThisExpression): T;
  visitArrayBindingPattern(expr: ArrayBindingPattern): T;
  visitArrayLiteral(expr: ArrayLiteralExpression): T;
  visitArrowFunction(expr: ArrowFunction): T;
  visitAssign(expr: AssignExpression): T;
  visitBinary(expr: BinaryExpression): T;
  visitBindingBehavior(expr: BindingBehaviorExpression): T;
  visitBindingIdentifier(expr: BindingIdentifier): T;
  visitCallFunction(expr: CallFunctionExpression): T;
  visitCallMember(expr: CallMemberExpression): T;
  visitCallScope(expr: CallScopeExpression): T;
  visitConditional(expr: ConditionalExpression): T;
  visitForOfStatement(expr: ForOfStatement): T;
  visitInterpolation(expr: Interpolation): T;
  visitObjectBindingPattern(expr: ObjectBindingPattern): T;
  visitObjectLiteral(expr: ObjectLiteralExpression): T;
  visitPrimitiveLiteral(expr: PrimitiveLiteralExpression): T;
  visitTaggedTemplate(expr: TaggedTemplateExpression): T;
  visitTemplate(expr: TemplateExpression): T;
  visitUnary(expr: UnaryExpression): T;
  visitValueConverter(expr: ValueConverterExpression): T;
  visitDestructuringAssignmentExpression(expr: DestructuringAssignmentExpression): T;
  visitDestructuringAssignmentSingleExpression(expr: DestructuringAssignmentSingleExpression): T;
  visitDestructuringAssignmentRestExpression(expr: DestructuringAssignmentRestExpression): T;
  visitCustom(expr: CustomExpression): T;
}

export const astVisit = <T>(ast: IsExpressionOrStatement, visitor: IVisitor<T>) => {
  switch (ast.$kind) {
    case ExpressionKind.AccessKeyed: return visitor.visitAccessKeyed(ast);
    case ExpressionKind.AccessMember: return visitor.visitAccessMember(ast);
    case ExpressionKind.AccessScope: return visitor.visitAccessScope(ast);
    case ExpressionKind.AccessThis: return visitor.visitAccessThis(ast);
    case ExpressionKind.ArrayBindingPattern: return visitor.visitArrayBindingPattern(ast);
    case ExpressionKind.ArrayDestructuring: return visitor.visitDestructuringAssignmentExpression(ast);
    case ExpressionKind.ArrayLiteral: return visitor.visitArrayLiteral(ast);
    case ExpressionKind.ArrowFunction: return visitor.visitArrowFunction(ast);
    case ExpressionKind.Assign: return visitor.visitAssign(ast);
    case ExpressionKind.Binary: return visitor.visitBinary(ast);
    case ExpressionKind.BindingBehavior: return visitor.visitBindingBehavior(ast);
    case ExpressionKind.BindingIdentifier: return visitor.visitBindingIdentifier(ast);
    case ExpressionKind.CallFunction: return visitor.visitCallFunction(ast);
    case ExpressionKind.CallMember: return visitor.visitCallMember(ast);
    case ExpressionKind.CallScope: return visitor.visitCallScope(ast);
    case ExpressionKind.Conditional: return visitor.visitConditional(ast);
    case ExpressionKind.DestructuringAssignmentLeaf: return visitor.visitDestructuringAssignmentSingleExpression(ast as DestructuringAssignmentSingleExpression);
    case ExpressionKind.ForOfStatement: return visitor.visitForOfStatement(ast);
    case ExpressionKind.Interpolation: return visitor.visitInterpolation(ast);
    case ExpressionKind.ObjectBindingPattern: return visitor.visitObjectBindingPattern(ast);
    case ExpressionKind.ObjectDestructuring: return visitor.visitDestructuringAssignmentExpression(ast);
    case ExpressionKind.ObjectLiteral: return visitor.visitObjectLiteral(ast);
    case ExpressionKind.PrimitiveLiteral: return visitor.visitPrimitiveLiteral(ast);
    case ExpressionKind.TaggedTemplate: return visitor.visitTaggedTemplate(ast);
    case ExpressionKind.Template: return visitor.visitTemplate(ast);
    case ExpressionKind.Unary: return visitor.visitUnary(ast);
    case ExpressionKind.ValueConverter: return visitor.visitValueConverter(ast);
    case ExpressionKind.Custom: return visitor.visitCustom(ast);
    default: {
      throw createError(`Unknown ast node ${JSON.stringify(ast)}`);
    }
  }
};

export class Unparser implements IVisitor<void> {
  public text: string = '';

  public static unparse(expr: IsExpressionOrStatement): string {
    const visitor = new Unparser();
    astVisit(expr, visitor);
    return visitor.text;
  }

  public visitAccessMember(expr: AccessMemberExpression): void {
    astVisit(expr.object, this);
    this.text += `${expr.optional ? '?' : ''}.${expr.name}`;
  }

  public visitAccessKeyed(expr: AccessKeyedExpression): void {
    astVisit(expr.object, this);
    this.text += `${expr.optional ? '?.' : ''}[`;
    astVisit(expr.key, this);
    this.text += ']';
  }

  public visitAccessThis(expr: AccessThisExpression): void {
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

  public visitAccessScope(expr: AccessScopeExpression): void {
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += expr.name;
  }

  public visitArrayLiteral(expr: ArrayLiteralExpression): void {
    const elements = expr.elements;
    this.text += '[';
    for (let i = 0, length = elements.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      astVisit(elements[i], this);
    }
    this.text += ']';
  }

  public visitArrowFunction(expr: ArrowFunction): void {
    const args = expr.args;
    const ii = args.length;
    let i = 0;
    let text = '(';
    let name: string;
    for (; i < ii; ++i) {
      name = args[i].name;
      if (i > 0) {
        text += ', ';
      }
      if (i < ii - 1) {
        text += name;
      } else {
        text += expr.rest ? `...${name}` : name;
      }
    }
    this.text += `${text}) => `;
    astVisit(expr.body, this);
  }

  public visitObjectLiteral(expr: ObjectLiteralExpression): void {
    const keys = expr.keys;
    const values = expr.values;
    this.text += '{';
    for (let i = 0, length = keys.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      this.text += `'${keys[i]}':`;
      astVisit(values[i], this);
    }
    this.text += '}';
  }

  public visitPrimitiveLiteral(expr: PrimitiveLiteralExpression): void {
    this.text += '(';
    if (isString(expr.value)) {
      const escaped = expr.value.replace(/'/g, '\\\'');
      this.text += `'${escaped}'`;
    } else {
      this.text += `${expr.value}`;
    }
    this.text += ')';
  }

  public visitCallFunction(expr: CallFunctionExpression): void {
    this.text += '(';
    astVisit(expr.func, this);
    this.text += expr.optional ? '?.' : '';
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallMember(expr: CallMemberExpression): void {
    this.text += '(';
    astVisit(expr.object, this);
    this.text += `${expr.optionalMember ? '?.' : ''}.${expr.name}${expr.optionalCall ? '?.' : ''}`;
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallScope(expr: CallScopeExpression): void {
    this.text += '(';
    let i = expr.ancestor;
    while (i--) {
      this.text += '$parent.';
    }
    this.text += `${expr.name}${expr.optional ? '?.' : ''}`;
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitTemplate(expr: TemplateExpression): void {
    const { cooked, expressions } = expr;
    const length = expressions.length;
    this.text += '`';
    this.text += cooked[0];
    for (let i = 0; i < length; i++) {
      astVisit(expressions[i], this);
      this.text += cooked[i + 1];
    }
    this.text += '`';
  }

  public visitTaggedTemplate(expr: TaggedTemplateExpression): void {
    const { cooked, expressions } = expr;
    const length = expressions.length;
    astVisit(expr.func, this);
    this.text += '`';
    this.text += cooked[0];
    for (let i = 0; i < length; i++) {
      astVisit(expressions[i], this);
      this.text += cooked[i + 1];
    }
    this.text += '`';
  }

  public visitUnary(expr: UnaryExpression): void {
    this.text += `(${expr.operation}`;
    if (expr.operation.charCodeAt(0) >= /* a */97) {
      this.text += ' ';
    }
    astVisit(expr.expression, this);
    this.text += ')';
  }

  public visitBinary(expr: BinaryExpression): void {
    this.text += '(';
    astVisit(expr.left, this);
    if (expr.operation.charCodeAt(0) === /* i */105) {
      this.text += ` ${expr.operation} `;
    } else {
      this.text += expr.operation;
    }
    astVisit(expr.right, this);
    this.text += ')';
  }

  public visitConditional(expr: ConditionalExpression): void {
    this.text += '(';
    astVisit(expr.condition, this);
    this.text += '?';
    astVisit(expr.yes, this);
    this.text += ':';
    astVisit(expr.no, this);
    this.text += ')';
  }

  public visitAssign(expr: AssignExpression): void {
    this.text += '(';
    astVisit(expr.target, this);
    this.text += '=';
    astVisit(expr.value, this);
    this.text += ')';
  }

  public visitValueConverter(expr: ValueConverterExpression): void {
    const args = expr.args;
    astVisit(expr.expression, this);
    this.text += `|${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      astVisit(args[i], this);
    }
  }

  public visitBindingBehavior(expr: BindingBehaviorExpression): void {
    const args = expr.args;
    astVisit(expr.expression, this);
    this.text += `&${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      astVisit(args[i], this);
    }
  }

  public visitArrayBindingPattern(expr: ArrayBindingPattern): void {
    const elements = expr.elements;
    this.text += '[';
    for (let i = 0, length = elements.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      astVisit(elements[i], this);
    }
    this.text += ']';
  }

  public visitObjectBindingPattern(expr: ObjectBindingPattern): void {
    const keys = expr.keys;
    const values = expr.values;
    this.text += '{';
    for (let i = 0, length = keys.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      this.text += `'${keys[i]}':`;
      astVisit(values[i], this);
    }
    this.text += '}';
  }

  public visitBindingIdentifier(expr: BindingIdentifier): void {
    this.text += expr.name;
  }

  public visitForOfStatement(expr: ForOfStatement): void {
    astVisit(expr.declaration, this);
    this.text += ' of ';
    astVisit(expr.iterable, this);
  }

  public visitInterpolation(expr: Interpolation): void {
    const { parts, expressions } = expr;
    const length = expressions.length;
    this.text += '${';
    this.text += parts[0];
    for (let i = 0; i < length; i++) {
      astVisit(expressions[i], this);
      this.text += parts[i + 1];
    }
    this.text += '}';
  }

  public visitDestructuringAssignmentExpression(expr: DestructuringAssignmentExpression): void {
    const $kind = expr.$kind;
    const isObjDes = $kind === ExpressionKind.ObjectDestructuring;
    this.text += isObjDes ? '{' : '[';
    const list = expr.list;
    const len = list.length;
    let i: number;
    let item: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
    for(i = 0; i< len; i++) {
      item = list[i];
      switch(item.$kind) {
        case ExpressionKind.DestructuringAssignmentLeaf:
          astVisit(item, this);
          break;
        case ExpressionKind.ArrayDestructuring:
        case ExpressionKind.ObjectDestructuring: {
          const source = item.source;
          if(source) {
            astVisit(source, this);
            this.text += ':';
          }
          astVisit(item, this);
          break;
        }
      }
    }
    this.text += isObjDes ? '}' : ']';
  }

  public visitDestructuringAssignmentSingleExpression(expr: DestructuringAssignmentSingleExpression): void {
    astVisit(expr.source, this);
    this.text += ':';
    astVisit(expr.target, this);
    const initializer = expr.initializer;
    if(initializer !== void 0) {
      this.text +='=';
      astVisit(initializer, this);
    }
  }

  public visitDestructuringAssignmentRestExpression(expr: DestructuringAssignmentRestExpression): void {
    this.text += '...';
    astVisit(expr.target, this);
  }

  public visitCustom(expr: CustomExpression): void {
    this.text += safeString(expr.value);
  }

  private writeArgs(args: readonly IsBindingBehavior[]): void {
    this.text += '(';
    for (let i = 0, length = args.length; i < length; ++i) {
      if (i !== 0) {
        this.text += ',';
      }
      astVisit(args[i], this);
    }
    this.text += ')';
  }
}
