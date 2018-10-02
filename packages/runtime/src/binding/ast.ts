// tslint:disable:no-any
// tslint:disable:function-name
// tslint:disable:no-empty
import { IServiceLocator, PLATFORM } from '@aurelia/kernel';
import { IBinding } from './binding';
import { BindingBehaviorResource } from './binding-behavior';
import { BindingContext, IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { Collection } from './observation';
import { ISignaler } from './signaler';
import { ValueConverterResource } from './value-converter';

export type IsPrimary = AccessThis | AccessScope | ArrayLiteral | ObjectLiteral | PrimitiveLiteral | Template;
export type IsUnary = IsPrimary | Unary;
export type IsLeftHandSide = IsUnary | CallFunction | CallMember | CallScope | AccessMember | AccessKeyed | TaggedTemplate;
export type IsBinary = IsLeftHandSide | Binary;
export type IsConditional = IsBinary | Conditional;
export type IsAssign = IsConditional | Assign;
export type IsValueConverter = IsAssign | ValueConverter;
export type IsBindingBehavior = IsValueConverter | BindingBehavior;
export type IsAssignable = AccessScope | AccessKeyed | AccessMember;

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
  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): any;
  connect(flags: BindingFlags, scope: IScope, binding: IBinding): any;
  accept<T>(visitor: IVisitor<T>): T;
  assign?(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null, value: any): any;
  bind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
  unbind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
}

export const enum ExpressionKind {
  IsPrimary            = 0b00000001_00000,
  IsLeftHandSide       = 0b00000010_00000,
  IsAssignable         = 0b00000100_00000,
  IsExpression         = 0b00001000_00000,
  IsResource           = 0b00010000_00000,
  IsStatement          = 0b00100000_00000,
  IsDestructuring      = 0b01000000_00000,
  IsForDeclaration     = 0b10000000_00000,
  Type                 = 0b00000000_11111,
  AccessThis           = 0b00001001_00001,
  AccessScope          = 0b00001101_00010,
  ArrayLiteral         = 0b00001001_00011,
  ObjectLiteral        = 0b00001001_00100,
  PrimitiveLiteral     = 0b00001001_00101,
  Template             = 0b00001001_00110,
  Unary                = 0b00001000_00111,
  CallScope            = 0b00001010_01000,
  CallMember           = 0b00001010_01001,
  CallFunction         = 0b00001010_01010,
  AccessMember         = 0b00001110_01011,
  AccessKeyed          = 0b00001110_01100,
  TaggedTemplate       = 0b00001010_01101,
  Binary               = 0b00001000_01110,
  Conditional          = 0b00001000_11111,
  Assign               = 0b00001000_10000,
  ValueConverter       = 0b00010000_10001,
  BindingBehavior      = 0b00010000_10010,
  HtmlLiteral          = 0b00000000_10011,
  ArrayBindingPattern  = 0b11000000_10100,
  ObjectBindingPattern = 0b11000000_10101,
  BindingIdentifier    = 0b10000000_10110,
  ForOfStatement       = 0b00100000_10111,
  Interpolation        = 0b00001000_11000
}

export class BindingBehavior implements IExpression {
  public $kind: ExpressionKind;
  public readonly behaviorKey: string;
  private readonly expressionHasBind: boolean;
  private readonly expressionHasUnbind: boolean;
  constructor(
    public readonly expression: IsBindingBehavior,
    public readonly name: string,
    public readonly args: ReadonlyArray<IsAssign>) {
    this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
    if ((<any>expression).expression) {
      this.expressionHasBind = !!(<any>expression).bind;
      this.expressionHasUnbind = !!(<any>expression).unbind;
    } else {
      this.expressionHasBind = false;
      this.expressionHasUnbind = false;
    }
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.expression.evaluate(flags, scope, locator);
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any): any {
    return (<any>this.expression).assign(flags, scope, locator, value);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    this.expression.connect(flags, scope, binding);
  }

