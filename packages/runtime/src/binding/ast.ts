import { IIndexable, IServiceLocator, PLATFORM, Reporter, StrictPrimitive } from '../../kernel';
import { Collection, IOverrideContext, IScope, LifecycleFlags, ObservedCollection } from '../observation';
import { IBinding } from './binding';
import { BindingBehaviorResource } from './binding-behavior';
import { BindingContext } from './binding-context';
import { IConnectableBinding } from './connectable';
import { ISignaler } from './signaler';
import { ValueConverterResource } from './value-converter';

/**
 * StrictAny is a somewhat strongly typed alternative to 'any', in an effort to try to get rid of all 'any''s
 * It's not even remotely foolproof however, and this can largely be attributed to the fact that TypeScript imposes
 * far more constraints on what arithmic is allowed than vanilla JS does.
 * We don't necessarily want to impose the same constraints on users (e.g. by performing auto conversions or throwing),
 * because even though that behavior would technically be "better", it could also be experienced as unpredictable.
 * We'd generally not want to ask more of users than to simply understand how vanilla JS works, and let them account for its quirks themselves.
 * This gives end users less framework-specific things to learn.
 * Consequently, it's impossible to achieve any kind of strict type checking in the AST and generally in the observers.
 * We're trying to achieve some middle ground by applying some explicit type casts where TypeScript would otherwise not allow compilation.
 */
export type StrictAny = StrictPrimitive | IIndexable | Function;
export type IsPrimary = AccessThis | AccessScope | ArrayLiteral | ObjectLiteral | PrimitiveLiteral | Template;
export type IsLiteral = ArrayLiteral | ObjectLiteral | PrimitiveLiteral | Template;
export type IsLeftHandSide = IsPrimary | CallFunction | CallMember | CallScope | AccessMember | AccessKeyed | TaggedTemplate;
export type IsUnary = IsLeftHandSide | Unary;
export type IsBinary = IsUnary | Binary;
export type IsConditional = IsBinary | Conditional;
export type IsAssign = IsConditional | Assign;
export type IsValueConverter = IsAssign | ValueConverter;
export type IsBindingBehavior = IsValueConverter | BindingBehavior;
export type IsAssignable = AccessScope | AccessKeyed | AccessMember | Assign;
export type IsExpression = IsBindingBehavior | Interpolation;
export type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | HtmlLiteral;
export type Connects = AccessScope | ArrayLiteral | ObjectLiteral | Template | Unary | CallScope | AccessMember | AccessKeyed | TaggedTemplate | Binary | Conditional | ValueConverter | BindingBehavior | ForOfStatement;
export type Observes = AccessScope | AccessKeyed | AccessMember;
export type CallsFunction = CallFunction | CallScope | CallMember | TaggedTemplate;
export type IsResource = ValueConverter | BindingBehavior;
export type HasBind = BindingBehavior;
export type HasUnbind = ValueConverter | BindingBehavior;
export type HasAncestor = AccessThis | AccessScope | CallScope;

// tslint:disable-next-line:no-any
export interface IVisitor<T = any> {
  visitAccessKeyed(expr: AccessKeyed): T;
  visitAccessMember(expr: AccessMember): T;
  visitAccessScope(expr: AccessScope): T;
  visitAccessThis(expr: AccessThis): T;
  visitArrayBindingPattern(expr: ArrayBindingPattern): T;
  visitArrayLiteral(expr: ArrayLiteral): T;
  visitAssign(expr: Assign): T;
  visitBinary(expr: Binary): T;
  visitBindingBehavior(expr: BindingBehavior): T;
  visitBindingIdentifier(expr: BindingIdentifier): T;
  visitCallFunction(expr: CallFunction): T;
  visitCallMember(expr: CallMember): T;
  visitCallScope(expr: CallScope): T;
  visitConditional(expr: Conditional): T;
  visitForOfStatement(expr: ForOfStatement): T;
  visitHtmlLiteral(expr: HtmlLiteral): T;
  visitInterpolation(expr: Interpolation): T;
  visitObjectBindingPattern(expr: ObjectBindingPattern): T;
  visitObjectLiteral(expr: ObjectLiteral): T;
  visitPrimitiveLiteral(expr: PrimitiveLiteral): T;
  visitTaggedTemplate(expr: TaggedTemplate): T;
  visitTemplate(expr: Template): T;
  visitUnary(expr: Unary): T;
  visitValueConverter(expr: ValueConverter): T;
}

