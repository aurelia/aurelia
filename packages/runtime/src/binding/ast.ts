import { IServiceLocator } from '@aurelia/kernel';
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

export interface IExpression {
  readonly $kind: ExpressionKind;
  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): any;
  connect(flags: BindingFlags, scope: IScope, binding: IBinding): any;
  assign?(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null, value: any): any;
  bind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
  unbind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
}

export const enum ExpressionKind {
  IsPrimary            = 0b00000001 << 5,
  IsLeftHandSide       = 0b00000010 << 5,
  IsAssignable         = 0b00000100 << 5,
  IsExpression         = 0b00001000 << 5,
  IsResource           = 0b00010000 << 5,
  IsStatement          = 0b00100000 << 5,
  IsDestructuring      = 0b01000000 << 5,
  IsForDeclaration     = 0b10000000 << 5,
  Type                 =                   0b11111,
  AccessThis           = 0b00001001 << 5 | 0b00001,
  AccessScope          = 0b00001101 << 5 | 0b00010,
  ArrayLiteral         = 0b00001001 << 5 | 0b00011,
  ObjectLiteral        = 0b00001001 << 5 | 0b00100,
  PrimitiveLiteral     = 0b00001001 << 5 | 0b00101,
  Template             = 0b00001001 << 5 | 0b00110,
  Unary                = 0b00001000 << 5 | 0b00111,
  CallScope            = 0b00001010 << 5 | 0b01000,
  CallMember           = 0b00001010 << 5 | 0b01001,
  CallFunction         = 0b00001010 << 5 | 0b01010,
  AccessMember         = 0b00001110 << 5 | 0b01011,
  AccessKeyed          = 0b00001110 << 5 | 0b01100,
  TaggedTemplate       = 0b00001010 << 5 | 0b01101,
  Binary               = 0b00001000 << 5 | 0b01110,
  Conditional          = 0b00001000 << 5 | 0b11111,
  Assign               = 0b00001000 << 5 | 0b10000,
  ValueConverter       = 0b00010000 << 5 | 0b10001,
  BindingBehavior      = 0b00010000 << 5 | 0b10010,
  HtmlLiteral          = 0b00000000 << 5 | 0b10011,
  ArrayBindingPattern  = 0b11000000 << 5 | 0b10100,
  ObjectBindingPattern = 0b11000000 << 5 | 0b10101,
  BindingIdentifier    = 0b10000000 << 5 | 0b10110,
  ForOfStatement       = 0b00100000 << 5 | 0b10111,
  Interpolation        = 0b00001000 << 5 | 0b11000
}

export class BindingBehavior implements IExpression {
  public $kind: ExpressionKind;
  private behaviorKey: string;
  private expressionHasBind: boolean;
  private expressionHasUnbind: boolean;
  constructor(public expression: IsBindingBehavior, public name: string, public args: IsAssign[]) {
    this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
    if ((<any>expression).expression) {
      this.expressionHasBind = !!(<any>expression).bind;
      this.expressionHasUnbind = !!(<any>expression).unbind;
    } else {
      this.expressionHasBind = false;
      this.expressionHasUnbind = false;
    }
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return this.expression.evaluate(flags, scope, locator);
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    return (<any>this.expression).assign(flags, scope, locator, value);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.expression.connect(flags, scope, binding);
  }

  public bind(flags: BindingFlags, scope: IScope, binding: IBinding) {
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
    behavior.bind.apply(behavior, [binding, scope].concat(evalList(flags, scope, locator, this.args)));
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const behaviorKey = this.behaviorKey;
    binding[behaviorKey].unbind(flags, scope, binding);
    binding[behaviorKey] = null;

    if (this.expressionHasUnbind) {
      (<any>this.expression).unbind(flags, scope, binding);
    }
  }
}

