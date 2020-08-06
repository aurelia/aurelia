import {
  IIndexable,
  IServiceLocator,
  PLATFORM,
  Reporter,
  StrictPrimitive,
  isNumberOrBigInt,
  isStringOrDate,
} from '@aurelia/kernel';
import {
  BinaryOperator,
  BindingIdentifierOrPattern,
  CallsFunction,
  Connects,
  HasAncestor,
  HasBind,
  HasUnbind,
  IAccessKeyedExpression,
  IAccessMemberExpression,
  IAccessScopeExpression,
  IAccessThisExpression,
  IArrayBindingPattern,
  IArrayLiteralExpression,
  IAssignExpression,
  IBinaryExpression,
  IBindingBehaviorExpression,
  IBindingIdentifier,
  ICallFunctionExpression,
  ICallMemberExpression,
  ICallScopeExpression,
  IConditionalExpression,
  IExpression,
  IForOfStatement,
  IHtmlLiteralExpression,
  IInterpolationExpression,
  IObjectBindingPattern,
  IObjectLiteralExpression,
  IPrimitiveLiteralExpression,
  IsAssign,
  IsAssignable,
  IsBinary,
  IsBindingBehavior,
  IsExpressionOrStatement,
  IsLeftHandSide,
  IsLiteral,
  IsPrimary,
  IsResource,
  IsValueConverter,
  ITaggedTemplateExpression,
  ITemplateExpression,
  IUnaryExpression,
  IValueConverterExpression,
  IVisitor,
  Observes,
  UnaryOperator,
  IHydrator,
} from '../ast';
import {
  ExpressionKind,
  LifecycleFlags,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  Collection,
  IBindingContext,
  IOverrideContext,
  IScope,
  ObservedCollection,
} from '../observation';
import { BindingContext } from '../observation/binding-context';
import { ProxyObserver } from '../observation/proxy-observer';
import { ISignaler } from '../observation/signaler';
import {
  BindingBehavior, BindingBehaviorInstance, BindingBehaviorFactory,
} from '../resources/binding-behavior';
import {
  ValueConverter, ValueConverterInstance,
} from '../resources/value-converter';
import { IConnectableBinding } from './connectable';
import { CustomElementDefinition } from '../resources/custom-element';

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
export function arePureLiterals(expressions: readonly IsExpressionOrStatement[] | undefined): expressions is IsLiteral[] {
  if (expressions === void 0 || expressions.length === 0) {
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

function chooseScope(accessHostScope: boolean, scope: IScope, hostScope: IScope | null | undefined){
  if (accessHostScope) {
    if (hostScope === null || hostScope === void 0) { throw new Error('Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?'); }
    return hostScope;
  }
  return scope;
}
const enum RuntimeError {
  NoLocator = 202,
  NoBehaviorFound = 203,
  BehaviorAlreadyApplied = 204,
  NoConverterFound = 205,
  NoBinding = 206,
  NotAFunction = 207,
  UnknownOperator = 208,
  NilScope = 250,
}

export class CustomExpression {
  public constructor(
    public readonly value: string,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): string {
    return this.value;
  }
}

export class BindingBehaviorExpression implements IBindingBehaviorExpression {
  public readonly $kind: ExpressionKind.BindingBehavior = ExpressionKind.BindingBehavior;
  public readonly behaviorKey: string;

  public constructor(
    public readonly expression: IsBindingBehavior,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
    this.behaviorKey = BindingBehavior.keyFrom(name);
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    return this.expression.evaluate(flags, scope, locator, hostScope);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, hostScope?: IScope | null): unknown {
    return this.expression.assign!(flags, scope, locator, value, hostScope);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    this.expression.connect(flags, scope, binding, hostScope);
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding & { [key: string]: BindingBehaviorInstance | undefined }): void {
    if (scope == null) {
      throw Reporter.error(RuntimeError.NilScope, this);
    }
    if (!binding) {
      throw Reporter.error(RuntimeError.NoBinding, this);
    }
    const locator = binding.locator;
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    if (hasBind(this.expression)) {
      this.expression.bind(flags, scope, binding);
    }
    const behaviorKey = this.behaviorKey;
    const behavior = locator.get<BindingBehaviorInstance>(behaviorKey);
    if (!behavior) {
      throw Reporter.error(RuntimeError.NoBehaviorFound, this);
    }
    if (!(behavior instanceof BindingBehaviorFactory)) {
      if (binding[behaviorKey] === void 0) {
        binding[behaviorKey] = behavior;
        (behavior.bind.call as (...args: unknown[]) => void)(behavior, flags, scope, binding, ...evalList(flags, scope, locator, this.args));
      } else {
        Reporter.write(RuntimeError.BehaviorAlreadyApplied, this);
      }
    }
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding & { [key: string]: BindingBehaviorInstance | undefined }): void {
    const behaviorKey = this.behaviorKey;
    if (binding[behaviorKey] !== void 0) {
      binding[behaviorKey]!.unbind(flags, scope, binding);
      binding[behaviorKey] = void 0;
    }
    if (hasUnbind(this.expression)) {
      this.expression.unbind(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingBehavior(this);
  }
}

export class ValueConverterExpression implements IValueConverterExpression {
  public readonly $kind: ExpressionKind.ValueConverter = ExpressionKind.ValueConverter;
  public readonly converterKey: string;

  public constructor(
    public readonly expression: IsValueConverter,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
    this.converterKey = ValueConverter.keyFrom(name);
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    const converter = locator.get<ValueConverterExpression & ValueConverterInstance>(this.converterKey);
    if (!converter) {
      throw Reporter.error(RuntimeError.NoConverterFound, this);
    }
    if ('toView' in converter) {
      const args = this.args;
      const len = args.length;
      const result = Array(len + 1);
      result[0] = this.expression.evaluate(flags, scope, locator, hostScope);
      for (let i = 0; i < len; ++i) {
        result[i + 1] = args[i].evaluate(flags, scope, locator, hostScope);
      }
      return (converter.toView.call as (...args: unknown[]) => void)(converter, ...result);
    }
    return this.expression.evaluate(flags, scope, locator, hostScope);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, hostScope?: IScope | null): unknown {
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    const converter = locator.get<ValueConverterExpression & ValueConverterInstance>(this.converterKey);
    if (!converter) {
      throw Reporter.error(RuntimeError.NoConverterFound, this);
    }
    if ('fromView' in converter) {
      value = (converter.fromView!.call as (...args: unknown[]) => void)(converter, value, ...(evalList(flags, scope, locator, this.args)));
    }
    return this.expression.assign!(flags, scope, locator, value, hostScope);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    if (scope == null) {
      throw Reporter.error(RuntimeError.NilScope, this);
    }
    if (!binding) {
      throw Reporter.error(RuntimeError.NoBinding, this);
    }
    const locator = binding.locator;
    if (!locator) {
      throw Reporter.error(RuntimeError.NoLocator, this);
    }
    this.expression.connect(flags, scope, binding, hostScope);
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding, hostScope);
    }
    const converter = locator.get(this.converterKey) as { signals?: string[] };
    if (!converter) {
      throw Reporter.error(RuntimeError.NoConverterFound, this);
    }
    const signals = converter.signals;
    if (signals === void 0) {
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
    if (signals === void 0) {
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

export class AssignExpression implements IAssignExpression {
  public readonly $kind: ExpressionKind.Assign = ExpressionKind.Assign;

  public constructor(
    public readonly target: IsAssignable,
    public readonly value: IsAssign,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator, hostScope), hostScope);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, hostScope?: IScope | null): unknown {
    this.value.assign!(flags, scope, locator, value, hostScope);
    return this.target.assign(flags, scope, locator, value, hostScope);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAssign(this);
  }
}

export class ConditionalExpression implements IConditionalExpression {
  public readonly $kind: ExpressionKind.Conditional = ExpressionKind.Conditional;

  public constructor(
    public readonly condition: IsBinary,
    public readonly yes: IsAssign,
    public readonly no: IsAssign,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    return (!!this.condition.evaluate(flags, scope, locator, hostScope))
      ? this.yes.evaluate(flags, scope, locator, hostScope)
      : this.no.evaluate(flags, scope, locator, hostScope);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const condition = this.condition;
    if (condition.evaluate(flags, scope, null, hostScope)) {
      this.condition.connect(flags, scope, binding, hostScope);
      this.yes.connect(flags, scope, binding, hostScope);
    } else {
      this.condition.connect(flags, scope, binding, hostScope);
      this.no.connect(flags, scope, binding, hostScope);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitConditional(this);
  }
}

export class AccessThisExpression implements IAccessThisExpression {
  public static readonly $this: AccessThisExpression = new AccessThisExpression(0);
  // $host and $this are loosely the same thing. $host is used in the context of `au-slot` with the primary objective of determining the scope.
  public static readonly $host: AccessThisExpression = new AccessThisExpression(0);
  public static readonly $parent: AccessThisExpression = new AccessThisExpression(1);
  public readonly $kind: ExpressionKind.AccessThis = ExpressionKind.AccessThis;

  public constructor(
    public readonly ancestor: number = 0,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): IBindingContext | undefined {
    if (scope == null) {
      throw Reporter.error(RuntimeError.NilScope, this);
    }
    if (this === AccessThisExpression.$host) {
      scope = chooseScope(true, scope, hostScope);
    }
    let oc: IOverrideContext | null = scope.overrideContext;
    let currentScope: IScope | null = scope;
    let i = this.ancestor;
    while (i-- && oc) {
      currentScope = currentScope!.parentScope;
      oc = currentScope?.overrideContext ?? null;
    }
    return i < 1 && oc ? oc.bindingContext : void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessThis(this);
  }
}

export class AccessScopeExpression implements IAccessScopeExpression {
  public readonly $kind: ExpressionKind.AccessScope = ExpressionKind.AccessScope;

  public constructor(
    public readonly name: string,
    public readonly ancestor: number = 0,
    public readonly accessHostScope: boolean = false,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): IBindingContext | IBinding | IOverrideContext {
    const obj = BindingContext.get(chooseScope(this.accessHostScope, scope, hostScope), this.name, this.ancestor, flags, hostScope) as IBindingContext;
    const evaluatedValue = obj[this.name] as ReturnType<AccessScopeExpression['evaluate']>;
    if (flags & LifecycleFlags.isStrictBindingStrategy) {
      return evaluatedValue;
    }
    return evaluatedValue == null ? '' as unknown as ReturnType<AccessScopeExpression['evaluate']> : evaluatedValue;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, hostScope?: IScope | null): unknown {
    const obj = BindingContext.get(chooseScope(this.accessHostScope, scope, hostScope), this.name, this.ancestor, flags, hostScope) as IBindingContext;
    if (obj instanceof Object) {
      if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
        obj.$observers[this.name].setValue(value, flags);
        return value;
      } else {
        return obj[this.name] = value;
      }
    }
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const context = BindingContext.get(chooseScope(this.accessHostScope, scope, hostScope), this.name, this.ancestor, flags, hostScope)!;
    binding.observeProperty(flags, context, this.name);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessScope(this);
  }
}

export class AccessMemberExpression implements IAccessMemberExpression {
  public readonly $kind: ExpressionKind.AccessMember = ExpressionKind.AccessMember;

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    const instance = this.object.evaluate(flags, scope, locator, hostScope) as IIndexable;
    if (flags & LifecycleFlags.isStrictBindingStrategy) {
      return instance == null ? instance : instance[this.name];
    }
    return instance ? instance[this.name] : '';
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, hostScope?: IScope | null): unknown {
    const obj = this.object.evaluate(flags, scope, locator, hostScope) as IBindingContext;
    if (obj instanceof Object) {
      if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
        obj.$observers[this.name].setValue(value, flags);
      } else {
        obj[this.name] = value;
      }
    } else {
      this.object.assign!(flags, scope, locator, { [this.name]: value });
    }
    return value;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const obj = this.object.evaluate(flags, scope, null, hostScope) as IIndexable;
    if ((flags & LifecycleFlags.observeLeafPropertiesOnly) === 0) {
      this.object.connect(flags, scope, binding, hostScope);
    }
    if (obj instanceof Object) {
      binding.observeProperty(flags, obj, this.name);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessMember(this);
  }
}

export class AccessKeyedExpression implements IAccessKeyedExpression {
  public readonly $kind: ExpressionKind.AccessKeyed = ExpressionKind.AccessKeyed;

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly key: IsAssign,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    const instance = this.object.evaluate(flags, scope, locator, hostScope) as IIndexable;
    if (instance instanceof Object) {
      const key = this.key.evaluate(flags, scope, locator, hostScope) as string;
      return instance[key];
    }
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, hostScope?: IScope | null): unknown {
    const instance = this.object.evaluate(flags, scope, locator, hostScope) as IIndexable;
    const key = this.key.evaluate(flags, scope, locator, hostScope) as string;
    return instance[key] = value;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const obj = this.object.evaluate(flags, scope, null, hostScope);
    if ((flags & LifecycleFlags.observeLeafPropertiesOnly) === 0) {
      this.object.connect(flags, scope, binding, hostScope);
    }
    if (obj instanceof Object) {
      this.key.connect(flags, scope, binding, hostScope);
      const key = this.key.evaluate(flags, scope, null, hostScope);
      // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
      binding.observeProperty(flags, obj, key as string);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessKeyed(this);
  }
}

export class CallScopeExpression implements ICallScopeExpression {
  public readonly $kind: ExpressionKind.CallScope = ExpressionKind.CallScope;

  public constructor(
    public readonly name: string,
    public readonly args: readonly IsAssign[],
    public readonly ancestor: number = 0,
    public readonly accessHostScope: boolean = false,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, hostScope?: IScope | null): unknown {
    scope = chooseScope(this.accessHostScope, scope, hostScope);
    const args = evalList(flags, scope, locator, this.args, hostScope);
    const context = BindingContext.get(scope, this.name, this.ancestor, flags, hostScope)!;
    const func = getFunction(flags, context, this.name);
    if (func) {
      return func.apply(context, args as unknown[]);
    }
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding, hostScope);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallScope(this);
  }
}

export class CallMemberExpression implements ICallMemberExpression {
  public readonly $kind: ExpressionKind.CallMember = ExpressionKind.CallMember;

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    const instance = this.object.evaluate(flags, scope, locator, hostScope) as IIndexable;
    const args = evalList(flags, scope, locator, this.args, hostScope);
    const func = getFunction(flags, instance, this.name);
    if (func) {
      return func.apply(instance, args as unknown[]);
    }
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const obj = this.object.evaluate(flags, scope, null, hostScope) as IIndexable;
    if ((flags & LifecycleFlags.observeLeafPropertiesOnly) === 0) {
      this.object.connect(flags, scope, binding, hostScope);
    }
    if (getFunction(flags & ~LifecycleFlags.mustEvaluate, obj, this.name)) {
      const args = this.args;
      for (let i = 0, ii = args.length; i < ii; ++i) {
        args[i].connect(flags, scope, binding, hostScope);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallMember(this);
  }
}

export class CallFunctionExpression implements ICallFunctionExpression {
  public readonly $kind: ExpressionKind.CallFunction = ExpressionKind.CallFunction;

  public constructor(
    public readonly func: IsLeftHandSide,
    public readonly args: readonly IsAssign[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    const func = this.func.evaluate(flags, scope, locator, hostScope);
    if (typeof func === 'function') {
      return func(...evalList(flags, scope, locator, this.args, hostScope));
    }
    if (!(flags & LifecycleFlags.mustEvaluate) && (func == null)) {
      return void 0;
    }
    throw Reporter.error(RuntimeError.NotAFunction, this);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const func = this.func.evaluate(flags, scope, null, hostScope);
    this.func.connect(flags, scope, binding, hostScope);
    if (typeof func === 'function') {
      const args = this.args;
      for (let i = 0, ii = args.length; i < ii; ++i) {
        args[i].connect(flags, scope, binding, hostScope);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallFunction(this);
  }
}

export class BinaryExpression implements IBinaryExpression {
  public readonly $kind: ExpressionKind.Binary = ExpressionKind.Binary;

  public constructor(
    public readonly operation: BinaryOperator,
    public readonly left: IsBinary,
    public readonly right: IsBinary,
  ) {
    // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
    // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
    // work to do; we can do this because the operation can't change after it's parsed
    this.evaluate = this[operation] as IExpression['evaluate'];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    throw Reporter.error(RuntimeError.UnknownOperator, this);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    this.left.connect(flags, scope, binding, hostScope);
    this.right.connect(flags, scope, binding, hostScope);
  }

  /* eslint-disable no-useless-computed-key */
  private ['&&'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): unknown {
    return this.left.evaluate(f, s, l, hs) && this.right.evaluate(f, s, l, hs);
  }
  private ['||'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): unknown {
    return this.left.evaluate(f, s, l, hs) || this.right.evaluate(f, s, l, hs);
  }
  private ['=='](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    // eslint-disable-next-line eqeqeq
    return this.left.evaluate(f, s, l, hs) == this.right.evaluate(f, s, l, hs);
  }
  private ['==='](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return this.left.evaluate(f, s, l, hs) === this.right.evaluate(f, s, l, hs);
  }
  private ['!='](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    // eslint-disable-next-line eqeqeq
    return this.left.evaluate(f, s, l, hs) != this.right.evaluate(f, s, l, hs);
  }
  private ['!=='](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return this.left.evaluate(f, s, l, hs) !== this.right.evaluate(f, s, l, hs);
  }
  private ['instanceof'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    const right = this.right.evaluate(f, s, l, hs);
    if (typeof right === 'function') {
      return this.left.evaluate(f, s, l, hs) instanceof right;
    }
    return false;
  }
  private ['in'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    const right = this.right.evaluate(f, s, l, hs);
    if (right instanceof Object) {
      return this.left.evaluate(f, s, l, hs) as string in right;
    }
    return false;
  }

  // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
  // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
  // this makes bugs in user code easier to track down for end users
  // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
  private ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number | string {
    const left: any = this.left.evaluate(f, s, l, hs);
    const right: any = this.right.evaluate(f, s, l, hs);

    if ((f & LifecycleFlags.isStrictBindingStrategy) > 0) {
      return (left as number) + (right as number);
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!left || !right) {
      if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        return (left as number || 0) + (right as number || 0);
      }
      if (isStringOrDate(left) || isStringOrDate(right)) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        return (left as string || '') + (right as string || '');
      }
    }
    return (left as number) + (right as number);
  }
  private ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number {
    return (this.left.evaluate(f, s, l, hs) as number) - (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['*'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number {
    return (this.left.evaluate(f, s, l, hs) as number) * (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['/'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number {
    return (this.left.evaluate(f, s, l, hs) as number) / (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['%'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number {
    return (this.left.evaluate(f, s, l, hs) as number) % (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['<'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return (this.left.evaluate(f, s, l, hs) as number) < (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['>'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return (this.left.evaluate(f, s, l, hs) as number) > (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['<='](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return (this.left.evaluate(f, s, l, hs) as number) <= (this.right.evaluate(f, s, l, hs) as number);
  }
  private ['>='](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return (this.left.evaluate(f, s, l, hs) as number) >= (this.right.evaluate(f, s, l, hs) as number);
  }
  /* eslint-enable no-useless-computed-key */

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBinary(this);
  }
}

export class UnaryExpression implements IUnaryExpression {
  public readonly $kind: ExpressionKind.Unary = ExpressionKind.Unary;

  public constructor(
    public readonly operation: UnaryOperator,
    public readonly expression: IsLeftHandSide,
  ) {
    // see Binary (we're doing the same thing here)
    this.evaluate = this[operation] as IExpression['evaluate'];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    throw Reporter.error(RuntimeError.UnknownOperator, this);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    this.expression.connect(flags, scope, binding, hostScope);
  }

  /* eslint-disable no-useless-computed-key */
  public ['void'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): undefined {
    return void this.expression.evaluate(f, s, l, hs);
  }
  public ['typeof'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): string {
    return typeof this.expression.evaluate(f | LifecycleFlags.isStrictBindingStrategy, s, l, hs);
  }
  public ['!'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): boolean {
    return !this.expression.evaluate(f, s, l, hs);
  }
  public ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number {
    return -(this.expression.evaluate(f, s, l, hs) as number);
  }
  public ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator, hs?: IScope | null): number {
    return +(this.expression.evaluate(f, s, l, hs) as number);
  }
  /* eslint-enable no-useless-computed-key */

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitUnary(this);
  }
}
export class PrimitiveLiteralExpression<TValue extends StrictPrimitive = StrictPrimitive> implements IPrimitiveLiteralExpression {
  public static readonly $undefined: PrimitiveLiteralExpression<undefined> = new PrimitiveLiteralExpression<undefined>(void 0);
  public static readonly $null: PrimitiveLiteralExpression<null> = new PrimitiveLiteralExpression<null>(null);
  public static readonly $true: PrimitiveLiteralExpression<true> = new PrimitiveLiteralExpression<true>(true);
  public static readonly $false: PrimitiveLiteralExpression<false> = new PrimitiveLiteralExpression<false>(false);
  public static readonly $empty: PrimitiveLiteralExpression<string> = new PrimitiveLiteralExpression<''>('');
  public readonly $kind: ExpressionKind.PrimitiveLiteral = ExpressionKind.PrimitiveLiteral;

  public constructor(
    public readonly value: TValue,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): TValue {
    return this.value;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitPrimitiveLiteral(this);
  }
}

export class HtmlLiteralExpression implements IHtmlLiteralExpression {
  public readonly $kind: ExpressionKind.HtmlLiteral = ExpressionKind.HtmlLiteral;

  public constructor(
    public readonly parts: readonly HtmlLiteralExpression[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): string {
    const elements = this.parts;
    let result = '';
    let value;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      value = elements[i].evaluate(flags, scope, locator, hostScope);
      if (value == null) {
        continue;
      }
      result += value;
    }
    return result;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null, rojection?: CustomElementDefinition): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    for (let i = 0, ii = this.parts.length; i < ii; ++i) {
      this.parts[i].connect(flags, scope, binding, hostScope);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitHtmlLiteral(this);
  }
}

export class ArrayLiteralExpression implements IArrayLiteralExpression {
  public static readonly $empty: ArrayLiteralExpression = new ArrayLiteralExpression(PLATFORM.emptyArray);
  public readonly $kind: ExpressionKind.ArrayLiteral = ExpressionKind.ArrayLiteral;

  public constructor(
    public readonly elements: readonly IsAssign[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): readonly unknown[] {
    const elements = this.elements;
    const length = elements.length;
    const result = Array(length);
    for (let i = 0; i < length; ++i) {
      result[i] = elements[i].evaluate(flags, scope, locator, hostScope);
    }
    return result;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const elements = this.elements;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      elements[i].connect(flags, scope, binding, hostScope);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayLiteral(this);
  }
}

export class ObjectLiteralExpression implements IObjectLiteralExpression {
  public static readonly $empty: ObjectLiteralExpression = new ObjectLiteralExpression(PLATFORM.emptyArray, PLATFORM.emptyArray);
  public readonly $kind: ExpressionKind.ObjectLiteral = ExpressionKind.ObjectLiteral;

  public constructor(
    public readonly keys: readonly (number | string)[],
    public readonly values: readonly IsAssign[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): Record<string, unknown> {
    const instance: Record<string, unknown> = {};
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      instance[keys[i]] = values[i].evaluate(flags, scope, locator, hostScope);
    }
    return instance;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      values[i].connect(flags, scope, binding, hostScope);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectLiteral(this);
  }
}

export class TemplateExpression implements ITemplateExpression {
  public static readonly $empty: TemplateExpression = new TemplateExpression(['']);
  public readonly $kind: ExpressionKind.Template = ExpressionKind.Template;

  public constructor(
    public readonly cooked: readonly string[],
    public readonly expressions: readonly IsAssign[] = PLATFORM.emptyArray,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): string {
    const expressions = this.expressions;
    const cooked = this.cooked;
    let result = cooked[0];
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      result += expressions[i].evaluate(flags, scope, locator, hostScope);
      result += cooked[i + 1];
    }
    return result;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    const expressions = this.expressions;
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      expressions[i].connect(flags, scope, binding, hostScope);
      i++;
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTemplate(this);
  }
}

export class TaggedTemplateExpression implements ITaggedTemplateExpression {
  public readonly $kind: ExpressionKind.TaggedTemplate = ExpressionKind.TaggedTemplate;

  public constructor(
    public readonly cooked: readonly string[] & { raw?: readonly string[] },
    raw: readonly string[],
    public readonly func: IsLeftHandSide,
    public readonly expressions: readonly IsAssign[] = PLATFORM.emptyArray,
  ) {
    cooked.raw = raw;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): string {
    const expressions = this.expressions;
    const len = expressions.length;
    const results = Array(len);
    for (let i = 0, ii = len; i < ii; ++i) {
      results[i] = expressions[i].evaluate(flags, scope, locator, hostScope);
    }
    const func = this.func.evaluate(flags, scope, locator, hostScope);
    if (typeof func !== 'function') {
      throw Reporter.error(RuntimeError.NotAFunction, this);
    }
    return func(this.cooked, ...results);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
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

export class ArrayBindingPattern implements IArrayBindingPattern {
  public readonly $kind: ExpressionKind.ArrayBindingPattern = ExpressionKind.ArrayBindingPattern;

  // We'll either have elements, or keys+values, but never all 3
  public constructor(
    public readonly elements: readonly IsAssign[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    // TODO
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    // TODO
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayBindingPattern(this);
  }
}

export class ObjectBindingPattern implements IObjectBindingPattern {
  public readonly $kind: ExpressionKind.ObjectBindingPattern = ExpressionKind.ObjectBindingPattern;

  // We'll either have elements, or keys+values, but never all 3
  public constructor(
    public readonly keys: readonly (string | number)[],
    public readonly values: readonly IsAssign[],
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    // TODO
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    // TODO
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectBindingPattern(this);
  }
}

export class BindingIdentifier implements IBindingIdentifier {
  public readonly $kind: ExpressionKind.BindingIdentifier = ExpressionKind.BindingIdentifier;

  public constructor(
    public readonly name: string,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, hostScope?: IScope | null): string {
    return this.name;
  }
  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingIdentifier(this);
  }
}

const toStringTag = Object.prototype.toString as {
  call(obj: unknown): keyof '[object Array]' | '[object Map]' | '[object Set]' | '[object Number]' | '[object Null]' | '[object Undefined]';
};

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement implements IForOfStatement {
  public readonly $kind: ExpressionKind.ForOfStatement = ExpressionKind.ForOfStatement;

  public constructor(
    public readonly declaration: BindingIdentifierOrPattern,
    public readonly iterable: IsBindingBehavior,
  ) {}

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): unknown {
    return this.iterable.evaluate(flags, scope, locator, hostScope);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public count(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined): number {
    switch (toStringTag.call(result)) {
      case '[object Array]': return (result as unknown[]).length;
      case '[object Map]': return (result as Map<unknown, unknown>).size;
      case '[object Set]': return (result as Set<unknown>).size;
      case '[object Number]': return result as number;
      case '[object Null]': return 0;
      case '[object Undefined]': return 0;
      default: throw Reporter.error(0); // TODO: Set error code
    }
  }

  public iterate(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void {
    switch (toStringTag.call(result)) {
      case '[object Array]': return $array(flags | LifecycleFlags.isOriginalArray, result as unknown[], func);
      case '[object Map]': return $map(flags | LifecycleFlags.isOriginalArray, result as Map<unknown, unknown>, func);
      case '[object Set]': return $set(flags | LifecycleFlags.isOriginalArray, result as Set<unknown>, func);
      case '[object Number]': return $number(flags | LifecycleFlags.isOriginalArray, result as number, func);
      case '[object Null]': return;
      case '[object Undefined]': return;
      default: throw Reporter.error(0); // TODO: Set error code
    }
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    this.declaration.connect(flags, scope, binding, hostScope);
    this.iterable.connect(flags, scope, binding, hostScope);
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    if (hasBind(this.iterable)) {
      this.iterable.bind(flags, scope, binding);
    }
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void {
    if (hasUnbind(this.iterable)) {
      this.iterable.unbind(flags, scope, binding);
    }
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
export class Interpolation implements IInterpolationExpression {
  public readonly $kind: ExpressionKind.Interpolation = ExpressionKind.Interpolation;
  public readonly isMulti: boolean;
  public readonly firstExpression: IsBindingBehavior;

  public constructor(
    public readonly parts: readonly string[],
    public readonly expressions: readonly IsBindingBehavior[] = PLATFORM.emptyArray,
  ) {
    this.isMulti = expressions.length > 1;
    this.firstExpression = expressions[0];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, hostScope?: IScope | null): string {
    if (this.isMulti) {
      const expressions = this.expressions;
      const parts = this.parts;
      let result = parts[0];
      for (let i = 0, ii = expressions.length; i < ii; ++i) {
        result += expressions[i].evaluate(flags, scope, locator, hostScope);
        result += parts[i + 1];
      }
      return result;
    } else {
      const parts = this.parts;
      return `${parts[0]}${this.firstExpression.evaluate(flags, scope, locator, hostScope)}${parts[1]}`;
    }
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, hostScope?: IScope | null): unknown {
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, hostScope?: IScope | null): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitInterpolation(this);
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, list: readonly IExpression[], hostScope?: IScope | null): readonly IExpression[] {
  const len = list.length;
  const result = Array(len);
  for (let i = 0; i < len; ++i) {
    result[i] = list[i].evaluate(flags, scope, locator, hostScope);
  }
  return result;
}

function getFunction(flags: LifecycleFlags, obj: object, name: string): ((...args: unknown[]) => unknown) | null {
  const func = obj == null ? null : (obj as IIndexable)[name];
  if (typeof func === 'function') {
    return func as (...args: unknown[]) => unknown;
  }
  if (!(flags & LifecycleFlags.mustEvaluate) && func == null) {
    return null;
  }
  throw Reporter.error(RuntimeError.NotAFunction, obj, name, func);
}

const proxyAndOriginalArray = LifecycleFlags.proxyStrategy | LifecycleFlags.isOriginalArray;

function $array(flags: LifecycleFlags, result: unknown[], func: (arr: Collection, index: number, item: unknown) => void): void {
  if ((flags & proxyAndOriginalArray) === proxyAndOriginalArray) {
    // If we're in proxy mode, and the array is the original "items" (and not an array we created here to iterate over e.g. a set)
    // then replace all items (which are Objects) with proxies so their properties are observed in the source view model even if no
    // observers are explicitly created
    const rawArray = ProxyObserver.getRawIfProxy(result);
    const len = rawArray.length;
    let item: unknown;
    let i = 0;
    for (; i < len; ++i) {
      item = rawArray[i];
      if (item instanceof Object) {
        item = rawArray[i] = ProxyObserver.getOrCreate(item).proxy;
      }
      func(rawArray, i, item);
    }
  } else {
    for (let i = 0, ii = result.length; i < ii; ++i) {
      func(result, i, result[i]);
    }
  }
}

function $map(flags: LifecycleFlags, result: Map<unknown, unknown>, func: (arr: Collection, index: number, item: unknown) => void): void {
  const arr = Array(result.size);
  let i = -1;
  for (const entry of result.entries()) {
    arr[++i] = entry;
  }
  $array(flags & ~LifecycleFlags.isOriginalArray, arr, func);
}

function $set(flags: LifecycleFlags, result: Set<unknown>, func: (arr: Collection, index: number, item: unknown) => void): void {
  const arr = Array(result.size);
  let i = -1;
  for (const key of result.keys()) {
    arr[++i] = key;
  }
  $array(flags & ~LifecycleFlags.isOriginalArray, arr, func);
}

function $number(flags: LifecycleFlags, result: number, func: (arr: Collection, index: number, item: unknown) => void): void {
  const arr = Array(result);
  for (let i = 0; i < result; ++i) {
    arr[i] = i;
  }
  $array(flags & ~LifecycleFlags.isOriginalArray, arr, func);
}