export interface IExpression {
  readonly $kind: ExpressionKind;
  evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): StrictAny;
  connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
  accept<T>(visitor: IVisitor<T>): T;
  assign?(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, value: StrictAny): StrictAny;
  bind?(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
  unbind?(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}

export const enum ExpressionKind {
  Connects             = 0b000000000001_00000, // The expression's connect() function calls observeProperty and/or calls connect() on another expression that it wraps (all expressions except for AccessThis, PrimitiveLiteral, CallMember/Function and Assign)
  Observes             = 0b000000000010_00000, // The expression's connect() function calls observeProperty (only AccessScope, AccessMember and AccessKeyed do this)
  CallsFunction        = 0b000000000100_00000, // Calls a function (CallFunction, CallScope, CallMember, TaggedTemplate) -> needs a valid function object returning from its lefthandside's evaluate()
  HasAncestor          = 0b000000001000_00000, // Has an "ancestor" property, meaning the expression could climb up the context (only AccessThis, AccessScope and CallScope)
  IsPrimary            = 0b000000010000_00000, // Is a primary expression according to ES parsing rules
  IsLeftHandSide       = 0b000000100000_00000, // Is a left-hand side expression according to ES parsing rules, includes IsPrimary
  HasBind              = 0b000001000000_00000, // Has a bind() method (currently only BindingBehavior)
  HasUnbind            = 0b000010000000_00000, // Has an unbind() method (currentl only BindingBehavior and ValueConverter)
  IsAssignable         = 0b000100000000_00000, // Is an assignable expression according to ES parsing rules (only AccessScope, AccessMember, AccessKeyed ans Assign)
  IsLiteral            = 0b001000000000_00000, // Is an Aurelia resource (ValueConverter or BindingBehavior)
  IsResource           = 0b010000000000_00000, // Is literal expression (Primitive, Array, Object or Template)
  IsForDeclaration     = 0b100000000000_00000, // Is a For declaration (for..of, for..in -> currently only ForOfStatement)
  Type                 = 0b000000000000_11111, // Type mask to uniquely identify each AST class (concrete types start below)
  // ---------------------------------------------------------------------------------------------------------------------------
  AccessThis           = 0b000000111000_00001, //               HasAncestor
  AccessScope          = 0b000100111011_00010, // IsAssignable  HasAncestor       Observes  Connects
  ArrayLiteral         = 0b001000110001_00011, //                                           Connects
  ObjectLiteral        = 0b001000110001_00100, //                                           Connects
  PrimitiveLiteral     = 0b001000110000_00101, //
  Template             = 0b001000110001_00110, //                                           Connects
  Unary                = 0b000000000001_00111, //                                           Connects
  CallScope            = 0b000000101101_01000, //               HasAncestor  CallsFunction  Connects
  CallMember           = 0b000000100100_01001, //                            CallsFunction
  CallFunction         = 0b000000100100_01010, //                            CallsFunction
  AccessMember         = 0b000100100011_01011, // IsAssignable                    Observes  Connects
  AccessKeyed          = 0b000100100011_01100, // IsAssignable                    Observes  Connects
  TaggedTemplate       = 0b000000100101_01101, //                            CallsFunction  Connects
  Binary               = 0b000000000001_01110, //                                           Connects
  Conditional          = 0b000000000001_11111, //                                           Connects
  Assign               = 0b000100000000_10000, // IsAssignable
  ValueConverter       = 0b010010000001_10001, //                                           Connects
  BindingBehavior      = 0b010011000001_10010, //                                           Connects
  HtmlLiteral          = 0b000000000001_10011, //                                           Connects
  ArrayBindingPattern  = 0b100000000000_10100, //
  ObjectBindingPattern = 0b100000000000_10101, //
  BindingIdentifier    = 0b100000000000_10110, //
  ForOfStatement       = 0b000000000001_10111, //                                           Connects
  Interpolation        = 0b000000000000_11000  //
}

export function connects(expr: IsExpressionOrStatement): expr is Connects {
  return (expr.$kind & ExpressionKind.Connects) === ExpressionKind.Connects;
}
export function observes(expr: IsExpressionOrStatement): expr is Observes {
  return (expr.$kind & ExpressionKind.Observes) === ExpressionKind.Observes;
}
export function callsFunction(expr: IsExpressionOrStatement): expr is CallsFunction {
  return (expr.$kind & ExpressionKind.CallsFunction) === ExpressionKind.CallsFunction;
}
export function hasAncestor(expr: IsExpressionOrStatement): expr is HasAncestor {
  return (expr.$kind & ExpressionKind.HasAncestor) === ExpressionKind.HasAncestor;
}
export function isAssignable(expr: IsExpressionOrStatement): expr is IsAssignable {
  return (expr.$kind & ExpressionKind.IsAssignable) === ExpressionKind.IsAssignable;
}
export function isLeftHandSide(expr: IsExpressionOrStatement): expr is IsLeftHandSide {
  return (expr.$kind & ExpressionKind.IsLeftHandSide) === ExpressionKind.IsLeftHandSide;
}
export function isPrimary(expr: IsExpressionOrStatement): expr is IsPrimary {
  return (expr.$kind & ExpressionKind.IsPrimary) === ExpressionKind.IsPrimary;
}
export function isResource(expr: IsExpressionOrStatement): expr is IsResource {
  return (expr.$kind & ExpressionKind.IsResource) === ExpressionKind.IsResource;
}
export function hasBind(expr: IsExpressionOrStatement): expr is HasBind {
  return (expr.$kind & ExpressionKind.HasBind) === ExpressionKind.HasBind;
}
export function hasUnbind(expr: IsExpressionOrStatement): expr is HasUnbind {
  return (expr.$kind & ExpressionKind.HasUnbind) === ExpressionKind.HasUnbind;
}
export function isLiteral(expr: IsExpressionOrStatement): expr is IsLiteral {
  return (expr.$kind & ExpressionKind.IsLiteral) === ExpressionKind.IsLiteral;
}
export function arePureLiterals(expressions: ReadonlyArray<IsExpressionOrStatement> | undefined): expressions is IsLiteral[] {
  if (expressions === undefined || expressions.length === 0) {
    return true;
  }
  for (let i = 0; i < expressions.length; ++i) {
    if (!isPureLiteral(expressions[i])) {
      return false;
    }
  }
  return true;
}
export function isPureLiteral(expr: IsExpressionOrStatement): expr is IsLiteral {
  if (isLiteral(expr)) {
    switch (expr.$kind) {
      case ExpressionKind.ArrayLiteral:
        return arePureLiterals(expr.elements);
      case ExpressionKind.ObjectLiteral:
        return arePureLiterals(expr.values);
      case ExpressionKind.Template:
        return arePureLiterals(expr.expressions);
      case ExpressionKind.PrimitiveLiteral:
        return true;
    }
  }
  return false;
}

const enum RuntimeError {
  NoLocator = 202,
  NoBehaviorFound = 203,
  BehaviorAlreadyApplied = 204,
  NoConverterFound = 205,
  NoBinding = 206,
  NotAFunction = 207,
  UnknownOperator = 208,
  UndefinedScope = 250, // trying to evaluate on something that's not a valid binding
  NullScope = 251, // trying to evaluate on an unbound binding
}

export class BindingBehavior implements IExpression {
  public $kind: ExpressionKind.BindingBehavior;
  public readonly expression: IsBindingBehavior;
  public readonly name: string;
  public readonly args: ReadonlyArray<IsAssign>;
  public readonly behaviorKey: string;
  private readonly expressionHasBind: boolean;
  private readonly expressionHasUnbind: boolean;

  constructor(expression: IsBindingBehavior, name: string, args: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.BindingBehavior;
    this.expression = expression;
    this.name = name;
    this.args = args;
    this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
    this.expressionHasBind = hasBind(expression);
    this.expressionHasUnbind = hasUnbind(expression);
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    return this.expression.evaluate(flags, scope, locator);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny {
    return this.expression.assign(flags, scope, locator, value);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    this.expression.connect(flags, scope, binding);
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    if (scope === undefined) {
      throw Reporter.error(RuntimeError.UndefinedScope, this);
    }
    if (scope === null) {
      throw Reporter.error(RuntimeError.NullScope, this);
    }
    if (!binding) {
      throw Reporter.error(RuntimeError.NoBinding, this);
    }
    const locator = binding.locator;
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    if (this.expressionHasBind) {
      (this.expression as BindingBehavior).bind(flags, scope, binding);
    }
    const behaviorKey = this.behaviorKey;
    const behavior = locator.get<BindingBehavior>(behaviorKey);
    if (!behavior) {
      throw Reporter.error(RuntimeError.NoBehaviorFound, this);
    }
    if (binding[behaviorKey] !== undefined && binding[behaviorKey] !== null) {
      throw Reporter.error(RuntimeError.BehaviorAlreadyApplied, this);
    }
    binding[behaviorKey] = behavior;
    behavior.bind.apply(behavior, (<StrictAny[]>[flags, scope, binding]).concat(evalList(flags, scope, locator, this.args)));
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const behaviorKey = this.behaviorKey;
    binding[behaviorKey].unbind(flags, scope, binding);
    binding[behaviorKey] = null;
    if (this.expressionHasUnbind) {
      (this.expression as BindingBehavior | ValueConverter).unbind(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingBehavior(this);
  }
}

export class ValueConverter implements IExpression {
  public $kind: ExpressionKind.ValueConverter;
  public readonly expression: IsValueConverter;
  public readonly name: string;
  public readonly args: ReadonlyArray<IsAssign>;
  public readonly converterKey: string;

  constructor(expression: IsValueConverter, name: string, args: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.ValueConverter;
    this.expression = expression;
    this.name = name;
    this.args = args;
    this.converterKey = ValueConverterResource.keyFrom(this.name);
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    const converter = locator.get<ValueConverter & { toView(...args: (StrictAny)[]): StrictAny }>(this.converterKey);
    if (!converter) {
      throw Reporter.error(RuntimeError.NoConverterFound, this);
    }
    if ('toView' in converter) {
      const args = this.args;
      const len = args.length;
      const result = Array(len + 1);
      result[0] = this.expression.evaluate(flags, scope, locator);
      for (let i = 0; i < len; ++i) {
        result[i + 1] = args[i].evaluate(flags, scope, locator);
      }
      return converter.toView.apply(converter, result);
    }
    return this.expression.evaluate(flags, scope, locator);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny {
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    const converter = locator.get<ValueConverter & { fromView(...args: (StrictAny)[]): StrictAny }>(this.converterKey);
    if (!converter) {
      throw Reporter.error(RuntimeError.NoConverterFound, this);
    }
    if ('fromView' in converter) {
      value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
    }
    return this.expression.assign(flags, scope, locator, value);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    if (scope === undefined) {
      throw Reporter.error(RuntimeError.UndefinedScope, this);
    }
    if (scope === null) {
      throw Reporter.error(RuntimeError.NullScope, this);
    }
    if (!binding) {
      throw Reporter.error(RuntimeError.NoBinding, this);
    }
    const locator = binding.locator;
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    this.expression.connect(flags, scope, binding);
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding);
    }
    const converter = locator.get(this.converterKey) as { signals?: string[] };
    if (!converter) {
      throw Reporter.error(RuntimeError.NoConverterFound, this);
    }
    const signals = converter.signals;
    if (signals === undefined) {
      return;
    }
    const signaler = locator.get(ISignaler);
    for (let i = 0, ii = signals.length; i < ii; ++i) {
      signaler.addSignalListener(signals[i], binding);
    }
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const locator = binding.locator;
    const converter = locator.get(this.converterKey) as { signals?: string[] };
    const signals = converter.signals;
    if (signals === undefined) {
      return;
    }
    const signaler = locator.get(ISignaler);
    for (let i = 0, ii = signals.length; i < ii; ++i) {
      signaler.removeSignalListener(signals[i], binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitValueConverter(this);
  }
}

export class Assign implements IExpression {
  public $kind: ExpressionKind.Assign;
  public readonly target: IsAssignable;
  public readonly value: IsAssign;

  constructor(target: IsAssignable, value: IsAssign) {
    this.$kind = ExpressionKind.Assign;
    this.target = target;
    this.value = value;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    return;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny {
    this.value.assign(flags, scope, locator, value);
    return this.target.assign(flags, scope, locator, value);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAssign(this);
  }
}

export class Conditional implements IExpression {
  public $kind: ExpressionKind.Conditional;
  public assign: IExpression['assign'];
  public readonly condition: IsBinary;
  public readonly yes: IsAssign;
  public readonly no: IsAssign;

  constructor(condition: IsBinary, yes: IsAssign, no: IsAssign) {
    this.$kind = ExpressionKind.Conditional;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.condition = condition;
    this.yes = yes;
    this.no = no;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    return (!!this.condition.evaluate(flags, scope, locator))
      ? this.yes.evaluate(flags, scope, locator)
      : this.no.evaluate(flags, scope, locator);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const condition = this.condition;
    if (condition.evaluate(flags, scope, null)) {
      this.condition.connect(flags, scope, binding);
      this.yes.connect(flags, scope, binding);
    } else {
      this.condition.connect(flags, scope, binding);
      this.no.connect(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitConditional(this);
  }
}

export class AccessThis implements IExpression {
  public static readonly $this: AccessThis = new AccessThis(0);
  public static readonly $parent: AccessThis = new AccessThis(1);
  public $kind: ExpressionKind.AccessThis;
  public assign: IExpression['assign'];
  public connect: IExpression['connect'];
  public readonly ancestor: number;

  constructor(ancestor: number = 0) {
    this.$kind = ExpressionKind.AccessThis;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.connect = PLATFORM.noop;
    this.ancestor = ancestor;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    if (scope === undefined) {
      throw Reporter.error(RuntimeError.UndefinedScope, this);
    }
    if (scope === null) {
      throw Reporter.error(RuntimeError.NullScope, this);
    }
    let oc: IOverrideContext | null = scope.overrideContext;
    let i = this.ancestor;
    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }
    return i < 1 && oc ? oc.bindingContext : undefined;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessThis(this);
  }
}

export class AccessScope implements IExpression {
  public $kind: ExpressionKind.AccessScope;
  public readonly name: string;
  public readonly ancestor: number;

  constructor(name: string, ancestor: number = 0) {
    this.$kind = ExpressionKind.AccessScope;
    this.name = name;
    this.ancestor = ancestor;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    const name = this.name;
    return BindingContext.get(scope, name, this.ancestor)[name];
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    return context ? (context[name] = value) : undefined;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    binding.observeProperty(context, name);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessScope(this);
  }
}

export class AccessMember implements IExpression {
  public $kind: ExpressionKind.AccessMember;
  public readonly object: IsLeftHandSide;
  public readonly name: string;

  constructor(object: IsLeftHandSide, name: string) {
    this.$kind = ExpressionKind.AccessMember;
    this.object = object;
    this.name = name;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    const instance = this.object.evaluate(flags, scope, locator);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny {
    let instance = this.object.evaluate(flags, scope, locator);
    if (instance === null || typeof instance !== 'object') {
      instance = {};
      this.object.assign(flags, scope, locator, instance);
    }
    instance[this.name] = value;
    return value;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const obj = this.object.evaluate(flags, scope, null);
    this.object.connect(flags, scope, binding);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessMember(this);
  }
}

export class AccessKeyed implements IExpression {
  public $kind: ExpressionKind.AccessKeyed;
  public readonly object: IsLeftHandSide;
  public readonly key: IsAssign;

  constructor(object: IsLeftHandSide, key: IsAssign) {
    this.$kind = ExpressionKind.AccessKeyed;
    this.object = object;
    this.key = key;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    const instance = this.object.evaluate(flags, scope, locator);
    if (instance === null || instance === undefined) {
      return undefined;
    }
    const key = this.key.evaluate(flags, scope, locator);
    // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
    // and the runtime does this this faster
    // tslint:disable-next-line:no-any
    return instance[<any>key];
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny {
    const instance = this.object.evaluate(flags, scope, locator);
    const key = this.key.evaluate(flags, scope, locator);
    // tslint:disable-next-line:no-any
    return instance[<any>key] = value;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const obj = this.object.evaluate(flags, scope, null);
    this.object.connect(flags, scope, binding);
    if (typeof obj === 'object' && obj !== null) {
      this.key.connect(flags, scope, binding);
      const key = this.key.evaluate(flags, scope, null);
      // observe the property represented by the key as long as it's not an array indexer
      // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
      if (!(Array.isArray(obj) && isNumeric(key))) {
        binding.observeProperty(obj, key);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessKeyed(this);
  }
}

export class CallScope implements IExpression {
  public $kind: ExpressionKind.CallScope;
  public assign: IExpression['assign'];
  public readonly name: string;
  public readonly args: ReadonlyArray<IsAssign>;
  public readonly ancestor: number;

  constructor(name: string, args: ReadonlyArray<IsAssign>, ancestor: number = 0) {
    this.$kind = ExpressionKind.CallScope;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.name = name;
    this.args = args;
    this.ancestor = ancestor;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): StrictAny {
    const args = evalList(flags, scope, locator, this.args);
    const context = BindingContext.get(scope, this.name, this.ancestor);
    const func = getFunction(flags, context, this.name);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallScope(this);
  }
}

export class CallMember implements IExpression {
  public $kind: ExpressionKind.CallMember;
  public assign: IExpression['assign'];
  public readonly object: IsLeftHandSide;
  public readonly name: string;
  public readonly args: ReadonlyArray<IsAssign>;

  constructor(object: IsLeftHandSide, name: string, args: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.CallMember;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.object = object;
    this.name = name;
    this.args = args;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    const instance = this.object.evaluate(flags, scope, locator);
    const args = evalList(flags, scope, locator, this.args);
    const func = getFunction(flags, instance, this.name);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const obj = this.object.evaluate(flags, scope, null);
    this.object.connect(flags, scope, binding);
    if (getFunction(flags & ~LifecycleFlags.mustEvaluate, obj, this.name)) {
      const args = this.args;
      for (let i = 0, ii = args.length; i < ii; ++i) {
        args[i].connect(flags, scope, binding);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallMember(this);
  }
}

export class CallFunction implements IExpression {
  public $kind: ExpressionKind.CallFunction;
  public assign: IExpression['assign'];
  public readonly func: IsLeftHandSide;
  public readonly args: ReadonlyArray<IsAssign>;

  constructor(func: IsLeftHandSide, args: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.CallFunction;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.func = func;
    this.args = args;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    const func = this.func.evaluate(flags, scope, locator) as StrictAny; // not sure why this cast is needed..
    if (typeof func === 'function') {
      return func.apply(null, evalList(flags, scope, locator, this.args));
    }
    if (!(flags & LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
      return undefined;
    }
    throw Reporter.error(RuntimeError.NotAFunction, this);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const func = this.func.evaluate(flags, scope, null);
    this.func.connect(flags, scope, binding);
    if (typeof func === 'function') {
      const args = this.args;
      for (let i = 0, ii = args.length; i < ii; ++i) {
        args[i].connect(flags, scope, binding);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallFunction(this);
  }
}

export type BinaryOperator = '&&' | '||' |  '==' |  '===' |  '!=' |  '!==' |  'instanceof' |  'in' |  '+' |  '-' |  '*' |  '/' |  '%' |  '<' |  '>' |  '<=' |  '>=';

export class Binary implements IExpression {
  public $kind: ExpressionKind.Binary;
  public assign: IExpression['assign'];
  public readonly operation: BinaryOperator;
  public readonly left: IsBinary;
  public readonly right: IsBinary;

  constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary) {
    this.$kind = ExpressionKind.Binary;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.operation = operation;
    this.left = left;
    this.right = right;

    // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
    // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
    // work to do; we can do this because the operation can't change after it's parsed
    this.evaluate = this[operation];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    throw Reporter.error(RuntimeError.UnknownOperator, this);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const left = this.left.evaluate(flags, scope, null);
    this.left.connect(flags, scope, binding);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(flags, scope, binding);
  }

  private ['&&'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
  }
  private ['||'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
  }
  private ['=='](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    // tslint:disable-next-line:triple-equals
    return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
  }
  private ['==='](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
  }
  private ['!='](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    // tslint:disable-next-line:triple-equals
    return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
  }
  private ['!=='](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
  }
  private ['instanceof'](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    const right = this.right.evaluate(f, s, l);
    if (typeof right === 'function') {
      return this.left.evaluate(f, s, l) instanceof right;
    }
    return false;
  }
  private ['in'](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    const right = this.right.evaluate(f, s, l);
    if (right !== null && typeof right === 'object') {
      return this.left.evaluate(f, s, l) in right;
    }
    return false;
  }
  // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
  // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
  // this makes bugs in user code easier to track down for end users
  // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
  private ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    // tslint:disable-next-line:no-any
    return (<any>this.left.evaluate(f, s, l)) + (<any>this.right.evaluate(f, s, l));
  }
  private ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    // tslint:disable-next-line:no-any
    return (<any>this.left.evaluate(f, s, l)) - (<any>this.right.evaluate(f, s, l));
  }
  private ['*'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    // tslint:disable-next-line:no-any
    return (<any>this.left.evaluate(f, s, l)) * (<any>this.right.evaluate(f, s, l));
  }
  private ['/'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    // tslint:disable-next-line:no-any
    return (<any>this.left.evaluate(f, s, l)) / (<any>this.right.evaluate(f, s, l));
  }
  private ['%'](f: LifecycleFlags, s: IScope, l: IServiceLocator): StrictAny {
    // tslint:disable-next-line:no-any
    return (<any>this.left.evaluate(f, s, l)) % (<any>this.right.evaluate(f, s, l));
  }
  private ['<'](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
  }
  private ['>'](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
  }
  private ['<='](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
  }
  private ['>='](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
  }

  // tslint:disable-next-line:member-ordering
  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBinary(this);
  }
}

export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';

export class Unary implements IExpression {
  public $kind: ExpressionKind.Unary;
  public assign: IExpression['assign'];
  public readonly operation: UnaryOperator;
  public readonly expression: IsLeftHandSide;

  constructor(operation: UnaryOperator, expression: IsLeftHandSide) {
    this.$kind = ExpressionKind.Unary;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.operation = operation;
    this.expression = expression;

    // see Binary (we're doing the same thing here)
    // tslint:disable-next-line:no-any
    this.evaluate = this[operation];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    throw Reporter.error(RuntimeError.UnknownOperator, this);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    this.expression.connect(flags, scope, binding);
  }

  public ['void'](f: LifecycleFlags, s: IScope, l: IServiceLocator): undefined {
    return void this.expression.evaluate(f, s, l);
  }
  public ['typeof'](f: LifecycleFlags, s: IScope, l: IServiceLocator): string {
    return typeof this.expression.evaluate(f, s, l);
  }
  public ['!'](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean {
    return !this.expression.evaluate(f, s, l);
  }
  public ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator): number {
    return -this.expression.evaluate(f, s, l);
  }
  public ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator): number {
    return +this.expression.evaluate(f, s, l);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitUnary(this);
  }
}
export class PrimitiveLiteral<TValue extends StrictPrimitive = StrictPrimitive> implements IExpression {
  public static readonly $undefined: PrimitiveLiteral<undefined> = new PrimitiveLiteral<undefined>(undefined);
  public static readonly $null: PrimitiveLiteral<null> = new PrimitiveLiteral<null>(null);
  public static readonly $true: PrimitiveLiteral<true> = new PrimitiveLiteral<true>(true);
  public static readonly $false: PrimitiveLiteral<false> = new PrimitiveLiteral<false>(false);
  public static readonly $empty: PrimitiveLiteral<string> = new PrimitiveLiteral<''>('');
  public $kind: ExpressionKind.PrimitiveLiteral;
  public connect: IExpression['connect'];
  public assign: IExpression['assign'];
  public readonly value: TValue;

  constructor(value: TValue) {
    this.$kind = ExpressionKind.PrimitiveLiteral;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.connect = PLATFORM.noop;
    this.value = value;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): TValue {
    return this.value;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitPrimitiveLiteral(this);
  }
}

export class HtmlLiteral implements IExpression {
  public $kind: ExpressionKind.HtmlLiteral;
  public assign: IExpression['assign'];
  public readonly parts: ReadonlyArray<HtmlLiteral>;

  constructor(parts: ReadonlyArray<HtmlLiteral>) {
    this.$kind = ExpressionKind.HtmlLiteral;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.parts = parts;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string {
    const elements = this.parts;
    let result = '';
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      const value = elements[i].evaluate(flags, scope, locator);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
    }
    return result;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    for (let i = 0, ii = this.parts.length; i < ii; ++i) {
      this.parts[i].connect(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitHtmlLiteral(this);
  }
}

export class ArrayLiteral implements IExpression {
  public static readonly $empty: ArrayLiteral = new ArrayLiteral(PLATFORM.emptyArray);
  public $kind: ExpressionKind.ArrayLiteral;
  public assign: IExpression['assign'];
  public readonly elements: ReadonlyArray<IsAssign>;

  constructor(elements: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.ArrayLiteral;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.elements = elements;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): ReadonlyArray<StrictAny> {
    const elements = this.elements;
    const length = elements.length;
    const result = Array(length);
    for (let i = 0; i < length; ++i) {
      result[i] = elements[i].evaluate(flags, scope, locator);
    }
    return result;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const elements = this.elements;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      elements[i].connect(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayLiteral(this);
  }
}

export class ObjectLiteral implements IExpression {
  public static readonly $empty: ObjectLiteral = new ObjectLiteral(PLATFORM.emptyArray, PLATFORM.emptyArray);
  public $kind: ExpressionKind.ObjectLiteral;
  public assign: IExpression['assign'];
  public readonly keys: ReadonlyArray<number | string>;
  public readonly values: ReadonlyArray<IsAssign>;

  constructor(keys: ReadonlyArray<number | string>, values: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.ObjectLiteral;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.keys = keys;
    this.values = values;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): Record<string, StrictAny> {
    const instance: Record<string, StrictAny> = {};
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      instance[keys[i]] = values[i].evaluate(flags, scope, locator);
    }
    return instance;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      values[i].connect(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectLiteral(this);
  }
}

export class Template implements IExpression {
  public static readonly $empty: Template = new Template(['']);
  public $kind: ExpressionKind.Template;
  public assign: IExpression['assign'];
  public readonly cooked: ReadonlyArray<string>;
  public readonly expressions: ReadonlyArray<IsAssign>;

  constructor(cooked: ReadonlyArray<string>, expressions?: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.Template;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.cooked = cooked;
    this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const cooked = this.cooked;
    let result = cooked[0];
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      result += expressions[i].evaluate(flags, scope, locator);
      result += cooked[i + 1];
    }
    return result;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const expressions = this.expressions;
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      expressions[i].connect(flags, scope, binding);
      i++;
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTemplate(this);
  }
}

export class TaggedTemplate implements IExpression {
  public $kind: ExpressionKind.TaggedTemplate;
  public assign: IExpression['assign'];
  public readonly cooked: ReadonlyArray<string> & { raw?: ReadonlyArray<string> };
  public readonly func: IsLeftHandSide;
  public readonly expressions: ReadonlyArray<IsAssign>;

  constructor(cooked: ReadonlyArray<string> & { raw?: ReadonlyArray<string> }, raw: ReadonlyArray<string>, func: IsLeftHandSide, expressions?: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.TaggedTemplate;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.cooked = cooked;
    this.cooked.raw = raw;
    this.func = func;
    this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const len = expressions.length;
    const results = Array(len);
    for (let i = 0, ii = len; i < ii; ++i) {
      results[i] = expressions[i].evaluate(flags, scope, locator);
    }
    const func = this.func.evaluate(flags, scope, locator) as StrictAny; // not sure why this cast is needed..
    if (typeof func !== 'function') {
      throw Reporter.error(RuntimeError.NotAFunction, this);
    }
    return func.apply(null, [this.cooked].concat(results));
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    const expressions = this.expressions;
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      expressions[i].connect(flags, scope, binding);
    }
    this.func.connect(flags, scope, binding);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTaggedTemplate(this);
  }
}

export class ArrayBindingPattern implements IExpression {
  public $kind: ExpressionKind.ArrayBindingPattern;
  public readonly elements: ReadonlyArray<IsAssign>;

  // We'll either have elements, or keys+values, but never all 3
  constructor(elements: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.ArrayBindingPattern;
    this.elements = elements;
  }

  // tslint:disable-next-line:no-any
  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): any {
    // TODO
  }

  // tslint:disable-next-line:no-any
  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): any {
    // TODO
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayBindingPattern(this);
  }
}

export class ObjectBindingPattern implements IExpression {
  public $kind: ExpressionKind.ObjectBindingPattern;
  public readonly keys: ReadonlyArray<string | number>;
  public readonly values: ReadonlyArray<IsAssign>;

  // We'll either have elements, or keys+values, but never all 3
  constructor(keys: ReadonlyArray<string | number>, values: ReadonlyArray<IsAssign>) {
    this.$kind = ExpressionKind.ObjectBindingPattern;
    this.keys = keys;
    this.values = values;
  }

  // tslint:disable-next-line:no-any
  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): any {
    // TODO
  }

  // tslint:disable-next-line:no-any
  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): any {
    // TODO
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectBindingPattern(this);
  }
}

export class BindingIdentifier implements IExpression {
  public $kind: ExpressionKind.BindingIdentifier;
  public readonly name: string;

  constructor(name: string) {
    this.$kind = ExpressionKind.BindingIdentifier;
    this.name = name;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    return this.name;
  }
  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingIdentifier(this);
  }
}

export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;

const toStringTag = Object.prototype.toString;

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement implements IExpression {
  public $kind: ExpressionKind.ForOfStatement;
  public assign: IExpression['assign'];
  public readonly declaration: BindingIdentifierOrPattern;
  public readonly iterable: IsBindingBehavior;

  constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior) {
    this.$kind = ExpressionKind.ForOfStatement;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.declaration = declaration;
    this.iterable = iterable;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): StrictAny {
    return this.iterable.evaluate(flags, scope, locator);
  }

  public count(result: ObservedCollection | number | null | undefined): number {
    return CountForOfStatement[toStringTag.call(result)](result);
  }

  // tslint:disable-next-line:no-any
  public iterate(result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: any) => void): void {
    IterateForOfStatement[toStringTag.call(result)](result, func);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    this.declaration.connect(flags, scope, binding);
    this.iterable.connect(flags, scope, binding);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitForOfStatement(this);
  }
}

/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
export class Interpolation implements IExpression {
  public $kind: ExpressionKind.Interpolation;
  public assign: IExpression['assign'];
  public readonly parts: ReadonlyArray<string>;
  public readonly expressions: ReadonlyArray<IsBindingBehavior>;
  public readonly isMulti: boolean;
  public readonly firstExpression: IsBindingBehavior;
  constructor(parts: ReadonlyArray<string>, expressions?: ReadonlyArray<IsBindingBehavior>) {
    this.$kind = ExpressionKind.Interpolation;
    this.assign = PLATFORM.noop as () => StrictAny;
    this.parts = parts;
    this.expressions = expressions === undefined ? PLATFORM.emptyArray : expressions;
    this.isMulti = expressions.length > 1;
    this.firstExpression = expressions[0];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string {
    if (this.isMulti) {
      const expressions = this.expressions;
      const parts = this.parts;
      let result = parts[0];
      for (let i = 0, ii = expressions.length; i < ii; ++i) {
        result += expressions[i].evaluate(flags, scope, locator);
        result += parts[i + 1];
      }
      return result;
    } else {
      const parts = this.parts;
      return parts[0] + this.firstExpression.evaluate(flags, scope, locator) + parts[1];
    }
  }
  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitInterpolation(this);
  }
}

/*
* Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
* (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
*
* This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
*/
BindingBehavior.prototype.$kind = ExpressionKind.BindingBehavior;
ValueConverter.prototype.$kind = ExpressionKind.ValueConverter;
Assign.prototype.$kind = ExpressionKind.Assign;
Conditional.prototype.$kind = ExpressionKind.Conditional;
AccessThis.prototype.$kind = ExpressionKind.AccessThis;
AccessScope.prototype.$kind = ExpressionKind.AccessScope;
AccessMember.prototype.$kind = ExpressionKind.AccessMember;
AccessKeyed.prototype.$kind = ExpressionKind.AccessKeyed;
CallScope.prototype.$kind = ExpressionKind.CallScope;
CallMember.prototype.$kind = ExpressionKind.CallMember;
CallFunction.prototype.$kind = ExpressionKind.CallFunction;
Binary.prototype.$kind = ExpressionKind.Binary;
Unary.prototype.$kind = ExpressionKind.Unary;
PrimitiveLiteral.prototype.$kind = ExpressionKind.PrimitiveLiteral;
HtmlLiteral.prototype.$kind = ExpressionKind.HtmlLiteral;
ArrayLiteral.prototype.$kind = ExpressionKind.ArrayLiteral;
ObjectLiteral.prototype.$kind = ExpressionKind.ObjectLiteral;
Template.prototype.$kind = ExpressionKind.Template;
TaggedTemplate.prototype.$kind = ExpressionKind.TaggedTemplate;
ArrayBindingPattern.prototype.$kind = ExpressionKind.ArrayBindingPattern;
ObjectBindingPattern.prototype.$kind = ExpressionKind.ObjectBindingPattern;
BindingIdentifier.prototype.$kind = ExpressionKind.BindingIdentifier;
ForOfStatement.prototype.$kind = ExpressionKind.ForOfStatement;
Interpolation.prototype.$kind = ExpressionKind.Interpolation;

/// Evaluate the [list] in context of the [scope].
function evalList(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, list: ReadonlyArray<IExpression>): StrictAny[] {
  const len = list.length;
  const result = Array(len);
  for (let i = 0; i < len; ++i) {
    result[i] = list[i].evaluate(flags, scope, locator);
  }
  return result;
}

function getFunction(flags: LifecycleFlags, obj: StrictAny, name: string): Function | null {
  const func = obj === null || obj === undefined ? null : obj[name];
  if (typeof func === 'function') {
    return func;
  }
  if (!(flags & LifecycleFlags.mustEvaluate) && (func === null || func === undefined)) {
    return null;
  }
  throw Reporter.error(RuntimeError.NotAFunction, obj, name, func);
}

function isNumeric(value: StrictAny): value is number {
  const valueType = typeof value;
  if (valueType === 'number') return true;
  if (valueType !== 'string') return false;
  const len = (<string>value).length;
  if (len === 0) return false;
  for (let i = 0; i < len; ++i) {
    const char = (<string>value).charCodeAt(i);
    if (char < 0x30 /*0*/ || char > 0x39/*9*/) {
      return false;
    }
  }
  return true;
}

/*@internal*/
export const IterateForOfStatement = {
  ['[object Array]'](result: StrictAny[], func: (arr: Collection, index: number, item: StrictAny) => void): void {
    for (let i = 0, ii = result.length; i < ii; ++i) {
      func(result, i, result[i]);
    }
  },
  ['[object Map]'](result: Map<StrictAny, StrictAny>, func: (arr: Collection, index: number, item: StrictAny) => void): void {
    const arr = Array(result.size);
    let i = -1;
    for (const entry of result.entries()) {
      arr[++i] = entry;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Set]'](result: Set<StrictAny>, func: (arr: Collection, index: number, item: StrictAny) => void): void {
    const arr = Array(result.size);
    let i = -1;
    for (const key of result.keys()) {
      arr[++i] = key;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Number]'](result: number, func: (arr: Collection, index: number, item: StrictAny) => void): void {
    const arr = Array(result);
    for (let i = 0; i < result; ++i) {
      arr[i] = i;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Null]'](result: null, func: (arr: Collection, index: number, item: StrictAny) => void): void {
    return;
  },
  ['[object Undefined]'](result: null, func: (arr: Collection, index: number, item: StrictAny) => void): void {
    return;
  }
};

/*@internal*/
export const CountForOfStatement = {
  ['[object Array]'](result: StrictAny[]): number { return result.length; },
  ['[object Map]'](result: Map<StrictAny, StrictAny>): number { return result.size; },
  ['[object Set]'](result: Set<StrictAny>): number { return result.size; },
  ['[object Number]'](result: number): number { return result; },
  ['[object Null]'](result: null): number { return 0; },
  ['[object Undefined]'](result: null): number { return 0; }
};
