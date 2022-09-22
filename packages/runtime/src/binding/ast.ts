import { emptyArray, isArrayIndex } from '@aurelia/kernel';
import { type IBinding } from '../observation';
import { Scope } from '../observation/binding-context';
import { ISignaler } from '../observation/signaler';
import { type IConnectableBinding } from './connectable';
import { safeString, isArray, isFunction, isString } from '../utilities-objects';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type {
  IBindingContext,
  IObservable,
  IConnectable,
  ISubscriber,
} from '../observation';

export const enum ExpressionKind {
  AccessThis,
  AccessScope,
  ArrayLiteral,
  ObjectLiteral,
  PrimitiveLiteral,
  Template,
  Unary,
  CallScope,
  CallMember,
  CallFunction,
  AccessMember,
  AccessKeyed,
  TaggedTemplate,
  Binary,
  Conditional,
  Assign,
  ArrowFunction,
  ValueConverter,
  BindingBehavior,
  ArrayBindingPattern,
  ObjectBindingPattern,
  BindingIdentifier,
  ForOfStatement,
  Interpolation,
  ArrayDestructuring,
  ObjectDestructuring,
  DestructuringAssignmentLeaf,
}

export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';

export type BinaryOperator = '??' | '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';

export type IsPrimary = AccessThisExpression | AccessScopeExpression | ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLiteral = ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLeftHandSide = IsPrimary | CallFunctionExpression | CallMemberExpression | CallScopeExpression | AccessMemberExpression | AccessKeyedExpression | TaggedTemplateExpression;
export type IsUnary = IsLeftHandSide | UnaryExpression;
export type IsBinary = IsUnary | BinaryExpression;
export type IsConditional = IsBinary | ConditionalExpression;
export type IsAssign = IsConditional | AssignExpression | ArrowFunction;
export type IsValueConverter = IsAssign | ValueConverterExpression;
export type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
export type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
export type IsExpression = IsBindingBehavior | Interpolation;
export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
export type AnyBindingExpression = Interpolation | ForOfStatement | IsBindingBehavior;

export interface IExpressionHydrator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hydrate(jsonExpr: any): any;
}

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
}

export class Unparser implements IVisitor<void> {
  public text: string = '';

  public static unparse(expr: IsExpressionOrStatement): string {
    const visitor = new Unparser();
    expr.accept(visitor);
    return visitor.text;
  }

  public visitAccessMember(expr: AccessMemberExpression): void {
    expr.object.accept(this);
    this.text += `${expr.optional ? '?' : ''}.${expr.name}`;
  }

  public visitAccessKeyed(expr: AccessKeyedExpression): void {
    expr.object.accept(this);
    this.text += `${expr.optional ? '?.' : ''}[`;
    expr.key.accept(this);
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
      elements[i].accept(this);
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
    expr.body.accept(this);
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
      values[i].accept(this);
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
    expr.func.accept(this);
    this.text += expr.optional ? '?.' : '';
    this.writeArgs(expr.args);
    this.text += ')';
  }

