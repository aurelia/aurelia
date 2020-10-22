/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  IIndexable,
  IServiceLocator,
  emptyArray,
  isNumberOrBigInt,
  isStringOrDate,
} from '@aurelia/kernel';
import {
  ExpressionKind,
  LifecycleFlags as LF,
} from '../flags';
import {
  Collection,
  IBindingContext,
  IObservable,
  IOverrideContext,
  ObservedCollection,
  IConnectable,
  ISubscriber,
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
import type { Scope } from '../observation/binding-context';

export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';

export type BinaryOperator = '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';

export type IsPrimary = AccessThisExpression | AccessScopeExpression | ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLiteral = ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLeftHandSide = IsPrimary | CallFunctionExpression | CallMemberExpression | CallScopeExpression | AccessMemberExpression | AccessKeyedExpression | TaggedTemplateExpression;
export type IsUnary = IsLeftHandSide | UnaryExpression;
export type IsBinary = IsUnary | BinaryExpression;
export type IsConditional = IsBinary | ConditionalExpression;
export type IsAssign = IsConditional | AssignExpression;
export type IsValueConverter = IsAssign | ValueConverterExpression;
export type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
export type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
export type IsExpression = IsBindingBehavior | Interpolation;
export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | HtmlLiteralExpression;
export type AnyBindingExpression = Interpolation | ForOfStatement | IsBindingBehavior;

export interface IExpressionHydrator {
  hydrate(jsonExpr: any): any;
}
export interface IVisitor<T = unknown> {
  visitAccessKeyed(expr: AccessKeyedExpression): T;
  visitAccessMember(expr: AccessMemberExpression): T;
  visitAccessScope(expr: AccessScopeExpression): T;
  visitAccessThis(expr: AccessThisExpression): T;
  visitArrayBindingPattern(expr: ArrayBindingPattern): T;
  visitArrayLiteral(expr: ArrayLiteralExpression): T;
  visitAssign(expr: AssignExpression): T;
  visitBinary(expr: BinaryExpression): T;
  visitBindingBehavior(expr: BindingBehaviorExpression): T;
  visitBindingIdentifier(expr: BindingIdentifier): T;
  visitCallFunction(expr: CallFunctionExpression): T;
  visitCallMember(expr: CallMemberExpression): T;
  visitCallScope(expr: CallScopeExpression): T;
  visitConditional(expr: ConditionalExpression): T;
  visitForOfStatement(expr: ForOfStatement): T;
  visitHtmlLiteral(expr: HtmlLiteralExpression): T;
  visitInterpolation(expr: Interpolation): T;
  visitObjectBindingPattern(expr: ObjectBindingPattern): T;
  visitObjectLiteral(expr: ObjectLiteralExpression): T;
  visitPrimitiveLiteral(expr: PrimitiveLiteralExpression): T;
  visitTaggedTemplate(expr: TaggedTemplateExpression): T;
  visitTemplate(expr: TemplateExpression): T;
  visitUnary(expr: UnaryExpression): T;
  visitValueConverter(expr: ValueConverterExpression): T;
}

function chooseScope(accessHostScope: boolean, s: Scope, hs: Scope | null){
  if (accessHostScope) {
    if (hs === null || hs === void 0) { throw new Error('Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?'); }
    return hs;
  }
  return s;
}

type BindingWithBehavior = IConnectableBinding & { [key: string]: BindingBehaviorInstance | undefined };

export class CustomExpression {
  public constructor(
    public readonly value: string,
  ) {}

  public evaluate(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _c: IConnectable | null): string {
    return this.value;
  }
}

/** @internal - only exists to workaround circular reference caused by emitted metadata */
export interface IBindingBehaviorExpression extends BindingBehaviorExpression {}
export class BindingBehaviorExpression {
  public get $kind(): ExpressionKind.BindingBehavior { return ExpressionKind.BindingBehavior; }
  public get hasBind(): true { return true; }
  public get hasUnbind(): true { return true; }
  public readonly behaviorKey: string;

  public constructor(
    public readonly expression: IsBindingBehavior,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
    this.behaviorKey = BindingBehavior.keyFrom(name);
  }

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    return this.expression.evaluate(f, s, hs, l, c);
  }

  public assign(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, val: unknown): unknown {
    return this.expression.assign(f, s, hs, l, val);
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    this.expression.connect(f, s, hs, b);
  }

  public bind(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    if (this.expression.hasBind) {
      this.expression.bind(f, s, hs, b);
    }
    const behavior = b.locator.get<BindingBehaviorInstance>(this.behaviorKey);
    if (behavior == null) {
      throw new Error(`BindingBehavior named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
    }
    if (!(behavior instanceof BindingBehaviorFactory)) {
      if ((b as BindingWithBehavior)[this.behaviorKey] === void 0) {
        (b as BindingWithBehavior)[this.behaviorKey] = behavior;
        (behavior.bind.call as (...args: unknown[]) => void)(behavior, f, s, hs, b, ...this.args.map(a => a.evaluate(f, s, hs, b.locator, null)));
      } else {
        throw new Error(`BindingBehavior named '${this.name}' already applied.`);
      }
    }
  }

  public unbind(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    if ((b as BindingWithBehavior)[this.behaviorKey] !== void 0) {
      if (typeof (b as BindingWithBehavior)[this.behaviorKey]!.unbind === 'function') {
        (b as BindingWithBehavior)[this.behaviorKey]!.unbind(f, s, hs, b);
      }
      (b as BindingWithBehavior)[this.behaviorKey] = void 0;
    }
    if (this.expression.hasUnbind) {
      this.expression.unbind(f, s, hs, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingBehavior(this);
  }
}

export class ValueConverterExpression {
  public get $kind(): ExpressionKind.ValueConverter { return ExpressionKind.ValueConverter; }
  public readonly converterKey: string;
  public get hasBind(): false { return false; }
  public get hasUnbind(): true { return true; }

  public constructor(
    public readonly expression: IsValueConverter,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
    this.converterKey = ValueConverter.keyFrom(name);
  }

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    const vc = l.get<ValueConverterExpression & ValueConverterInstance & { signals?: string[] }>(this.converterKey);
    if (vc == null) {
      throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
    }
    if ('toView' in vc) {
      // note: everything should be ISubscriber eventually
      // for now, it's sort of internal thing where only built-in bindings are passed as connectable
      // so it by default satisfies ISubscriber constrain
      if (c !== null && ('handleChange' in (c  as unknown as ISubscriber))) {
        const signals = vc.signals;
        if (signals != null) {
          const signaler = l.get(ISignaler);
          for (let i = 0, ii = signals.length; i < ii; ++i) {
            signaler.addSignalListener(signals[i], c as unknown as ISubscriber);
          }
        }
      }
      return (vc.toView.call as (...args: unknown[]) => void)(vc, this.expression.evaluate(f, s, hs, l, c), ...this.args.map(a => a.evaluate(f, s, hs, l, c)));
    }
    return this.expression.evaluate(f, s, hs, l, c);
  }

  public assign(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, val: unknown): unknown {
    const vc = l.get<ValueConverterExpression & ValueConverterInstance>(this.converterKey);
    if (vc == null) {
      throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
    }
    if ('fromView' in vc) {
      val = (vc.fromView!.call as (...args: unknown[]) => void)(vc, val, ...this.args.map(a => a.evaluate(f, s, hs, l, null)));
    }
    return this.expression.assign(f, s, hs, l, val);
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    this.expression.connect(f, s, hs, b);
    for (let i = 0; i < this.args.length; ++i) {
      this.args[i].connect(f, s, hs, b);
    }
    const vc = b.locator.get(this.converterKey) as { signals?: string[] };
    if (vc == null) {
      throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
    }
    if (vc.signals === void 0) {
      return;
    }
    const signaler = b.locator.get(ISignaler);
    for (let i = 0; i < vc.signals.length; ++i) {
      signaler.addSignalListener(vc.signals[i], b);
    }
  }

  public unbind(_f: LF, _s: Scope, _hs: Scope | null, b: IConnectableBinding): void {
    const vc = b.locator.get(this.converterKey) as { signals?: string[] };
    if (vc.signals === void 0) {
      return;
    }
    const signaler = b.locator.get(ISignaler);
    for (let i = 0; i < vc.signals.length; ++i) {
      signaler.removeSignalListener(vc.signals[i], b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitValueConverter(this);
  }
}

export class AssignExpression {
  public get $kind(): ExpressionKind.Assign { return ExpressionKind.Assign; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly target: IsAssignable,
    public readonly value: IsAssign,
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    return this.target.assign(f, s, hs, l, this.value.evaluate(f, s, hs, l, c));
  }

  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
    return;
  }

  public assign(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, val: unknown): unknown {
    this.value.assign(f, s, hs, l, val);
    return this.target.assign(f, s, hs, l, val);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAssign(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    return this.condition.evaluate(f, s, hs, l, c) ? this.yes.evaluate(f, s, hs, l, c) : this.no.evaluate(f, s, hs, l, c);
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    if (this.condition.evaluate(f, s, hs, b.locator, null)) {
      this.condition.connect(f, s, hs, b);
      this.yes.connect(f, s, hs, b);
    } else {
      this.condition.connect(f, s, hs, b);
      this.no.connect(f, s, hs, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitConditional(this);
  }
}

export class AccessThisExpression {
  public static readonly $this: AccessThisExpression = new AccessThisExpression(0);
  // $host and $this are loosely the same thing. $host is used in the context of `au-slot` with the primary objective of determining the s.
  public static readonly $host: AccessThisExpression = new AccessThisExpression(0);
  public static readonly $parent: AccessThisExpression = new AccessThisExpression(1);
  public get $kind(): ExpressionKind.AccessThis { return ExpressionKind.AccessThis; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly ancestor: number = 0,
  ) {}

  public evaluate(_f: LF, s: Scope, hs: Scope | null, _l: IServiceLocator, _c: IConnectable | null): IBindingContext | undefined {
    if (this === AccessThisExpression.$host) {
      s = chooseScope(true, s, hs);
    }
    let oc: IOverrideContext | null = s.overrideContext;
    let currentScope: Scope | null = s;
    let i = this.ancestor;
    while (i-- && oc) {
      currentScope = currentScope!.parentScope;
      oc = currentScope?.overrideContext ?? null;
    }
    return i < 1 && oc ? oc.bindingContext : void 0;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessThis(this);
  }
}

export class AccessScopeExpression {
  public get $kind(): ExpressionKind.AccessScope { return ExpressionKind.AccessScope; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly name: string,
    public readonly ancestor: number = 0,
    public readonly accessHostScope: boolean = false,
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, _l: IServiceLocator, c: IConnectable | null): IBindingContext | IOverrideContext {
    const obj = BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs) as IBindingContext;
    if (c !== null) {
      c.observeProperty(f, obj, this.name);
    }
    const evaluatedValue = obj[this.name] as ReturnType<AccessScopeExpression['evaluate']>;
    if (f & LF.isStrictBindingStrategy) {
      return evaluatedValue;
    }
    return evaluatedValue == null ? '' as unknown as ReturnType<AccessScopeExpression['evaluate']> : evaluatedValue;
  }

  public assign(f: LF, s: Scope, hs: Scope | null, _l: IServiceLocator, val: unknown): unknown {
    const obj = BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs) as IObservable;
    if (obj instanceof Object) {
      if (obj.$observers?.[this.name] !== void 0) {
        obj.$observers[this.name].setValue(val, f);
        return val;
      } else {
        return obj[this.name] = val;
      }
    }
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    const context = BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs)!;
    b.observeProperty(f, context, this.name);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessScope(this);
  }
}

export class AccessMemberExpression {
  public get $kind(): ExpressionKind.AccessMember { return ExpressionKind.AccessMember; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    const instance = this.object.evaluate(f, s, hs, l, c) as IIndexable;
    if (f & LF.isStrictBindingStrategy) {
      if (instance == null) {
        return instance;
      }
      if (c !== null) {
        c.observeProperty(f, instance, this.name);
      }
      return instance[this.name];
    }
    if (c !== null && instance instanceof Object) {
      c.observeProperty(f, instance, this.name);
    }
    return instance ? instance[this.name] : '';
  }

  public assign(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, val: unknown): unknown {
    const obj = this.object.evaluate(f, s, hs, l, null) as IObservable;
    if (obj instanceof Object) {
      if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
        obj.$observers[this.name].setValue(val, f);
      } else {
        obj[this.name] = val;
      }
    } else {
      this.object.assign(f, s, hs, l, { [this.name]: val });
    }
    return val;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    const obj = this.object.evaluate(f, s, hs, b.locator, null) as IIndexable;
    if ((f & LF.observeLeafPropertiesOnly) === 0) {
      this.object.connect(f, s, hs, b);
    }
    if (obj instanceof Object) {
      b.observeProperty(f, obj, this.name);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessMember(this);
  }
}

export class AccessKeyedExpression {
  public get $kind(): ExpressionKind.AccessKeyed { return ExpressionKind.AccessKeyed; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly key: IsAssign,
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    const instance = this.object.evaluate(f, s, hs, l, c) as IIndexable;
    if (instance instanceof Object) {
      const key = this.key.evaluate(f, s, hs, l, c) as string;
      if (c !== null) {
        c.observeProperty(f, instance, key);
      }
      return instance[key];
    }
    return void 0;
  }

  public assign(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, val: unknown): unknown {
    const instance = this.object.evaluate(f, s, hs, l, null) as IIndexable;
    const key = this.key.evaluate(f, s, hs, l, null) as string;
    return instance[key] = val;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    const obj = this.object.evaluate(f, s, hs, b.locator, null);
    if ((f & LF.observeLeafPropertiesOnly) === 0) {
      this.object.connect(f, s, hs, b);
    }
    if (obj instanceof Object) {
      this.key.connect(f, s, hs, b);
      const key = this.key.evaluate(f, s, hs, b.locator, null);
      // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
      b.observeProperty(f, obj, key as string);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessKeyed(this);
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
    public readonly accessHostScope: boolean = false,
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    s = chooseScope(this.accessHostScope, s, hs);

    const args = this.args.map(a => a.evaluate(f, s, hs, l, c));
    const context = BindingContext.get(s, this.name, this.ancestor, f, hs)!;
    // ideally, should observe property represents by this.name as well
    // because it could be changed
    // todo: did it ever surprise anyone?
    const func = getFunction(f, context, this.name);
    if (func) {
      return func.apply(context, args as unknown[]);
    }
    return void 0;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    for (let i = 0; i < this.args.length; ++i) {
      this.args[i].connect(f, s, hs, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallScope(this);
  }
}

export class CallMemberExpression {
  public get $kind(): ExpressionKind.CallMember { return ExpressionKind.CallMember; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    const instance = this.object.evaluate(f, s, hs, l, c) as IIndexable;

    const args = this.args.map(a => a.evaluate(f, s, hs, l, c));
    const func = getFunction(f, instance, this.name);
    if (func) {
      return func.apply(instance, args as unknown[]);
    }
    return void 0;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    const obj = this.object.evaluate(f, s, hs, b.locator, null) as IIndexable;
    if ((f & LF.observeLeafPropertiesOnly) === 0) {
      this.object.connect(f, s, hs, b);
    }
    if (getFunction(f & ~LF.mustEvaluate, obj, this.name)) {
      for (let i = 0; i < this.args.length; ++i) {
        this.args[i].connect(f, s, hs, b);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallMember(this);
  }
}

export class CallFunctionExpression {
  public get $kind(): ExpressionKind.CallFunction { return ExpressionKind.CallFunction; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly func: IsLeftHandSide,
    public readonly args: readonly IsAssign[],
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    const func = this.func.evaluate(f, s, hs, l, c);
    if (typeof func === 'function') {
      return func(...this.args.map(a => a.evaluate(f, s, hs, l, c)));
    }
    if (!(f & LF.mustEvaluate) && (func == null)) {
      return void 0;
    }
    throw new Error(`Expression is not a function.`);
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    const func = this.func.evaluate(f, s, hs, b.locator, null);
    this.func.connect(f, s, hs, b);
    if (typeof func === 'function') {
      for (let i = 0; i < this.args.length; ++i) {
        this.args[i].connect(f, s, hs, b);
      }
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitCallFunction(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    switch (this.operation) {
      case '&&':
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return this.left.evaluate(f, s, hs, l, c) && this.right.evaluate(f, s, hs, l, c);
      case '||':
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return this.left.evaluate(f, s, hs, l, c) || this.right.evaluate(f, s, hs, l, c);
      case '==':
        // eslint-disable-next-line eqeqeq
        return this.left.evaluate(f, s, hs, l, c) == this.right.evaluate(f, s, hs, l, c);
      case '===':
        return this.left.evaluate(f, s, hs, l, c) === this.right.evaluate(f, s, hs, l, c);
      case '!=':
        // eslint-disable-next-line eqeqeq
        return this.left.evaluate(f, s, hs, l, c) != this.right.evaluate(f, s, hs, l, c);
      case '!==':
        return this.left.evaluate(f, s, hs, l, c) !== this.right.evaluate(f, s, hs, l, c);
      case 'instanceof': {
        const right = this.right.evaluate(f, s, hs, l, c);
        if (typeof right === 'function') {
          return this.left.evaluate(f, s, hs, l, c) instanceof right;
        }
        return false;
      }
      case 'in': {
        const right = this.right.evaluate(f, s, hs, l, c);
        if (right instanceof Object) {
          return this.left.evaluate(f, s, hs, l, c) as string in right;
        }
        return false;
      }
      // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
      // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
      // this makes bugs in user code easier to track down for end users
      // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
      case '+': {
        const left: any = this.left.evaluate(f, s, hs, l, c);
        const right: any = this.right.evaluate(f, s, hs, l, c);

        if ((f & LF.isStrictBindingStrategy) > 0) {
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
        return (this.left.evaluate(f, s, hs, l, c) as number) - (this.right.evaluate(f, s, hs, l, c) as number);
      case '*':
        return (this.left.evaluate(f, s, hs, l, c) as number) * (this.right.evaluate(f, s, hs, l, c) as number);
      case '/':
        return (this.left.evaluate(f, s, hs, l, c) as number) / (this.right.evaluate(f, s, hs, l, c) as number);
      case '%':
        return (this.left.evaluate(f, s, hs, l, c) as number) % (this.right.evaluate(f, s, hs, l, c) as number);
      case '<':
        return (this.left.evaluate(f, s, hs, l, c) as number) < (this.right.evaluate(f, s, hs, l, c) as number);
      case '>':
        return (this.left.evaluate(f, s, hs, l, c) as number) > (this.right.evaluate(f, s, hs, l, c) as number);
      case '<=':
        return (this.left.evaluate(f, s, hs, l, c) as number) <= (this.right.evaluate(f, s, hs, l, c) as number);
      case '>=':
        return (this.left.evaluate(f, s, hs, l, c) as number) >= (this.right.evaluate(f, s, hs, l, c) as number);
      default:
        throw new Error(`Unknown binary operator: '${this.operation}'`);
    }
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    this.left.connect(f, s, hs, b);
    this.right.connect(f, s, hs, b);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBinary(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    switch (this.operation) {
      case 'void':
        return void this.expression.evaluate(f, s, hs, l, c);
      case 'typeof':
        return typeof this.expression.evaluate(f | LF.isStrictBindingStrategy, s, hs, l, c);
      case '!':
        return !(this.expression.evaluate(f, s, hs, l, c) as boolean);
      case '-':
        return -(this.expression.evaluate(f, s, hs, l, c) as number);
      case '+':
        return +(this.expression.evaluate(f, s, hs, l, c) as number);
      default:
        throw new Error(`Unknown unary operator: '${this.operation}'`);
    }
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    this.expression.connect(f, s, hs, b);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitUnary(this);
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

  public evaluate(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _c: IConnectable | null): TValue {
    return this.value;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitPrimitiveLiteral(this);
  }
}

export class HtmlLiteralExpression {
  public get $kind(): ExpressionKind.HtmlLiteral { return ExpressionKind.HtmlLiteral; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly parts: readonly HtmlLiteralExpression[],
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): string {
    let result = '';
    for (let i = 0; i < this.parts.length; ++i) {
      const v = this.parts[i].evaluate(f, s, hs, l, c);
      if (v == null) {
        continue;
      }
      result += v;
    }
    return result;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown, _projection?: CustomElementDefinition): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    for (let i = 0; i < this.parts.length; ++i) {
      this.parts[i].connect(f, s, hs, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitHtmlLiteral(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): readonly unknown[] {
    return this.elements.map(e => e.evaluate(f, s, hs, l, c));
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    for (let i = 0; i < this.elements.length; ++i) {
      this.elements[i].connect(f, s, hs, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayLiteral(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): Record<string, unknown> {
    const instance: Record<string, unknown> = {};
    for (let i = 0; i < this.keys.length; ++i) {
      instance[this.keys[i]] = this.values[i].evaluate(f, s, hs, l, c);
    }
    return instance;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    for (let i = 0; i < this.keys.length; ++i) {
      this.values[i].connect(f, s, hs, b);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectLiteral(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): string {
    let result = this.cooked[0];
    for (let i = 0; i < this.expressions.length; ++i) {
      result += String(this.expressions[i].evaluate(f, s, hs, l, c));
      result += this.cooked[i + 1];
    }
    return result;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    for (let i = 0; i < this.expressions.length; ++i) {
      this.expressions[i].connect(f, s, hs, b);
      i++;
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTemplate(this);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): string {
    const results = this.expressions.map(e => e.evaluate(f, s, hs, l, c));
    const func = this.func.evaluate(f, s, hs, l, c);
    if (typeof func !== 'function') {
      throw new Error(`Left-hand side of tagged template expression is not a function.`);
    }
    return func(this.cooked, ...results);
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    for (let i = 0; i < this.expressions.length; ++i) {
      this.expressions[i].connect(f, s, hs, b);
    }
    this.func.connect(f, s, hs, b);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitTaggedTemplate(this);
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

  public evaluate(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _c: IConnectable | null): unknown {
    // TODO
    return void 0;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    // TODO
    return void 0;
  }

  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayBindingPattern(this);
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

  public evaluate(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _c: IConnectable | null): unknown {
    // TODO
    return void 0;
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    // TODO
    return void 0;
  }

  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectBindingPattern(this);
  }
}

export class BindingIdentifier {
  public get $kind(): ExpressionKind.BindingIdentifier { return ExpressionKind.BindingIdentifier; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly name: string,
  ) {}

  public evaluate(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator | null, _c: IConnectable | null): string {
    return this.name;
  }
  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
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
export class ForOfStatement {
  public get $kind(): ExpressionKind.ForOfStatement { return ExpressionKind.ForOfStatement; }
  public get hasBind(): false { return false; }
  public get hasUnbind(): false { return false; }

  public constructor(
    public readonly declaration: BindingIdentifierOrPattern,
    public readonly iterable: IsBindingBehavior,
  ) {}

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): unknown {
    return this.iterable.evaluate(f, s, hs, l, c);
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public count(_f: LF, result: ObservedCollection | number | null | undefined): number {
    switch (toStringTag.call(result)) {
      case '[object Array]': return (result as unknown[]).length;
      case '[object Map]': return (result as Map<unknown, unknown>).size;
      case '[object Set]': return (result as Set<unknown>).size;
      case '[object Number]': return result as number;
      case '[object Null]': return 0;
      case '[object Undefined]': return 0;
      default: throw new Error(`Cannot count ${toStringTag.call(result)}`);
    }
  }

  public iterate(f: LF, result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void {
    switch (toStringTag.call(result)) {
      case '[object Array]': return $array(f, result as unknown[], func);
      case '[object Map]': return $map(f, result as Map<unknown, unknown>, func);
      case '[object Set]': return $set(f, result as Set<unknown>, func);
      case '[object Number]': return $number(f, result as number, func);
      case '[object Null]': return;
      case '[object Undefined]': return;
      default: throw new Error(`Cannot iterate over ${toStringTag.call(result)}`);
    }
  }

  public connect(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    this.declaration.connect(f, s, hs, b);
    this.iterable.connect(f, s, hs, b);
  }

  public bind(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    if (this.iterable.hasBind) {
      this.iterable.bind(f, s, hs, b);
    }
  }

  public unbind(f: LF, s: Scope, hs: Scope | null, b: IConnectableBinding): void {
    if (this.iterable.hasUnbind) {
      this.iterable.unbind(f, s, hs, b);
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

  public evaluate(f: LF, s: Scope, hs: Scope | null, l: IServiceLocator, c: IConnectable | null): string {
    if (this.isMulti) {
      let result = this.parts[0];
      for (let i = 0; i < this.expressions.length; ++i) {
        result += String(this.expressions[i].evaluate(f, s, hs, l, c));
        result += this.parts[i + 1];
      }
      return result;
    } else {
      return `${this.parts[0]}${this.firstExpression.evaluate(f, s, hs, l, c)}${this.parts[1]}`;
    }
  }

  public assign(_f: LF, _s: Scope, _hs: Scope | null, _l: IServiceLocator, _obj: unknown): unknown {
    return void 0;
  }

  public connect(_f: LF, _s: Scope, _hs: Scope | null, _b: IConnectableBinding): void {
    return;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitInterpolation(this);
  }
}

function getFunction(f: LF, obj: object, name: string): ((...args: unknown[]) => unknown) | null {
  const func = obj == null ? null : (obj as IIndexable)[name];
  if (typeof func === 'function') {
    return func as (...args: unknown[]) => unknown;
  }
  if (!(f & LF.mustEvaluate) && func == null) {
    return null;
  }
  throw new Error(`Expected '${name}' to be a function`);
}

const proxyAndOriginalArray = LF.proxyStrategy;

function $array(f: LF, result: unknown[], func: (arr: Collection, index: number, item: unknown) => void): void {
  if ((f & proxyAndOriginalArray) === proxyAndOriginalArray) {
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

function $map(f: LF, result: Map<unknown, unknown>, func: (arr: Collection, index: number, item: unknown) => void): void {
  const arr = Array(result.size);
  let i = -1;
  for (const entry of result.entries()) {
    arr[++i] = entry;
  }
  $array(f, arr, func);
}

function $set(f: LF, result: Set<unknown>, func: (arr: Collection, index: number, item: unknown) => void): void {
  const arr = Array(result.size);
  let i = -1;
  for (const key of result.keys()) {
    arr[++i] = key;
  }
  $array(f, arr, func);
}

function $number(f: LF, result: number, func: (arr: Collection, index: number, item: unknown) => void): void {
  const arr = Array(result);
  for (let i = 0; i < result; ++i) {
    arr[i] = i;
  }
  $array(f, arr, func);
}