export class ValueConverter implements IExpression {
  public $kind: ExpressionKind;
  private converterKey: string;
  public allArgs: IsValueConverter[];
  constructor(public expression: IsValueConverter, public name: string, public args: IsAssign[]) {
    this.allArgs = [expression].concat(args);
    this.converterKey = ValueConverterResource.keyFrom(this.name);
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    if ('toView' in converter) {
      return (<any>converter).toView.apply(converter, evalList(flags, scope, locator, this.allArgs));
    }

    return this.expression.evaluate(flags, scope, locator);
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    if ('fromView' in converter) {
      value = (<any>converter).fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
    }

    return (<any>this.expression).assign(flags, scope, locator, value);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const expressions = this.allArgs;
    let i = expressions.length;

    while (i--) {
      expressions[i].connect(flags, scope, binding);
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
    i = signals.length;
    while (i--) {
      signaler.addSignalListener(signals[i], binding as any);
    }
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const locator = binding.locator;
    const converter = locator.get(this.converterKey);
    const signals = (converter as any).signals;
    if (signals === undefined) {
      return;
    }

    const signaler = locator.get(ISignaler) as ISignaler;
    let i = signals.length;
    while (i--) {
      signaler.removeSignalListener(signals[i], binding as any);
    }
  }
}

export class Assign implements IExpression {
  public $kind: ExpressionKind;
  constructor(public target: IsAssignable, public value: IsAssign) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    (<any>this.value).assign(flags, scope, locator, value);
    this.target.assign(flags, scope, locator, value);
  }
}

export class Conditional implements IExpression {
  public $kind: ExpressionKind;
  constructor(public condition: IExpression, public yes: IExpression, public no: IExpression) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return (!!this.condition.evaluate(flags, scope, locator))
      ? this.yes.evaluate(flags, scope, locator)
      : this.no.evaluate(flags, scope, locator);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.condition.connect(flags, scope, binding);
    if (this.condition.evaluate(flags, scope, null)) {
      this.yes.connect(flags, scope, binding);
    } else {
      this.no.connect(flags, scope, binding);
    }
  }
}

export class AccessThis implements IExpression {
  public $kind: ExpressionKind;
  constructor(public ancestor: number = 0) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let oc = scope.overrideContext;
    let i = this.ancestor;
    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }
    return i < 1 && oc ? oc.bindingContext : undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) { }
}

export class AccessScope implements IExpression {
  public $kind: ExpressionKind;
  constructor(public name: string, public ancestor: number = 0) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const name = this.name;
    return BindingContext.get(scope, name, this.ancestor)[name];
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    return context ? (context[name] = value) : undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    binding.observeProperty(flags, context, name);
  }
}

export class AccessMember implements IExpression {
  public $kind: ExpressionKind;
  constructor(public object: IExpression, public name: string) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const instance = this.object.evaluate(flags, scope, locator);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    let instance = this.object.evaluate(flags, scope, locator);

    if (instance === null || typeof instance !== 'object') {
      instance = {};
      this.object.assign(flags, scope, locator, instance);
    }

    instance[this.name] = value;
    return value;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.object.connect(flags, scope, binding);

    const obj = this.object.evaluate(flags, scope, null);
    if (obj) {
      binding.observeProperty(flags, obj, this.name);
    }
  }
}

export class AccessKeyed implements IExpression {
  public $kind: ExpressionKind;
  constructor(public object: IExpression, public key: IExpression) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
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

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.object.connect(flags, scope, binding);
    const obj = this.object.evaluate(flags, scope, null);
    if (typeof obj === 'object' && obj !== null) {
      this.key.connect(flags, scope, binding);
      const key = this.key.evaluate(flags, scope, null);
      // observe the property represented by the key as long as it's not an array indexer
      // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
      if (!(Array.isArray(obj) && isNumeric(key))) {
        binding.observeProperty(flags, obj, key);
      }
    }
  }
}

export class CallScope implements IExpression {
  public $kind: ExpressionKind;
  constructor(public name: string, public args: ReadonlyArray<IExpression>, public ancestor: number = 0) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null) {
    const args = evalList(flags, scope, locator, this.args);
    const context = BindingContext.get(scope, this.name, this.ancestor);
    const func = getFunction(flags, context, this.name);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const args = this.args;
    let i = args.length;
    while (i--) {
      args[i].connect(flags, scope, binding);
    }
  }
}

export class CallMember implements IExpression {
  public $kind: ExpressionKind;
  constructor(public object: IExpression, public name: string, public args: ReadonlyArray<IExpression>) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const instance = this.object.evaluate(flags, scope, locator);
    const args = evalList(flags, scope, locator, this.args);
    const func = getFunction(flags, instance, this.name);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.object.connect(flags, scope, binding);
    const obj = this.object.evaluate(flags, scope, null);
    if (getFunction(flags & ~BindingFlags.mustEvaluate, obj, this.name)) {
      const args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(flags, scope, binding);
      }
    }
  }
}