  public bind(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    if (this.expressionHasBind) {
      (<any>this.expression).bind(flags, scope, binding);
    }
    const behaviorKey = this.behaviorKey;
    const locator = binding.locator;
    const behavior = locator.get(behaviorKey) as BindingBehavior;
    if (!behavior) {
      throw new Error(`No BindingBehavior named "${this.name}" was found!`);
    }
    if ((binding as any)[behaviorKey]) {
      throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
    }
    binding[behaviorKey] = behavior;
    behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const behaviorKey = this.behaviorKey;
    binding[behaviorKey].unbind(flags, scope, binding);
    binding[behaviorKey] = null;
    if (this.expressionHasUnbind) {
      (<any>this.expression).unbind(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingBehavior(this);
  }
}

export class ValueConverter implements IExpression {
  public $kind: ExpressionKind;
  public readonly converterKey: string;
  constructor(
    public readonly expression: IsValueConverter,
    public readonly name: string,
    public readonly args: ReadonlyArray<IsAssign>) {
    this.converterKey = ValueConverterResource.keyFrom(this.name);
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    if ('toView' in converter) {
      const args = this.args;
      const len = args.length;
      const result = Array(len + 1);
      result[0] = this.expression.evaluate(flags, scope, locator);
      for (let i = 0; i < len; ++i) {
        result[i + 1] = args[i].evaluate(flags, scope, locator);
      }
      return (<any>converter).toView.apply(converter, result);
    }
    return this.expression.evaluate(flags, scope, locator);
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any): any {
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    if ('fromView' in converter) {
      value = (<any>converter).fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
    }
    return (<any>this.expression).assign(flags, scope, locator, value);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    this.expression.connect(flags, scope, binding);
    const args = this.args;
    for (let i = 0, ii = args.length; i < ii; ++i) {
      args[i].connect(flags, scope, binding);
    }
    const locator = binding.locator;
    const converter = locator.get(this.converterKey) as ISignaler;
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    const signals = (converter as any).signals;
    if (signals === undefined) {
      return;
    }
    const signaler = locator.get(ISignaler) as ISignaler;
    for (let i = 0, ii = signals.length; i < ii; ++i) {
      signaler.addSignalListener(signals[i], binding as any);
    }
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const locator = binding.locator;
    const converter = locator.get(this.converterKey);
    const signals = (converter as any).signals;
    if (signals === undefined) {
      return;
    }
    const signaler = locator.get(ISignaler) as ISignaler;
    for (let i = 0, ii = signals.length; i < ii; ++i) {
      signaler.removeSignalListener(signals[i], binding as any);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitValueConverter(this);
  }
}

export class Assign implements IExpression {
  public $kind: ExpressionKind;
  constructor(
    public readonly target: IsAssignable,
    public readonly value: IsAssign) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any): any {
    (<any>this.value).assign(flags, scope, locator, value);
    this.target.assign(flags, scope, locator, value);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAssign(this);
  }
}

export class Conditional implements IExpression {
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly condition: IExpression,
    public readonly yes: IExpression,
    public readonly no: IExpression) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return (!!this.condition.evaluate(flags, scope, locator))
      ? this.yes.evaluate(flags, scope, locator)
      : this.no.evaluate(flags, scope, locator);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  public connect: IExpression['connect'];
  constructor(
    public readonly ancestor: number = 0) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    let oc = scope.overrideContext;
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
  public $kind: ExpressionKind;
  constructor(
    public readonly name: string,
    public readonly ancestor: number = 0) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const name = this.name;
    return BindingContext.get(scope, name, this.ancestor)[name];
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any): any {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    return context ? (context[name] = value) : undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    binding.observeProperty(context, name);
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitAccessScope(this);
  }
}

