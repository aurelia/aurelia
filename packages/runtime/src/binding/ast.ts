import {
  IIndexable,
  IServiceLocator,
  isNumeric,
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
  BindingBehavior, BindingBehaviorInstance,
} from '../resources/binding-behavior';
import {
  ValueConverter, ValueConverterInstance,
} from '../resources/value-converter';
import { IConnectableBinding } from './connectable';

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
  public constructor(public readonly value: string) { }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string {
    return this.value;
  }
}

export class BindingBehaviorExpression implements IBindingBehaviorExpression {
  public readonly $kind: ExpressionKind.BindingBehavior;
  public expression: IsBindingBehavior;
  public readonly name: string;
  public readonly args: readonly IsAssign[];
  public readonly behaviorKey: string;

  public constructor(expression: IsBindingBehavior, name: string, args: readonly IsAssign[]) {
    this.$kind = ExpressionKind.BindingBehavior;
    this.expression = expression;
    this.name = name;
    this.args = args;
    this.behaviorKey = BindingBehavior.keyFrom(this.name);
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    return this.expression.evaluate(flags, scope, locator, part);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown {
    return this.expression.assign!(flags, scope, locator, value, part);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    this.expression.connect(flags, scope, binding, part);
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
    if (binding[behaviorKey] === void 0) {
      binding[behaviorKey] = behavior;
      (behavior.bind.call as (...args: unknown[]) => void)(behavior, flags, scope, binding, ...evalList(flags, scope, locator, this.args));
    } else {
      Reporter.write(RuntimeError.BehaviorAlreadyApplied, this);
    }
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding & { [key: string]: BindingBehaviorInstance | undefined }): void {
    const behaviorKey = this.behaviorKey;
    if (binding[behaviorKey] !== void 0) {
      binding[behaviorKey]!.unbind(flags, scope, binding);
      binding[behaviorKey] = void 0;
    } else {
      // TODO: this is a temporary hack to make testing repeater keyed mode easier,
      // we should remove this idempotency again when track-by attribute is implemented
      Reporter.write(RuntimeError.BehaviorAlreadyApplied, this);
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
  public readonly $kind: ExpressionKind.ValueConverter;
  public readonly expression: IsValueConverter;
  public readonly name: string;
  public readonly args: readonly IsAssign[];
  public readonly converterKey: string;

  public constructor(expression: IsValueConverter, name: string, args: readonly IsAssign[]) {
    this.$kind = ExpressionKind.ValueConverter;
    this.expression = expression;
    this.name = name;
    this.args = args;
    this.converterKey = ValueConverter.keyFrom(this.name);
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
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
      result[0] = this.expression.evaluate(flags, scope, locator, part);
      for (let i = 0; i < len; ++i) {
        result[i + 1] = args[i].evaluate(flags, scope, locator, part);
      }
      return (converter.toView.call as (...args: unknown[]) => void)(converter, ...result);
    }
    return this.expression.evaluate(flags, scope, locator, part);
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown {
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
    return this.expression.assign!(flags, scope, locator, value, part);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
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
    this.expression.connect(flags, scope, binding, part);
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding, part);
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
  public readonly $kind: ExpressionKind.Assign;
  public readonly target: IsAssignable;
  public readonly value: IsAssign;

  public constructor(target: IsAssignable, value: IsAssign) {
    this.$kind = ExpressionKind.Assign;
    this.target = target;
    this.value = value;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator), part);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    return;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown {
    this.value.assign!(flags, scope, locator, value, part);
    return this.target.assign(flags, scope, locator, value, part);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAssign(this);
  }
}

export class ConditionalExpression implements IConditionalExpression {
  public readonly $kind: ExpressionKind.Conditional;
  public assign: IExpression['assign'];
  public readonly condition: IsBinary;
  public readonly yes: IsAssign;
  public readonly no: IsAssign;

  public constructor(condition: IsBinary, yes: IsAssign, no: IsAssign) {
    this.$kind = ExpressionKind.Conditional;
    this.assign = PLATFORM.noop as () => unknown;
    this.condition = condition;
    this.yes = yes;
    this.no = no;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    return (!!this.condition.evaluate(flags, scope, locator, part))
      ? this.yes.evaluate(flags, scope, locator, part)
      : this.no.evaluate(flags, scope, locator, part);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const condition = this.condition;
    if (condition.evaluate(flags, scope, null, part)) {
      this.condition.connect(flags, scope, binding, part);
      this.yes.connect(flags, scope, binding, part);
    } else {
      this.condition.connect(flags, scope, binding, part);
      this.no.connect(flags, scope, binding, part);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitConditional(this);
  }
}

export class AccessThisExpression implements IAccessThisExpression {
  public static readonly $this: AccessThisExpression = new AccessThisExpression(0);
  public static readonly $parent: AccessThisExpression = new AccessThisExpression(1);
  public readonly $kind: ExpressionKind.AccessThis;
  public assign: IExpression['assign'];
  public connect: IExpression['connect'];
  public readonly ancestor: number;

  public constructor(ancestor: number = 0) {
    this.$kind = ExpressionKind.AccessThis;
    this.assign = PLATFORM.noop as () => unknown;
    this.connect = PLATFORM.noop;
    this.ancestor = ancestor;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): IBindingContext | undefined {
    if (scope == null) {
      throw Reporter.error(RuntimeError.NilScope, this);
    }

    if ((flags & LifecycleFlags.allowParentScopeTraversal) > 0) {
      let parent = scope.parentScope;
      while (parent !== null) {
        if (!parent.scopeParts.includes(part!)) {
          parent = parent.parentScope;
        }
      }

      if (parent === null) {
        throw new Error(`No target scope cold be found for part "${part}"`);
      }
    }
    let oc: IOverrideContext | null = scope.overrideContext;
    let i = this.ancestor;
    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }
    return i < 1 && oc ? oc.bindingContext : void 0;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessThis(this);
  }
}

export class AccessScopeExpression implements IAccessScopeExpression {
  public readonly $kind: ExpressionKind.AccessScope;
  public readonly name: string;
  public readonly ancestor: number;

  public constructor(name: string, ancestor: number = 0) {
    this.$kind = ExpressionKind.AccessScope;
    this.name = name;
    this.ancestor = ancestor;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): IBindingContext | IBinding | IOverrideContext {
    const obj = BindingContext.get(scope, this.name, this.ancestor, flags, part) as IBindingContext;
    const evaluatedValue = obj[this.name] as ReturnType<AccessScopeExpression['evaluate']>;
    if (flags & LifecycleFlags.isStrictBindingStrategy) {
      return evaluatedValue;
    }
    return evaluatedValue == null ? '' as unknown as ReturnType<AccessScopeExpression['evaluate']> : evaluatedValue;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown {
    const obj = BindingContext.get(scope, this.name, this.ancestor, flags, part) as IBindingContext;
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

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const context = BindingContext.get(scope, this.name, this.ancestor, flags, part)!;
    binding.observeProperty(flags, context, this.name);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessScope(this);
  }
}

export class AccessMemberExpression implements IAccessMemberExpression {
  public readonly $kind: ExpressionKind.AccessMember;
  public readonly object: IsLeftHandSide;
  public readonly name: string;

  public constructor(object: IsLeftHandSide, name: string) {
    this.$kind = ExpressionKind.AccessMember;
    this.object = object;
    this.name = name;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    const instance = this.object.evaluate(flags, scope, locator, part) as IIndexable;
    if (flags & LifecycleFlags.isStrictBindingStrategy) {
      return instance == null ? instance : instance[this.name];
    }
    return instance ? instance[this.name] : '';
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown {
    const obj = this.object.evaluate(flags, scope, locator, part) as IBindingContext;
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

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const obj = this.object.evaluate(flags, scope, null, part) as IIndexable;
    if ((flags & LifecycleFlags.observeLeafPropertiesOnly) === 0) {
      this.object.connect(flags, scope, binding, part);
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
  public readonly $kind: ExpressionKind.AccessKeyed;
  public readonly object: IsLeftHandSide;
  public readonly key: IsAssign;

  public constructor(object: IsLeftHandSide, key: IsAssign) {
    this.$kind = ExpressionKind.AccessKeyed;
    this.object = object;
    this.key = key;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    const instance = this.object.evaluate(flags, scope, locator, part) as IIndexable;
    if (instance instanceof Object) {
      const key = this.key.evaluate(flags, scope, locator, part) as string;
      return instance[key];
    }
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown {
    const instance = this.object.evaluate(flags, scope, locator, part) as IIndexable;
    const key = this.key.evaluate(flags, scope, locator, part) as string;
    return instance[key] = value;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const obj = this.object.evaluate(flags, scope, null, part);
    if ((flags & LifecycleFlags.observeLeafPropertiesOnly) === 0) {
      this.object.connect(flags, scope, binding, part);
    }
    if (obj instanceof Object) {
      this.key.connect(flags, scope, binding, part);
      const key = this.key.evaluate(flags, scope, null, part);

      if (Array.isArray(obj) && isNumeric(key)) {
        // Only observe array indexers in proxy mode
        if (flags & LifecycleFlags.proxyStrategy) {
          binding.observeProperty(flags, obj, key as unknown as string);
        }
      } else {
        // observe the property represented by the key as long as it's not an array indexer
        // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
        binding.observeProperty(flags, obj, key as string);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessKeyed(this);
  }
}

export class CallScopeExpression implements ICallScopeExpression {
  public readonly $kind: ExpressionKind.CallScope;
  public assign: IExpression['assign'];
  public readonly name: string;
  public readonly args: readonly IsAssign[];
  public readonly ancestor: number;

  public constructor(name: string, args: readonly IsAssign[], ancestor: number = 0) {
    this.$kind = ExpressionKind.CallScope;
    this.assign = PLATFORM.noop as () => unknown;
    this.name = name;
    this.args = args;
    this.ancestor = ancestor;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, part?: string): unknown {
    const args = evalList(flags, scope, locator, this.args, part);
    const context = BindingContext.get(scope, this.name, this.ancestor, flags, part)!;
    const func = getFunction(flags, context, this.name);
    if (func) {
      return func.apply(context, args as unknown[]);
    }
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding, part);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallScope(this);
  }
}

export class CallMemberExpression implements ICallMemberExpression {
  public readonly $kind: ExpressionKind.CallMember;
  public assign: IExpression['assign'];
  public readonly object: IsLeftHandSide;
  public readonly name: string;
  public readonly args: readonly IsAssign[];

  public constructor(object: IsLeftHandSide, name: string, args: readonly IsAssign[]) {
    this.$kind = ExpressionKind.CallMember;
    this.assign = PLATFORM.noop as () => unknown;
    this.object = object;
    this.name = name;
    this.args = args;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    const instance = this.object.evaluate(flags, scope, locator, part) as IIndexable;
    const args = evalList(flags, scope, locator, this.args, part);
    const func = getFunction(flags, instance, this.name);
    if (func) {
      return func.apply(instance, args as unknown[]);
    }
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const obj = this.object.evaluate(flags, scope, null, part) as IIndexable;
    if ((flags & LifecycleFlags.observeLeafPropertiesOnly) === 0) {
      this.object.connect(flags, scope, binding, part);
    }
    if (getFunction(flags & ~LifecycleFlags.mustEvaluate, obj, this.name)) {
      const args = this.args;
      for (let i = 0, ii = args.length; i < ii; ++i) {
        args[i].connect(flags, scope, binding, part);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallMember(this);
  }
}

export class CallFunctionExpression implements ICallFunctionExpression {
  public readonly $kind: ExpressionKind.CallFunction;
  public assign: IExpression['assign'];
  public readonly func: IsLeftHandSide;
  public readonly args: readonly IsAssign[];

  public constructor(func: IsLeftHandSide, args: readonly IsAssign[]) {
    this.$kind = ExpressionKind.CallFunction;
    this.assign = PLATFORM.noop as () => unknown;
    this.func = func;
    this.args = args;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    const func = this.func.evaluate(flags, scope, locator, part);
    if (typeof func === 'function') {
      return func(...evalList(flags, scope, locator, this.args, part));
    }
    if (!(flags & LifecycleFlags.mustEvaluate) && (func == null)) {
      return void 0;
    }
    throw Reporter.error(RuntimeError.NotAFunction, this);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const func = this.func.evaluate(flags, scope, null, part);
    this.func.connect(flags, scope, binding, part);
    if (typeof func === 'function') {
      const args = this.args;
      for (let i = 0, ii = args.length; i < ii; ++i) {
        args[i].connect(flags, scope, binding, part);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallFunction(this);
  }
}

export class BinaryExpression implements IBinaryExpression {
  public readonly $kind: ExpressionKind.Binary;
  public assign: IExpression['assign'];
  public readonly operation: BinaryOperator;
  public readonly left: IsBinary;
  public readonly right: IsBinary;

  public constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary) {
    this.$kind = ExpressionKind.Binary;
    this.assign = PLATFORM.noop as () => unknown;
    this.operation = operation;
    this.left = left;
    this.right = right;

    // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
    // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
    // work to do; we can do this because the operation can't change after it's parsed
    this.evaluate = this[operation] as IExpression['evaluate'];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    throw Reporter.error(RuntimeError.UnknownOperator, this);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    this.left.connect(flags, scope, binding, part);
    this.right.connect(flags, scope, binding, part);
  }

  private ['&&'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): unknown {
    return this.left.evaluate(f, s, l, p) && this.right.evaluate(f, s, l, p);
  }
  private ['||'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): unknown {
    return this.left.evaluate(f, s, l, p) || this.right.evaluate(f, s, l, p);
  }
  private ['=='](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    // eslint-disable-next-line eqeqeq
    return this.left.evaluate(f, s, l, p) == this.right.evaluate(f, s, l, p);
  }
  private ['==='](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return this.left.evaluate(f, s, l, p) === this.right.evaluate(f, s, l, p);
  }
  private ['!='](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    // eslint-disable-next-line eqeqeq
    return this.left.evaluate(f, s, l, p) != this.right.evaluate(f, s, l, p);
  }
  private ['!=='](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return this.left.evaluate(f, s, l, p) !== this.right.evaluate(f, s, l, p);
  }
  private ['instanceof'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    const right = this.right.evaluate(f, s, l, p);
    if (typeof right === 'function') {
      return this.left.evaluate(f, s, l, p) instanceof right;
    }
    return false;
  }
  private ['in'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    const right = this.right.evaluate(f, s, l, p);
    if (right instanceof Object) {
      return this.left.evaluate(f, s, l, p) as string in right;
    }
    return false;
  }

  // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
  // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
  // this makes bugs in user code easier to track down for end users
  // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
  private ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number | string {
    const left: any = this.left.evaluate(f, s, l, p);
    const right: any = this.right.evaluate(f, s, l, p);

    if ((f & LifecycleFlags.isStrictBindingStrategy) > 0) {
      return left + right;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!left || !right) {
      if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        return (left || 0) + (right || 0);
      }
      if (isStringOrDate(left) || isStringOrDate(right)) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        return (left || '') + (right || '');
      }
    }
    return (left as number) + (right as number);
  }
  private ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number {
    return (this.left.evaluate(f, s, l, p) as number) - (this.right.evaluate(f, s, l, p) as number);
  }
  private ['*'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number {
    return (this.left.evaluate(f, s, l, p) as number) * (this.right.evaluate(f, s, l, p) as number);
  }
  private ['/'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number {
    return (this.left.evaluate(f, s, l, p) as number) / (this.right.evaluate(f, s, l, p) as number);
  }
  private ['%'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number {
    return (this.left.evaluate(f, s, l, p) as number) % (this.right.evaluate(f, s, l, p) as number);
  }
  private ['<'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return (this.left.evaluate(f, s, l, p) as number) < (this.right.evaluate(f, s, l, p) as number);
  }
  private ['>'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return (this.left.evaluate(f, s, l, p) as number) > (this.right.evaluate(f, s, l, p) as number);
  }
  private ['<='](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return (this.left.evaluate(f, s, l, p) as number) <= (this.right.evaluate(f, s, l, p) as number);
  }
  private ['>='](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return (this.left.evaluate(f, s, l, p) as number) >= (this.right.evaluate(f, s, l, p) as number);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBinary(this);
  }
}

export class UnaryExpression implements IUnaryExpression {
  public readonly $kind: ExpressionKind.Unary;
  public assign: IExpression['assign'];
  public readonly operation: UnaryOperator;
  public readonly expression: IsLeftHandSide;

  public constructor(operation: UnaryOperator, expression: IsLeftHandSide) {
    this.$kind = ExpressionKind.Unary;
    this.assign = PLATFORM.noop as () => unknown;
    this.operation = operation;
    this.expression = expression;

    // see Binary (we're doing the same thing here)
    this.evaluate = this[operation] as IExpression['evaluate'];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    throw Reporter.error(RuntimeError.UnknownOperator, this);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    this.expression.connect(flags, scope, binding, part);
  }

  public ['void'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): undefined {
    return void this.expression.evaluate(f, s, l, p);
  }
  public ['typeof'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): string {
    return typeof this.expression.evaluate(f | LifecycleFlags.isStrictBindingStrategy, s, l, p);
  }
  public ['!'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean {
    return !this.expression.evaluate(f, s, l, p);
  }
  public ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number {
    return -(this.expression.evaluate(f, s, l, p) as number);
  }
  public ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number {
    return +(this.expression.evaluate(f, s, l, p) as number);
  }

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
  public readonly $kind: ExpressionKind.PrimitiveLiteral;
  public connect: IExpression['connect'];
  public assign: IExpression['assign'];
  public readonly value: TValue;

  public constructor(value: TValue) {
    this.$kind = ExpressionKind.PrimitiveLiteral;
    this.assign = PLATFORM.noop as () => unknown;
    this.connect = PLATFORM.noop;
    this.value = value;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): TValue {
    return this.value;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitPrimitiveLiteral(this);
  }
}

export class HtmlLiteralExpression implements IHtmlLiteralExpression {
  public readonly $kind: ExpressionKind.HtmlLiteral;
  public assign: IExpression['assign'];
  public readonly parts: readonly HtmlLiteralExpression[];

  public constructor(parts: readonly HtmlLiteralExpression[]) {
    this.$kind = ExpressionKind.HtmlLiteral;
    this.assign = PLATFORM.noop as () => unknown;
    this.parts = parts;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string {
    const elements = this.parts;
    let result = '';
    let value;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      value = elements[i].evaluate(flags, scope, locator, part);
      if (value == null) {
        continue;
      }
      result += value;
    }
    return result;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    for (let i = 0, ii = this.parts.length; i < ii; ++i) {
      this.parts[i].connect(flags, scope, binding, part);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitHtmlLiteral(this);
  }
}

export class ArrayLiteralExpression implements IArrayLiteralExpression {
  public static readonly $empty: ArrayLiteralExpression = new ArrayLiteralExpression(PLATFORM.emptyArray);
  public readonly $kind: ExpressionKind.ArrayLiteral;
  public assign: IExpression['assign'];
  public readonly elements: readonly IsAssign[];

  public constructor(elements: readonly IsAssign[]) {
    this.$kind = ExpressionKind.ArrayLiteral;
    this.assign = PLATFORM.noop as () => unknown;
    this.elements = elements;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): readonly unknown[] {
    const elements = this.elements;
    const length = elements.length;
    const result = Array(length);
    for (let i = 0; i < length; ++i) {
      result[i] = elements[i].evaluate(flags, scope, locator, part);
    }
    return result;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const elements = this.elements;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      elements[i].connect(flags, scope, binding, part);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayLiteral(this);
  }
}

export class ObjectLiteralExpression implements IObjectLiteralExpression {
  public static readonly $empty: ObjectLiteralExpression = new ObjectLiteralExpression(PLATFORM.emptyArray, PLATFORM.emptyArray);
  public readonly $kind: ExpressionKind.ObjectLiteral;
  public assign: IExpression['assign'];
  public readonly keys: readonly (number | string)[];
  public readonly values: readonly IsAssign[];

  public constructor(keys: readonly (number | string)[], values: readonly IsAssign[]) {
    this.$kind = ExpressionKind.ObjectLiteral;
    this.assign = PLATFORM.noop as () => unknown;
    this.keys = keys;
    this.values = values;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): Record<string, unknown> {
    const instance: Record<string, unknown> = {};
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      instance[keys[i]] = values[i].evaluate(flags, scope, locator, part);
    }
    return instance;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      values[i].connect(flags, scope, binding, part);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectLiteral(this);
  }
}

export class TemplateExpression implements ITemplateExpression {
  public static readonly $empty: TemplateExpression = new TemplateExpression(['']);
  public readonly $kind: ExpressionKind.Template;
  public assign: IExpression['assign'];
  public readonly cooked: readonly string[];
  public readonly expressions: readonly IsAssign[];

  public constructor(cooked: readonly string[], expressions?: readonly IsAssign[]) {
    this.$kind = ExpressionKind.Template;
    this.assign = PLATFORM.noop as () => unknown;
    this.cooked = cooked;
    this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string {
    const expressions = this.expressions;
    const cooked = this.cooked;
    let result = cooked[0];
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      result += expressions[i].evaluate(flags, scope, locator, part);
      result += cooked[i + 1];
    }
    return result;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    const expressions = this.expressions;
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      expressions[i].connect(flags, scope, binding, part);
      i++;
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTemplate(this);
  }
}

export class TaggedTemplateExpression implements ITaggedTemplateExpression {
  public readonly $kind: ExpressionKind.TaggedTemplate;
  public assign: IExpression['assign'];
  public readonly cooked: readonly string[] & { raw?: readonly string[] };
  public readonly func: IsLeftHandSide;
  public readonly expressions: readonly IsAssign[];

  public constructor(cooked: readonly string[] & { raw?: readonly string[] }, raw: readonly string[], func: IsLeftHandSide, expressions?: readonly IsAssign[]) {
    this.$kind = ExpressionKind.TaggedTemplate;
    this.assign = PLATFORM.noop as () => unknown;
    this.cooked = cooked;
    this.cooked.raw = raw;
    this.func = func;
    this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string {
    const expressions = this.expressions;
    const len = expressions.length;
    const results = Array(len);
    for (let i = 0, ii = len; i < ii; ++i) {
      results[i] = expressions[i].evaluate(flags, scope, locator, part);
    }
    const func = this.func.evaluate(flags, scope, locator, part);
    if (typeof func !== 'function') {
      throw Reporter.error(RuntimeError.NotAFunction, this);
    }
    return func(this.cooked, ...results);
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
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
  public readonly $kind: ExpressionKind.ArrayBindingPattern;
  public readonly elements: readonly IsAssign[];

  // We'll either have elements, or keys+values, but never all 3
  public constructor(elements: readonly IsAssign[]) {
    this.$kind = ExpressionKind.ArrayBindingPattern;
    this.elements = elements;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    // TODO
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, part?: string): unknown {
    // TODO
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayBindingPattern(this);
  }
}

export class ObjectBindingPattern implements IObjectBindingPattern {
  public readonly $kind: ExpressionKind.ObjectBindingPattern;
  public readonly keys: readonly (string | number)[];
  public readonly values: readonly IsAssign[];

  // We'll either have elements, or keys+values, but never all 3
  public constructor(keys: readonly (string | number)[], values: readonly IsAssign[]) {
    this.$kind = ExpressionKind.ObjectBindingPattern;
    this.keys = keys;
    this.values = values;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    // TODO
    return void 0;
  }

  public assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, part?: string): unknown {
    // TODO
    return void 0;
  }

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectBindingPattern(this);
  }
}

export class BindingIdentifier implements IBindingIdentifier {
  public readonly $kind: ExpressionKind.BindingIdentifier;
  public readonly name: string;

  public constructor(name: string) {
    this.$kind = ExpressionKind.BindingIdentifier;
    this.name = name;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, part?: string): string {
    return this.name;
  }
  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
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
  public readonly $kind: ExpressionKind.ForOfStatement;
  public assign: IExpression['assign'];
  public readonly declaration: BindingIdentifierOrPattern;
  public readonly iterable: IsBindingBehavior;

  public constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior) {
    this.$kind = ExpressionKind.ForOfStatement;
    this.assign = PLATFORM.noop as () => unknown;
    this.declaration = declaration;
    this.iterable = iterable;
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown {
    return this.iterable.evaluate(flags, scope, locator, part);
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

  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    this.declaration.connect(flags, scope, binding, part);
    this.iterable.connect(flags, scope, binding, part);
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
  public readonly $kind: ExpressionKind.Interpolation;
  public assign: IExpression['assign'];
  public readonly parts: readonly string[];
  public readonly expressions: readonly IsBindingBehavior[];
  public readonly isMulti: boolean;
  public readonly firstExpression: IsBindingBehavior;
  public constructor(parts: readonly string[], expressions?: readonly IsBindingBehavior[]) {
    this.$kind = ExpressionKind.Interpolation;
    this.assign = PLATFORM.noop as () => unknown;
    this.parts = parts;
    this.expressions = expressions === void 0 ? PLATFORM.emptyArray : expressions;
    this.isMulti = this.expressions.length > 1;
    this.firstExpression = this.expressions[0];
  }

  public evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string {
    if (this.isMulti) {
      const expressions = this.expressions;
      const parts = this.parts;
      let result = parts[0];
      for (let i = 0, ii = expressions.length; i < ii; ++i) {
        result += expressions[i].evaluate(flags, scope, locator, part);
        result += parts[i + 1];
      }
      return result;
    } else {
      const parts = this.parts;
      return parts[0] + this.firstExpression.evaluate(flags, scope, locator, part) + parts[1];
    }
  }
  public connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitInterpolation(this);
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, list: readonly IExpression[], part?: string): readonly IExpression[] {
  const len = list.length;
  const result = Array(len);
  for (let i = 0; i < len; ++i) {
    result[i] = list[i].evaluate(flags, scope, locator, part);
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