  public visitCallMember(expr: CallMemberExpression): void {
    this.text += '(';
    expr.object.accept(this);
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
      expressions[i].accept(this);
      this.text += cooked[i + 1];
    }
    this.text += '`';
  }

  public visitTaggedTemplate(expr: TaggedTemplateExpression): void {
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

  public visitUnary(expr: UnaryExpression): void {
    this.text += `(${expr.operation}`;
    if (expr.operation.charCodeAt(0) >= /* a */97) {
      this.text += ' ';
    }
    expr.expression.accept(this);
    this.text += ')';
  }

  public visitBinary(expr: BinaryExpression): void {
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

  public visitConditional(expr: ConditionalExpression): void {
    this.text += '(';
    expr.condition.accept(this);
    this.text += '?';
    expr.yes.accept(this);
    this.text += ':';
    expr.no.accept(this);
    this.text += ')';
  }

  public visitAssign(expr: AssignExpression): void {
    this.text += '(';
    expr.target.accept(this);
    this.text += '=';
    expr.value.accept(this);
    this.text += ')';
  }

  public visitValueConverter(expr: ValueConverterExpression): void {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `|${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
  }

  public visitBindingBehavior(expr: BindingBehaviorExpression): void {
    const args = expr.args;
    expr.expression.accept(this);
    this.text += `&${expr.name}`;
    for (let i = 0, length = args.length; i < length; ++i) {
      this.text += ':';
      args[i].accept(this);
    }
  }

  public visitArrayBindingPattern(expr: ArrayBindingPattern): void {
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

  public visitObjectBindingPattern(expr: ObjectBindingPattern): void {
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

  public visitBindingIdentifier(expr: BindingIdentifier): void {
    this.text += expr.name;
  }

  public visitForOfStatement(expr: ForOfStatement): void {
    expr.declaration.accept(this);
    this.text += ' of ';
    expr.iterable.accept(this);
  }

  public visitInterpolation(expr: Interpolation): void {
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
          item.accept(this);
          break;
        case ExpressionKind.ArrayDestructuring:
        case ExpressionKind.ObjectDestructuring: {
          const source = item.source;
          if(source) {
            source.accept(this);
            this.text += ':';
          }
          item.accept(this);
          break;
        }
      }
    }
    this.text += isObjDes ? '}' : ']';
  }

  public visitDestructuringAssignmentSingleExpression(expr: DestructuringAssignmentSingleExpression): void {
    expr.source.accept(this);
    this.text += ':';
    expr.target.accept(this);
    const initializer = expr.initializer;
    if(initializer !== void 0) {
      this.text +='=';
      initializer.accept(this);
    }
  }

  public visitDestructuringAssignmentRestExpression(expr: DestructuringAssignmentRestExpression): void {
    this.text += '...';
    expr.accept(this);
  }

  private writeArgs(args: readonly IsBindingBehavior[]): void {
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

/**
 * An interface describing the object that can evaluate Aurelia AST
 */
export interface IAstEvaluator {
  /** describe whether the evaluator wants to evaluate in strict mode */
  strict?: boolean;
  /** describe whether the evaluator wants a bound function to be returned, in case the returned value is a function */
  boundFn?: boolean;
  /** describe whether the evaluator wants to evaluate the function call in strict mode */
  strictFnCall?: boolean;
  /** Allow an AST to retrieve a service that it needs */
  get?: IServiceLocator['get'];
  /** Allow an AST to retrieve a value converter that it needs */
  getConverter?<T>(name: string): ValueConverterInstance<T> | undefined;
  /** Allow an AST to retrieve a binding behavior that it needs */
  getBehavior?<T>(name: string): BindingBehaviorInstance<T> | undefined;
}

type BindingWithBehavior = IConnectableBinding & { [key: string]: BindingBehaviorInstance | undefined };

export class CustomExpression {
  public constructor(
    public readonly value: string,
  ) {}

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): string {
    return this.value;
  }
}

export type BindingBehaviorInstance<T extends {} = {}> = {
  type?: 'instance' | 'factory';
  bind?(scope: Scope, binding: IBinding, ...args: T[]): void;
  unbind?(scope: Scope, binding: IBinding, ...args: T[]): void;
} & T;

export class BindingBehaviorExpression {
  public get $kind(): ExpressionKind.BindingBehavior { return ExpressionKind.BindingBehavior; }
  public get hasBind(): true { return true; }
  public get hasUnbind(): true { return true; }
  /**
   * The name of the property to store a binding behavior on the binding when binding
   *
   * @internal
   */
  private readonly _key: string;

  public constructor(
    public readonly expression: IsBindingBehavior,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
    this._key = `_bb_${name}`;
  }

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    return this.expression.evaluate(s, e, c);
  }

  public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
    return this.expression.assign(s, e, val);
  }

  public bind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
    const name = this.name;
    const key = this._key;
    const behavior = b.getBehavior?.<BindingBehaviorInstance>(name);
    if (behavior == null) {
      throw behaviorNotFoundError(name);
    }
    if ((b as BindingWithBehavior)[key] === void 0) {
      (b as BindingWithBehavior)[key] = behavior;
      behavior.bind?.(s, b, ...this.args.map(a => a.evaluate(s, b, null) as {}[]));
    } else {
      throw duplicateBehaviorAppliedError(name);
    }
    if (this.expression.hasBind) {
      this.expression.bind(s, b);
    }
  }

  public unbind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
    const internalKey = this._key;
    const $b = b as BindingWithBehavior;
    if ($b[internalKey] !== void 0) {
      $b[internalKey]!.unbind?.(s, b);
      $b[internalKey] = void 0;
    }
    if (this.expression.hasUnbind) {
      this.expression.unbind(s, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingBehavior(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

const behaviorNotFoundError = (name: string) =>
  __DEV__
    ? new Error(`AUR0101: BindingBehavior '${name}' could not be found. Did you forget to register it as a dependency?`)
    : new Error(`AUR0101:${name}`);
const duplicateBehaviorAppliedError = (name: string) =>
  __DEV__
    ? new Error(`AUR0102: BindingBehavior '${name}' already applied.`)
    : new Error(`AUR0102:${name}`);

export type ValueConverterInstance<T extends {} = {}> = {
  signals?: string[];
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
} & T;

export class ValueConverterExpression {
  public get $kind(): ExpressionKind.ValueConverter { return ExpressionKind.ValueConverter; }
  public get hasBind(): true { return true; }
  public get hasUnbind(): true { return true; }

  public constructor(
    public readonly expression: IsValueConverter,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
  }

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const name = this.name;
    const vc = e?.getConverter?.(name);
    if (vc == null) {
      throw converterNotFoundError(name);
    }
    if ('toView' in vc) {
      return vc.toView(this.expression.evaluate(s, e, c), ...this.args.map(a => a.evaluate(s, e, c)));
    }
    return this.expression.evaluate(s, e, c);
  }

  public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
    const name = this.name;
    const vc = e?.getConverter?.<ValueConverterExpression & ValueConverterInstance>(name);
    if (vc == null) {
      throw converterNotFoundError(name);
    }
    if ('fromView' in vc) {
      val = vc.fromView!(val, ...this.args.map(a => a.evaluate(s, e, null)));
    }
    return this.expression.assign(s, e, val);
  }

  public bind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
    const name = this.name;
    const vc = b.getConverter?.(name);
    if (vc == null) {
      throw converterNotFoundError(name);
    }
    // note: the cast is expected. To connect, it just needs to be a IConnectable
    // though to work with signal, it needs to have `handleChange`
    // so having `handleChange` as a guard in the connectable as a safe measure is needed
    // to make sure signaler works
    const signals = vc.signals;
    if (signals != null) {
      const signaler = b.get?.(ISignaler);
      const ii = signals.length;
      let i = 0;
      for (; i < ii; ++i) {
        // todo: signaler api
        signaler?.addSignalListener(signals[i], b);
      }
    }
    if (this.expression.hasBind) {
      this.expression.bind(s, b);
    }
  }

  public unbind(_s: Scope, b: IAstEvaluator & IConnectableBinding): void {
    const vc = b.getConverter?.(this.name);
    if (vc?.signals === void 0) {
      return;
    }
    const signaler = b.get(ISignaler);
    let i = 0;
    for (; i < vc.signals.length; ++i) {
      // the cast is correct, as the value converter expression would only add
      // a IConnectable that also implements `ISubscriber` interface to the signaler
      signaler.removeSignalListener(vc.signals[i], b as unknown as ISubscriber);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitValueConverter(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

const converterNotFoundError = (name: string) => {
  if (__DEV__)
    return new Error(`AUR0103: ValueConverter '${name}' could not be found. Did you forget to register it as a dependency?`);
  else
    return new Error(`AUR0103:${name}`);
};

export class AssignExpression {
  public get $kind(): ExpressionKind.Assign { return ExpressionKind.Assign; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly target: IsAssignable,
    public readonly value: IsAssign,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    return this.target.assign(s, e, this.value.evaluate(s, e, c));
  }

  public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
    this.value.assign(s, e, val);
    return this.target.assign(s, e, val);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAssign(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class ConditionalExpression {
  public get $kind(): ExpressionKind.Conditional { return ExpressionKind.Conditional; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly condition: IsBinary,
    public readonly yes: IsAssign,
    public readonly no: IsAssign,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return this.condition.evaluate(s, e, c) ? this.yes.evaluate(s, e, c) : this.no.evaluate(s, e, c);
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitConditional(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class AccessThisExpression {
  public static readonly $this: AccessThisExpression = new AccessThisExpression(0);
  public static readonly $parent: AccessThisExpression = new AccessThisExpression(1);
  public get $kind(): ExpressionKind.AccessThis { return ExpressionKind.AccessThis; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly ancestor: number = 0,
  ) {}

  public evaluate(s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): IBindingContext | undefined {
    let currentScope: Scope | null = s;
    let i = this.ancestor;
    while (i-- && currentScope) {
      currentScope = currentScope.parentScope;
    }
    return i < 1 && currentScope ? currentScope.bindingContext : void 0;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessThis(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class AccessScopeExpression {
  public get $kind(): ExpressionKind.AccessScope { return ExpressionKind.AccessScope; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly name: string,
    public readonly ancestor: number = 0,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const obj = Scope.getContext(s, this.name, this.ancestor) as IBindingContext;
    if (c !== null) {
      c.observe(obj, this.name);
    }
    const evaluatedValue = obj[this.name] as ReturnType<AccessScopeExpression['evaluate']>;
    if (evaluatedValue == null && this.name === '$host') {
      if (__DEV__)
        throw new Error(`AUR0105: Unable to find $host context. Did you forget [au-slot] attribute?`);
      else
        throw new Error(`AUR0105`);
    }
    if (e?.strict) {
      // return evaluatedValue;
      return e?.boundFn && isFunction(evaluatedValue)
        ? evaluatedValue.bind(obj)
        : evaluatedValue;
    }
    return evaluatedValue == null
      ? ''
      : e?.boundFn && isFunction(evaluatedValue)
        ? evaluatedValue.bind(obj)
        : evaluatedValue;
  }

  public assign(s: Scope, _e: IAstEvaluator | null, val: unknown): unknown {
    if (this.name === '$host') {
      if (__DEV__)
        throw new Error(`AUR0106: Invalid assignment. $host is a reserved keyword.`);
      else
        throw new Error(`AUR0106`);
    }
    const obj = Scope.getContext(s, this.name, this.ancestor) as IObservable;
    if (obj instanceof Object) {
      if (obj.$observers?.[this.name] !== void 0) {
        obj.$observers[this.name].setValue(val);
        return val;
      } else {
        return obj[this.name] = val;
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessScope(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class AccessMemberExpression {
  public get $kind(): ExpressionKind.AccessMember { return ExpressionKind.AccessMember; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
    public readonly optional: boolean = false,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const instance = this.object.evaluate(s, e, c) as IIndexable;
    let ret: unknown;
    if (e?.strict) {
      if (instance == null) {
        return instance;
      }
      if (c !== null) {
        c.observe(instance, this.name);
      }
      ret = instance[this.name];
      if (e?.boundFn && isFunction(ret)) {
        return ret.bind(instance);
      }
      return ret;
    }
    if (c !== null && instance instanceof Object) {
      c.observe(instance, this.name);
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (instance) {
      ret = instance[this.name];
      if (e?.boundFn && isFunction(ret)) {
        return ret.bind(instance);
      }
      return ret;
    }
    return '';
  }

  public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
    const obj = this.object.evaluate(s, e, null) as IObservable;
    if (obj instanceof Object) {
      if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
        obj.$observers[this.name].setValue(val);
      } else {
        obj[this.name] = val;
      }
    } else {
      this.object.assign(s, e, { [this.name]: val });
    }
    return val;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessMember(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class AccessKeyedExpression {
  public get $kind(): ExpressionKind.AccessKeyed { return ExpressionKind.AccessKeyed; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly key: IsAssign,
    public readonly optional: boolean = false,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const instance = this.object.evaluate(s, e, c) as IIndexable;
    if (instance instanceof Object) {
      const key = this.key.evaluate(s, e, c) as string;
      if (c !== null) {
        c.observe(instance, key);
      }
      return instance[key];
    }
    return void 0;
  }

  public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
    const instance = this.object.evaluate(s, e, null) as IIndexable;
    const key = this.key.evaluate(s, e, null) as string;
    return instance[key] = val;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessKeyed(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class CallScopeExpression {
  public get $kind(): ExpressionKind.CallScope { return ExpressionKind.CallScope; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly name: string,
    public readonly args: readonly IsAssign[],
    public readonly ancestor: number = 0,
    public readonly optional: boolean = false,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const args = this.args.map(a => a.evaluate(s, e, c));
    const context = Scope.getContext(s, this.name, this.ancestor)!;
    // ideally, should observe property represents by this.name as well
    // because it could be changed
    // todo: did it ever surprise anyone?
    const func = getFunction(e?.strictFnCall, context, this.name);
    if (func) {
      return func.apply(context, args);
    }
    return void 0;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallScope(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

const autoObserveArrayMethods =
  'at map filter includes indexOf lastIndexOf findIndex find flat flatMap join reduce reduceRight slice every some sort'.split(' ');
// sort,      // bad supported, self mutation + unclear dependency

// push,      // not supported, self mutation + unclear dependency
// pop,       // not supported, self mutation + unclear dependency
// shift,     // not supported, self mutation + unclear dependency
// splice,    // not supported, self mutation + unclear dependency
// unshift,   // not supported, self mutation + unclear dependency
// reverse,   // not supported, self mutation + unclear dependency

// keys,    // not meaningful in template
// values,  // not meaningful in template
// entries, // not meaningful in template

export class CallMemberExpression {
  public get $kind(): ExpressionKind.CallMember { return ExpressionKind.CallMember; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
    public readonly optionalMember: boolean = false,
    public readonly optionalCall: boolean = false,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const instance = this.object.evaluate(s, e, c) as IIndexable;

    const args = this.args.map(a => a.evaluate(s, e, c));
    const func = getFunction(e?.strictFnCall, instance, this.name);
    if (func) {
      const ret = func.apply(instance, args);
      // todo(doc): investigate & document in engineering doc the difference
      //            between observing before/after func.apply
      if (isArray(instance) && autoObserveArrayMethods.includes(this.name)) {
        c?.observeCollection(instance);
      }
      return ret;
    }
    return void 0;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallMember(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class CallFunctionExpression {
  public get $kind(): ExpressionKind.CallFunction { return ExpressionKind.CallFunction; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly func: IsLeftHandSide,
    public readonly args: readonly IsAssign[],
    public readonly optional: boolean = false,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const func = this.func.evaluate(s, e, c);
    if (isFunction(func)) {
      return func(...this.args.map(a => a.evaluate(s, e, c)));
    }
    if (!e?.strictFnCall && func == null) {
      return void 0;
    }
    if (__DEV__)
      throw new Error(`AUR0107: Expression is not a function.`);
    else
      throw new Error(`AUR0107`);
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallFunction(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class BinaryExpression {
  public get $kind(): ExpressionKind.Binary { return ExpressionKind.Binary; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly operation: BinaryOperator,
    public readonly left: IsBinary,
    public readonly right: IsBinary,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    switch (this.operation) {
      case '&&':
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return this.left.evaluate(s, e, c) && this.right.evaluate(s, e, c);
      case '||':
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return this.left.evaluate(s, e, c) || this.right.evaluate(s, e, c);
      case '??':
        return this.left.evaluate(s, e, c) ?? this.right.evaluate(s, e, c);
      case '==':
        // eslint-disable-next-line eqeqeq
        return this.left.evaluate(s, e, c) == this.right.evaluate(s, e, c);
      case '===':
        return this.left.evaluate(s, e, c) === this.right.evaluate(s, e, c);
      case '!=':
        // eslint-disable-next-line eqeqeq
        return this.left.evaluate(s, e, c) != this.right.evaluate(s, e, c);
      case '!==':
        return this.left.evaluate(s, e, c) !== this.right.evaluate(s, e, c);
      case 'instanceof': {
        const right = this.right.evaluate(s, e, c);
        if (isFunction(right)) {
          return this.left.evaluate(s, e, c) instanceof right;
        }
        return false;
      }
      case 'in': {
        const right = this.right.evaluate(s, e, c);
        if (right instanceof Object) {
          return this.left.evaluate(s, e, c) as string in right;
        }
        return false;
      }
      // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
      // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
      // this makes bugs in user code easier to track down for end users
      // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
      case '+': {
        const left: unknown = this.left.evaluate(s, e, c);
        const right: unknown = this.right.evaluate(s, e, c);

        if (e?.strict) {
          return (left as number) + (right as number);
        }

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!left || !right) {
          if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
            return (left as number || 0) + (right as number || 0);
          }
          if (isStringOrDate(left) || isStringOrDate(right)) {
            return (left as string || '') + (right as string || '');
          }
        }
        return (left as number) + (right as number);
      }
      case '-':
        return (this.left.evaluate(s, e, c) as number) - (this.right.evaluate(s, e, c) as number);
      case '*':
        return (this.left.evaluate(s, e, c) as number) * (this.right.evaluate(s, e, c) as number);
      case '/':
        return (this.left.evaluate(s, e, c) as number) / (this.right.evaluate(s, e, c) as number);
      case '%':
        return (this.left.evaluate(s, e, c) as number) % (this.right.evaluate(s, e, c) as number);
      case '<':
        return (this.left.evaluate(s, e, c) as number) < (this.right.evaluate(s, e, c) as number);
      case '>':
        return (this.left.evaluate(s, e, c) as number) > (this.right.evaluate(s, e, c) as number);
      case '<=':
        return (this.left.evaluate(s, e, c) as number) <= (this.right.evaluate(s, e, c) as number);
      case '>=':
        return (this.left.evaluate(s, e, c) as number) >= (this.right.evaluate(s, e, c) as number);
      default:
        if (__DEV__)
          throw new Error(`AUR0108: Unknown binary operator: '${this.operation}'`);
        else
          throw new Error(`AUR0108:${this.operation}`);
    }
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBinary(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class UnaryExpression {
  public get $kind(): ExpressionKind.Unary { return ExpressionKind.Unary; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly operation: UnaryOperator,
    public readonly expression: IsLeftHandSide,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    switch (this.operation) {
      case 'void':
        return void this.expression.evaluate(s, e, c);
      case 'typeof':
        return typeof this.expression.evaluate(s, e, c);
      case '!':
        return !(this.expression.evaluate(s, e, c) as boolean);
      case '-':
        return -(this.expression.evaluate(s, e, c) as number);
      case '+':
        return +(this.expression.evaluate(s, e, c) as number);
      default:
        if (__DEV__)
          throw new Error(`AUR0109: Unknown unary operator: '${this.operation}'`);
        else
          throw new Error(`AUR0109:${this.operation}`);
    }
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitUnary(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}
export class PrimitiveLiteralExpression<TValue extends null | undefined | number | boolean | string = null | undefined | number | boolean | string> {
  public static readonly $undefined: PrimitiveLiteralExpression<undefined> = new PrimitiveLiteralExpression<undefined>(void 0);
  public static readonly $null: PrimitiveLiteralExpression<null> = new PrimitiveLiteralExpression<null>(null);
  public static readonly $true: PrimitiveLiteralExpression<true> = new PrimitiveLiteralExpression<true>(true);
  public static readonly $false: PrimitiveLiteralExpression<false> = new PrimitiveLiteralExpression<false>(false);
  public static readonly $empty: PrimitiveLiteralExpression<string> = new PrimitiveLiteralExpression<''>('');
  public get $kind(): ExpressionKind.PrimitiveLiteral { return ExpressionKind.PrimitiveLiteral; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly value: TValue,
  ) {}

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): TValue {
    return this.value;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitPrimitiveLiteral(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class ArrayLiteralExpression {
  public static readonly $empty: ArrayLiteralExpression = new ArrayLiteralExpression(emptyArray);
  public get $kind(): ExpressionKind.ArrayLiteral { return ExpressionKind.ArrayLiteral; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly elements: readonly IsAssign[],
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): readonly unknown[] {
    return this.elements.map(el => el.evaluate(s, e, c));
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayLiteral(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class ObjectLiteralExpression {
  public static readonly $empty: ObjectLiteralExpression = new ObjectLiteralExpression(emptyArray, emptyArray);
  public get $kind(): ExpressionKind.ObjectLiteral { return ExpressionKind.ObjectLiteral; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly keys: readonly (number | string)[],
    public readonly values: readonly IsAssign[],
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): Record<string, unknown> {
    const instance: Record<string, unknown> = {};
    for (let i = 0; i < this.keys.length; ++i) {
      instance[this.keys[i]] = this.values[i].evaluate(s, e, c);
    }
    return instance;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectLiteral(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class TemplateExpression {
  public static readonly $empty: TemplateExpression = new TemplateExpression(['']);
  public get $kind(): ExpressionKind.Template { return ExpressionKind.Template; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly cooked: readonly string[],
    public readonly expressions: readonly IsAssign[] = emptyArray,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): string {
    let result = this.cooked[0];
    for (let i = 0; i < this.expressions.length; ++i) {
      result += safeString(this.expressions[i].evaluate(s, e, c));
      result += this.cooked[i + 1];
    }
    return result;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTemplate(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class TaggedTemplateExpression {
  public get $kind(): ExpressionKind.TaggedTemplate { return ExpressionKind.TaggedTemplate; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly cooked: readonly string[] & { raw?: readonly string[] },
    raw: readonly string[],
    public readonly func: IsLeftHandSide,
    public readonly expressions: readonly IsAssign[] = emptyArray,
  ) {
    cooked.raw = raw;
  }

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): string {
    const results = this.expressions.map(el => el.evaluate(s, e, c));
    const func = this.func.evaluate(s, e, c);
    if (!isFunction(func)) {
      if (__DEV__)
        throw new Error(`AUR0110: Left-hand side of tagged template expression is not a function.`);
      else
        throw new Error(`AUR0110`);
    }
    return func(this.cooked, ...results);
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTaggedTemplate(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class ArrayBindingPattern {
  public get $kind(): ExpressionKind.ArrayBindingPattern { return ExpressionKind.ArrayBindingPattern; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  // We'll either have elements, or keys+values, but never all 3
  public constructor(
    public readonly elements: readonly IsAssign[],
  ) {}

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): unknown {
    // TODO: this should come after batch
    // as a destructuring expression like [x, y] = value
    //
    // should only trigger change only once:
    // batch(() => {
    //   object.x = value[0]
    //   object.y = value[1]
    // })
    //
    // instead of twice:
    // object.x = value[0]
    // object.y = value[1]
    return void 0;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    // TODO
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayBindingPattern(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class ObjectBindingPattern {
  public get $kind(): ExpressionKind.ObjectBindingPattern { return ExpressionKind.ObjectBindingPattern; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  // We'll either have elements, or keys+values, but never all 3
  public constructor(
    public readonly keys: readonly (string | number)[],
    public readonly values: readonly IsAssign[],
  ) {}

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): unknown {
    // TODO
    // similar to array binding ast, this should only come after batch
    // for a single notification per destructing,
    // regardless number of property assignments on the scope binding context
    return void 0;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    // TODO
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectBindingPattern(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class BindingIdentifier {
  public get $kind(): ExpressionKind.BindingIdentifier { return ExpressionKind.BindingIdentifier; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly name: string,
  ) {}

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): string {
    return this.name;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingIdentifier(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement {
  public get $kind(): ExpressionKind.ForOfStatement { return ExpressionKind.ForOfStatement; }
  public get hasBind(): true { return true; }
  public get hasUnbind(): true { return true; }

  public constructor(
    public readonly declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression,
    public readonly iterable: IsBindingBehavior,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    return this.iterable.evaluate(s, e, c);
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public bind(s: Scope, b: IConnectableBinding): void {
    if (this.iterable.hasBind) {
      this.iterable.bind(s, b);
    }
  }

  public unbind(s: Scope, b: IConnectableBinding): void {
    if (this.iterable.hasUnbind) {
      this.iterable.unbind(s, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitForOfStatement(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
export class Interpolation {
  public get $kind(): ExpressionKind.Interpolation { return ExpressionKind.Interpolation; }
  public readonly isMulti: boolean;
  public readonly firstExpression: IsBindingBehavior;
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly parts: readonly string[],
    public readonly expressions: readonly IsBindingBehavior[] = emptyArray,
  ) {
    this.isMulti = expressions.length > 1;
    this.firstExpression = expressions[0];
  }

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): string {
    if (this.isMulti) {
      let result = this.parts[0];
      let i = 0;
      for (; i < this.expressions.length; ++i) {
        result += safeString(this.expressions[i].evaluate(s, e, c));
        result += this.parts[i + 1];
      }
      return result;
    } else {
      return `${this.parts[0]}${this.firstExpression.evaluate(s, e, c)}${this.parts[1]}`;
    }
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _obj: unknown): unknown {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitInterpolation(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

// spec: https://tc39.es/ecma262/#sec-destructuring-assignment
/** This is an internal API */
export class DestructuringAssignmentExpression {
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }
  public constructor(
    public readonly $kind: ExpressionKind.ArrayDestructuring | ExpressionKind.ObjectDestructuring,
    public readonly list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[],
    public readonly source: AccessMemberExpression | AccessKeyedExpression | undefined,
    public readonly initializer: IsBindingBehavior | undefined,
  ) { }

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): undefined {
    return void 0;
  }

  public assign(s: Scope, l: IAstEvaluator, value: unknown): void {
    const list = this.list;
    const len = list.length;
    let i: number;
    let item: DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
    for (i = 0; i < len; i++) {
      item = list[i];
      switch(item.$kind) {
        case ExpressionKind.DestructuringAssignmentLeaf:
          item.assign(s, l, value);
          break;
        case ExpressionKind.ArrayDestructuring:
        case ExpressionKind.ObjectDestructuring: {
          if (typeof value !== 'object' || value === null) {
            if (__DEV__) {
              throw new Error(`AUR0112: Cannot use non-object value for destructuring assignment.`);
            } else {
              throw new Error(`AUR0112`);
            }
          }
          let source = item.source!.evaluate(Scope.create(value), l, null);
          if(source === void 0) {
            source = item.initializer?.evaluate(s, l, null);
          }
          item.assign(s, l, source);
          break;
        }
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitDestructuringAssignmentExpression(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

/** This is an internal API */
export class DestructuringAssignmentSingleExpression {
  public get $kind(): ExpressionKind.DestructuringAssignmentLeaf { return ExpressionKind.DestructuringAssignmentLeaf; }
  public constructor(
    public readonly target: AccessMemberExpression,
    public readonly source: AccessMemberExpression | AccessKeyedExpression,
    public readonly initializer: IsBindingBehavior | undefined,
  ) { }

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): undefined {
    return void 0;
  }

  public assign(s: Scope, l: IAstEvaluator, value: unknown): void {
    if(value == null) { return; }
    if (typeof value !== 'object') {
      if (__DEV__) {
        throw new Error(`AUR0112: Cannot use non-object value for destructuring assignment.`);
      } else {
        throw new Error(`AUR0112`);
      }
    }
    let source = this.source.evaluate(Scope.create(value), l, null);
    if(source === void 0) {
      source = this.initializer?.evaluate(s, l, null);
    }
    this.target.assign(s, l, source);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitDestructuringAssignmentSingleExpression(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

/** This is an internal API */
export class DestructuringAssignmentRestExpression {
  public get $kind(): ExpressionKind.DestructuringAssignmentLeaf { return ExpressionKind.DestructuringAssignmentLeaf; }
  public constructor(
    public readonly target: AccessMemberExpression,
    public readonly indexOrProperties: string[] | number,
  ) { }

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): undefined {
    return void 0;
  }

  public assign(s: Scope, l: IAstEvaluator, value: unknown): void {
    if(value == null) { return; }
    if (typeof value !== 'object') {
      if (__DEV__) {
        throw new Error(`AUR0112: Cannot use non-object value for destructuring assignment.`);
      } else {
        throw new Error(`AUR0112`);
      }
    }

    const indexOrProperties = this.indexOrProperties;

    let restValue: Record<string, unknown> | unknown[];
    if (isArrayIndex(indexOrProperties)) {
      if (!Array.isArray(value)) {
        if (__DEV__) {
          throw new Error(`AUR0112: Cannot use non-array value for array-destructuring assignment.`);
        } else {
          throw new Error(`AUR0112`);
        }
      }
      restValue = value.slice(indexOrProperties);
    } else {
      restValue = Object
          .entries(value)
          .reduce((acc, [k, v]) => {
            if (!indexOrProperties.includes(k)) { acc[k] = v; }
            return acc;
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          }, {} as Record<string, unknown>);
    }
    this.target.assign(s, l, restValue);
  }

  public accept<T>(_visitor: IVisitor<T>): T {
    return _visitor.visitDestructuringAssignmentRestExpression(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

export class ArrowFunction {
  public get $kind(): ExpressionKind.ArrowFunction { return ExpressionKind.ArrowFunction; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public args: BindingIdentifier[],
    public body: IsAssign,
    public rest: boolean = false,
  ) {}

  public evaluate(s: Scope, e: IAstEvaluator | null, c: IConnectable | null): unknown {
    const func = (...args: unknown[]) => {
      const params = this.args;
      const rest = this.rest;
      const lastIdx = params.length - 1;
      const context = params.reduce<IIndexable>((map, param, i) => {
        if (rest && i === lastIdx) {
          map[param.name] = args.slice(i);
        } else {
          map[param.name] = args[i];
        }
        return map;
      }, {});
      const functionScope = Scope.fromParent(s, context);
      return this.body.evaluate(functionScope, e, c);
    };
    return func;
  }

  public assign(_s: Scope, _e: IAstEvaluator | null, _value: unknown): void {
    return void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrowFunction(this);
  }

  public toString(): string {
    return Unparser.unparse(this);
  }
}

function getFunction(mustEvaluate: boolean | undefined, obj: object, name: string): ((...args: unknown[]) => unknown) | null {
  const func = obj == null ? null : (obj as IIndexable)[name];
  if (isFunction(func)) {
    return func as (...args: unknown[]) => unknown;
  }
  if (!mustEvaluate && func == null) {
    return null;
  }
  if (__DEV__)
    throw new Error(`AUR0111: Expected '${name}' to be a function`);
  else
    throw new Error(`AUR0111:${name}`);
}

/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isNumberOrBigInt(value: unknown): value is number | bigint {
  switch (typeof value) {
    case 'number':
    case 'bigint':
      return true;
    default:
      return false;
  }
}

/**
 * Determines if the value passed is a string or Date for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isStringOrDate(value: unknown): value is string | Date {
  switch (typeof value) {
    case 'string':
      return true;
    case 'object':
      return value instanceof Date;
    default:
      return false;
  }
}