export class AccessMember implements IExpression {
  public $kind: ExpressionKind;
  constructor(
    public readonly object: IExpression,
    public readonly name: string) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const instance = this.object.evaluate(flags, scope, locator);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any): any {
    let instance = this.object.evaluate(flags, scope, locator);
    if (instance === null || typeof instance !== 'object') {
      instance = {};
      this.object.assign(flags, scope, locator, instance);
    }
    instance[this.name] = value;
    return value;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  constructor(
    public readonly object: IExpression,
    public readonly key: IExpression) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const instance = this.object.evaluate(flags, scope, locator);
    if (instance === null || instance === undefined) {
      return undefined;
    }
    const key = this.key.evaluate(flags, scope, locator);
    // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
    // and the runtime does this this faster
    return instance[key];
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any | null): any {
    const instance = this.object.evaluate(flags, scope, locator);
    const key = this.key.evaluate(flags, scope, locator);
    return instance[key] = value;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly name: string,
    public readonly args: ReadonlyArray<IExpression>,
    public readonly ancestor: number = 0) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): any {
    const args = evalList(flags, scope, locator, this.args);
    const context = BindingContext.get(scope, this.name, this.ancestor);
    const func = getFunction(flags, context, this.name);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly object: IExpression,
    public readonly name: string,
    public readonly args: ReadonlyArray<IExpression>) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const instance = this.object.evaluate(flags, scope, locator);
    const args = evalList(flags, scope, locator, this.args);
    const func = getFunction(flags, instance, this.name);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const obj = this.object.evaluate(flags, scope, null);
    this.object.connect(flags, scope, binding);
    if (getFunction(flags & ~BindingFlags.mustEvaluate, obj, this.name)) {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly func: IExpression,
    public readonly args: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const func = this.func.evaluate(flags, scope, locator);
    if (typeof func === 'function') {
      return func.apply(null, evalList(flags, scope, locator, this.args));
    }
    if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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

export class Binary implements IExpression {
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly operation: string,
    public readonly left: IExpression,
    public readonly right: IExpression) {
    // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
    // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
    // work to do; we can do this because the operation can't change after it's parsed
    this.evaluate = this[operation];
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {}

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const left = this.left.evaluate(flags, scope, null);
    this.left.connect(flags, scope, binding);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(flags, scope, binding);
  }

  private ['&&'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
  }
  private ['||'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
  }
  private ['=='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    // tslint:disable-next-line:triple-equals
    return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
  }
  private ['==='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
  }
  private ['!='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    // tslint:disable-next-line:triple-equals
    return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
  }
  private ['!=='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
  }
  private ['instanceof'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    const right = this.right.evaluate(f, s, l);
    if (typeof right === 'function') {
      return this.left.evaluate(f, s, l) instanceof right;
    }
    return false;
  }
  private ['in'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
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
  private ['+'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) + this.right.evaluate(f, s, l);
  }
  private ['-'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) - this.right.evaluate(f, s, l);
  }
  private ['*'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) * this.right.evaluate(f, s, l);
  }
  private ['/'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) / this.right.evaluate(f, s, l);
  }
  private ['%'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) % this.right.evaluate(f, s, l);
  }
  private ['<'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
  }
  private ['>'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
  }
  private ['<='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
  }
  private ['>='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
  }

  // tslint:disable-next-line:member-ordering
  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBinary(this);
  }
}

export class Unary implements IExpression {
  public $kind: ExpressionKind;
  constructor(
    public readonly operation: 'void' | 'typeof' | '!' | '-' | '+',
    public readonly expression: IsLeftHandSide) {
    // see Binary (we're doing the same thing here)
    this.evaluate = this[operation];
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {}

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    this.expression.connect(flags, scope, binding);
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any): any {
    throw new Error(`Binding expression "${this}" cannot be assigned to.`);
  }

  private ['void'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return void this.expression.evaluate(f, s, l);
  }
  private ['typeof'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return typeof this.expression.evaluate(f, s, l);
  }
  private ['!'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return !this.expression.evaluate(f, s, l);
  }
  private ['-'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return -this.expression.evaluate(f, s, l);
  }
  private ['+'](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return +this.expression.evaluate(f, s, l);
  }