export class CallFunction implements IExpression {
  public $kind: ExpressionKind;
  constructor(public func: IExpression, public args: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const func = this.func.evaluate(flags, scope, locator);
    if (typeof func === 'function') {
      return func.apply(null, evalList(flags, scope, locator, this.args));
    }
    if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.func.connect(flags, scope, binding);
    const func = this.func.evaluate(flags, scope, null);
    if (typeof func === 'function') {
      const args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(flags, scope, binding);
      }
    }
  }
}

export class Binary implements IExpression {
  public $kind: ExpressionKind;
  constructor(public operation: string, public left: IExpression, public right: IExpression) {
    // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
    // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
    // work to do; we can do this because the operation can't change after it's parsed
    this.evaluate = this[operation];
  }

  public evaluate: (flags: BindingFlags, scope: IScope, locator: IServiceLocator) => any;

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.left.connect(flags, scope, binding);
    let left = this.left.evaluate(flags, scope, null);
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
    return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
  }
  private ['==='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
    return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
  }
  private ['!='](f: BindingFlags, s: IScope, l: IServiceLocator): any {
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
}

export class Unary {
  public $kind: ExpressionKind;
  constructor(public operation: 'void' | 'typeof' | '!' | '-' | '+', public expression: IsLeftHandSide) {
    // see Binary (we're doing the same thing here)
    this.evaluate = this[operation];
  }

  public evaluate: (flags: BindingFlags, scope: IScope, locator: IServiceLocator) => any;

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
}

export class PrimitiveLiteral implements IExpression {
  public $kind: ExpressionKind;
  constructor(public value: any) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return this.value;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
  }
}

export class HtmlLiteral implements IExpression {
  public $kind: ExpressionKind;
  constructor(public parts: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const elements = this.parts;
    const length = elements.length;
    let result = '';

    let i = 0;
    while (i < length) {
      const value = elements[i].evaluate(flags, scope, locator);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
      i++;
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const length = this.parts.length;
    let i = 0;
    while (i < length) {
      this.parts[i].connect(flags, scope, binding);
      i++;
    }
  }
}

export class ArrayLiteral implements IExpression {
  public $kind: ExpressionKind;
  constructor(public elements: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const elements = this.elements;
    const length = this.elements.length;
    const result = new Array(length);

    let i = 0;
    while (i < length) {
      result[i] = elements[i].evaluate(flags, scope, locator);
      i++;
    }

    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const elements = this.elements;
    const length = this.elements.length;

    let i = 0;
    while (i < length) {
      elements[i].connect(flags, scope, binding);
      i++;
    }
  }
}

export class ObjectLiteral implements IExpression {
  public $kind: ExpressionKind;
  constructor(public keys: (number | string)[], public values: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const instance: Record<string, any> = {};
    const keys = this.keys;
    const values = this.values;
    const length = keys.length;

    let i = 0;
    while (i < length) {
      instance[keys[i]] = values[i].evaluate(flags, scope, locator);
      i++;
    }

    return instance;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const keys = this.keys;
    const values = this.values;
    const length = keys.length;

    let i = 0;
    while (i < length) {
      values[i].connect(flags, scope, binding);
      i++;
    }
  }
}

export class Template implements IExpression {
  public $kind: ExpressionKind;
  constructor(public cooked: string[], public expressions?: IsAssign[]) {
    this.expressions = expressions || [];
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const length = expressions.length;
    const cooked = this.cooked;

    let result = cooked[0];
    let i = 0;
    while (i < length) {
      result += expressions[i].evaluate(flags, scope, locator);
      result += cooked[i + 1];
      i++;
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const expressions = this.expressions;
    const length = expressions.length;

    let i = 0;
    while (i < length) {
      expressions[i].connect(flags, scope, binding);
      i++;
    }
  }
}

export class TaggedTemplate implements IExpression {
  public $kind: ExpressionKind;
  constructor(
    public cooked: Array<string> & { raw?: Array<string> },
    raw: Array<string>,
    public func: IsLeftHandSide,
    public expressions?: Array<IsAssign>) {
    cooked.raw = raw;
    this.expressions = expressions || [];
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const length = expressions.length;
    const results = new Array(length);

    let i = 0;
    while (i < length) {
      results[i] = expressions[i].evaluate(flags, scope, locator);
      i++;
    }
    const func = this.func.evaluate(flags, scope, locator);
    if (typeof func !== 'function') {
      throw new Error(`${this.func} is not a function`);
    }
    return func.apply(null, [this.cooked].concat(results));
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const expressions = this.expressions;
    const length = expressions.length;

    let i = 0;
    while (i < length) {
      expressions[i].connect(flags, scope, binding);
      i++;
    }
    this.func.connect(flags, scope, binding);
  }
}

export class ArrayBindingPattern implements IExpression {
  public $kind: ExpressionKind;
  // We'll either have elements, or keys+values, but never all 3
  constructor(
    public elements: IsAssign[]
  ) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    // TODO
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: any): any {
    // TODO
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }
}

export class ObjectBindingPattern implements IExpression {
  public $kind: ExpressionKind;
  // We'll either have elements, or keys+values, but never all 3
  constructor(
    public keys: (string | number)[],
    public values: IsAssign[]
  ) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    // TODO
  }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: any): any {
    // TODO
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }
}

