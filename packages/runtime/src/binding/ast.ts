import { IServiceLocator } from '@aurelia/kernel';
import { IBinding } from './binding';
import { BindingBehaviorResource } from './binding-behavior';
import { BindingContext, IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
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
  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): any;
  connect(flags: BindingFlags, scope: IScope, binding: IBinding): any;
  assign?(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null, value: any): any;
  bind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
  unbind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
}

export class BindingBehavior implements IExpression {
  private behaviorKey: string;
  private expressionHasBind: boolean;
  private expressionHasUnbind: boolean;
  constructor(public expression: IsBindingBehavior, public name: string, public args: IsAssign[]) {
    this.behaviorKey = BindingBehaviorResource.key(this.name);
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
  private converterKey: string;
  public allArgs: IsValueConverter[];
  constructor(public expression: IsValueConverter, public name: string, public args: IsAssign[]) {
    this.allArgs = [expression].concat(args);
    this.converterKey = ValueConverterResource.key(this.name);
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
  constructor(public value: any) { }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return this.value;
  }

  public connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
  }
}

export class HtmlLiteral implements IExpression {
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

export class Template {
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

export class TaggedTemplate {
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

export class AssignmentPattern {
  constructor(public names: string[]) { }

  public assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: any): any {
    const names = this.names;
    const len = names.length;
    const bindingContext = scope.bindingContext; // todo: test / figure out exactly what to assign to
    let i = 0;
    while (i < len) {
      const name = names[i];
      bindingContext[name] = obj[name];
      i++;
    }
  }
}

// todo: destructuring, etc
export class ForDeclaration {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement {
  public declaration: ForDeclaration;
  public iterable: IsAssign;
  constructor(declaration: ForDeclaration, iterable: IsAssign) {
    this.declaration = declaration;
    this.iterable = iterable;
  }

  public evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator, func: (arr: any[], index: number, item: any) => void): void {
    const result = this.iterable.evaluate(flags, scope, locator);
    if (!Array.isArray(result)) {
      throw new Error(`${result} is not an array`);
    }
    // meh. don't know yet
    const len = result.length;
    let i = 0;
    while (i < len) {
      func(result, i, result[i]);
      i++;
    }
  }
}

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