  // tslint:disable-next-line:member-ordering
  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitUnary(this);
  }
}

export class PrimitiveLiteral implements IExpression {
  public $kind: ExpressionKind;
  public connect: IExpression['connect'];
  public assign: IExpression['assign'];
  constructor(public readonly value: any) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.value;
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitPrimitiveLiteral(this);
  }
}

export class HtmlLiteral implements IExpression {
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(public readonly parts: ReadonlyArray<IExpression>) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
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

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    for (let i = 0, ii = this.parts.length; i < ii; ++i) {
      this.parts[i].connect(flags, scope, binding);
    }
  }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitHtmlLiteral(this);
  }
}

export class ArrayLiteral implements IExpression {
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(public readonly elements: ReadonlyArray<IExpression>) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any[] {
    const elements = this.elements;
    const length = elements.length;
    const result = Array(length);
    for (let i = 0; i < length; ++i) {
      result[i] = elements[i].evaluate(flags, scope, locator);
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly keys: ReadonlyArray<number | string>,
    public readonly values: ReadonlyArray<IExpression>) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    const instance: Record<string, any> = {};
    const keys = this.keys;
    const values = this.values;
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      instance[keys[i]] = values[i].evaluate(flags, scope, locator);
    }
    return instance;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly cooked: ReadonlyArray<string>,
    public readonly expressions?: ReadonlyArray<IsAssign>) {
    this.expressions = expressions || PLATFORM.emptyArray;
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const cooked = this.cooked;
    let result = cooked[0];
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      result += expressions[i].evaluate(flags, scope, locator);
      result += cooked[i + 1];
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly cooked: ReadonlyArray<string> & { raw?: ReadonlyArray<string> },
    raw: ReadonlyArray<string>,
    public readonly func: IsLeftHandSide,
    public readonly expressions?: ReadonlyArray<IsAssign>) {
    cooked.raw = raw;
    this.expressions = expressions || PLATFORM.emptyArray;
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const len = expressions.length;
    const results = Array(len);
    for (let i = 0, ii = len; i < ii; ++i) {
      results[i] = expressions[i].evaluate(flags, scope, locator);
    }
    const func = this.func.evaluate(flags, scope, locator);
    if (typeof func !== 'function') {
      throw new Error(`${this.func} is not a function`);
    }
    return func.apply(null, [this.cooked].concat(results));
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  // We'll either have elements, or keys+values, but never all 3
  constructor(
    public readonly elements: ReadonlyArray<IsAssign>
  ) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    // TODO
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: any): any {
    // TODO
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitArrayBindingPattern(this);
  }
}

export class ObjectBindingPattern implements IExpression {
  public $kind: ExpressionKind;
  // We'll either have elements, or keys+values, but never all 3
  constructor(
    public readonly keys: ReadonlyArray<string | number>,
    public readonly values: ReadonlyArray<IsAssign>
  ) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    // TODO
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: any): any {
    // TODO
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitObjectBindingPattern(this);
  }
}

export class BindingIdentifier implements IExpression {
  public $kind: ExpressionKind;
  constructor(public readonly name: string) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.name;
  }
  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }

  public accept<T>(visitor: IVisitor<T>): T {
    return visitor.visitBindingIdentifier(this);
  }
}

export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;