export class BindingIdentifier implements IExpression {
  public $kind: ExpressionKind;
  public name: string;
  constructor(name: string) {
    this.name = name;
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return this.name;
  }
  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void { }
}

export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;

const toStringTag = Object.prototype.toString;

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement implements IExpression {
  public $kind: ExpressionKind;
  public declaration: BindingIdentifierOrPattern;
  public iterable: IsBindingBehavior;
  constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior) {
    this.declaration = declaration;
    this.iterable = iterable;
  }

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
}

/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
export class Interpolation implements IExpression {
  public $kind: ExpressionKind;
  constructor(public parts: string[], public expressions: IExpression[]) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const expressions = this.expressions;
    const length = expressions.length;
    const parts = this.parts;

    let result = parts[0];
    let i = 0;
    while (i < length) {
      result += expressions[i].evaluate(flags, scope, locator);
      result += parts[i + 1];
      i++;
    }
    return result;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    const expressions = this.expressions;
    const length = expressions.length;

    let i = 0;
    while (i < length) {
      expressions[i].connect(flags, scope, binding);
      i++;
    }
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
function evalList(flags: BindingFlags, scope: IScope, locator: IServiceLocator, list: ReadonlyArray<IExpression>) {
  const length = list.length;
  const result = new Array(length);

  let i = 0;
  while (i < length) {
    result[i] = list[i].evaluate(flags, scope, locator);
    i++;
  }

  return result;
}

function getFunction(flags: BindingFlags, obj: any, name: string) {
  let func = obj === null || obj === undefined ? null : obj[name];

  if (typeof func === 'function') {
    return func;
  }

  if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
    return null;
  }

  throw new Error(`${name} is not a function`);
}

//
function isNumeric(value: string): boolean {
  const type = typeof value;
  if (type === 'number') return true;
  if (type !== 'string') return false;
  const len = value.length;
  if (len === 0) return false;
  let i = 0;
  while (i < len) {
    const char = value.charCodeAt(i);
    if (char < 0x30/*0*/ || char > 0x39/*9*/) {
      return false;
    }
    i++;
  }
  return true;
}

// tslint:disable:function-name
/*@internal*/
export const IterateForOfStatement = {
  ['[object Array]'](result: any[], func: (arr: Collection, index: number, item: any) => void): void {
    const len = result.length;
    let i = 0;
    while (i < len) {
      func(result, i, result[i]);
      i++;
    }
  },
  ['[object Map]'](result: Map<any, any>, func: (arr: Collection, index: number, item: any) => void): void {
    const arr = new Array(result.size);
    let i = 0;
    for (const entry of result.entries()) {
      arr[i++] = entry;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Set]'](result: Set<any>, func: (arr: Collection, index: number, item: any) => void): void {
    const arr = new Array(result.size);
    let i = 0;
    for (const key of result.keys()) {
      arr[i++] = key;
    }
    IterateForOfStatement['[object Array]'](arr, func);
  },
  ['[object Number]'](result: number, func: (arr: Collection, index: number, item: any) => void): void {
    const arr = new Array(result);
    let i = 0;
    while (i < result) {
      arr[i] = i++;
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
// tslint:enable:function-name