const toStringTag = Object.prototype.toString;

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement implements IExpression {
  public $kind: ExpressionKind;
  constructor(
    public readonly declaration: BindingIdentifierOrPattern,
    public readonly iterable: IsBindingBehavior) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.iterable.evaluate(flags, scope, locator);
  }

  public count(result: any): number {
    return CountForOfStatement[toStringTag.call(result)](result);
  }

  public iterate(result: any, func: (arr: Collection, index: number, item: any) => void): void {
    IterateForOfStatement[toStringTag.call(result)](result, func);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
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
  public $kind: ExpressionKind;
  public assign: IExpression['assign'];
  constructor(
    public readonly parts: ReadonlyArray<string>,
    public readonly expressions: ReadonlyArray<IExpression>) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const parts = this.parts;
    let result = parts[0];
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      result += expressions[i].evaluate(flags, scope, locator);
      result += parts[i + 1];
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const expressions = this.expressions;
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      expressions[i].connect(flags, scope, binding);
    }
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
function evalList(flags: BindingFlags, scope: IScope, locator: IServiceLocator, list: ReadonlyArray<IExpression>): any[] {
  const len = list.length;
  const result = Array(len);
  for (let i = 0; i < len; ++i) {
    result[i] = list[i].evaluate(flags, scope, locator);
  }
  return result;
}

function getFunction(flags: BindingFlags, obj: any, name: string): any {
  const func = obj === null || obj === undefined ? null : obj[name];
  if (typeof func === 'function') {
    return func;
  }
  if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
    return null;
  }
  throw new Error(`${name} is not a function`);
}

function isNumeric(value: string): boolean {
  // tslint:disable-next-line:no-reserved-keywords
  const type = typeof value;
  if (type === 'number') return true;
  if (type !== 'string') return false;
  const len = value.length;
  if (len === 0) return false;
  for (let i = 0; i < len; ++i) {
    const char = value.charCodeAt(i);
    if (char < 0x30 /*0*/ || char > 0x39/*9*/) {
      return false;
    }
  }
  return true;
}

/*@internal*/
export const IterateForOfStatement = {
  ['[object Array]'](result: any[], func: (arr: Collection, index: number, item: any) => void): void {
    for (let i = 0, ii = result.length; i < ii; ++i) {
      func(result, i, result[i]);
    }
  },
  ['[object Map]'](result: Map<any, any>, func: (arr: Collection, index: number, item: any) => void): void {
    const arr = Array(result.size);
    let i = -1;
    for (const entry of result.entries()) {
      arr[++i] = entry;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Set]'](result: Set<any>, func: (arr: Collection, index: number, item: any) => void): void {
    const arr = Array(result.size);
    let i = -1;
    for (const key of result.keys()) {
      arr[++i] = key;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Number]'](result: number, func: (arr: Collection, index: number, item: any) => void): void {
    const arr = Array(result);
    for (let i = 0; i < result; ++i) {
      arr[i] = i;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Null]'](result: null, func: (arr: Collection, index: number, item: any) => void): void { },
  ['[object Undefined]'](result: null, func: (arr: Collection, index: number, item: any) => void): void { }
};

/*@internal*/
export const CountForOfStatement = {
  ['[object Array]'](result: any[]): number { return result.length; },
  ['[object Map]'](result: Map<any, any>): number { return result.size; },
  ['[object Set]'](result: Set<any>): number { return result.size; },
  ['[object Number]'](result: number): number { return result; },
  ['[object Null]'](result: null): number { return 0; },
  ['[object Undefined]'](result: null): number { return 0; }
};

// Give each AST class a noop for each interface method if and only if it's not already defined
// This accomplishes the following:
//   1) no runtime error due to bad AST structure (it's the parser's job to guard against that)
//   2) no runtime error due to a bad binding such as two-way on a literal (no need, since it doesn't threaten the integrity of the app's state)
//   3) should we decide something else, we can easily change the global behavior of 1) and 2) by simply assigning a different method here (either in the source or via AOT)
const ast = [AccessThis, AccessScope, ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template, Unary, CallFunction, CallMember, CallScope, AccessMember, AccessKeyed, TaggedTemplate, Binary, Conditional, Assign];
for (let i = 0, ii = ast.length; i < ii; ++i) {
  const proto = ast[i].prototype;
  proto.assign = proto.assign || PLATFORM.noop;
  proto.connect = proto.connect || PLATFORM.noop;
}
