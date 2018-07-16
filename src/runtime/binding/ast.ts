import { IBinding } from './binding';
import { IServiceLocator } from '../../kernel/di';
import { IScope, BindingContext } from './binding-context';
import { ISignaler } from './signaler';
import { BindingFlags } from './binding-flags';
import { BindingBehaviorResource } from './binding-behavior';
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
  evaluate(scope: IScope, locator: IServiceLocator | null, flags: BindingFlags): any;
  connect(binding: IBinding, scope: IScope, flags: BindingFlags): any;
  assign?(scope: IScope, value: any, locator: IServiceLocator | null, flags: BindingFlags): any;
  bind?(binding: IBinding, scope: IScope, flags: BindingFlags): void;
  unbind?(binding: IBinding, scope: IScope, flags: BindingFlags): void;
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

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    return this.expression.evaluate(scope, locator, flags);
  }

  public assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags): any {
    return (<any>this.expression).assign(scope, value, locator, flags);
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.expression.connect(binding, scope, flags);
  }

  public bind(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    if (this.expressionHasBind) {
      (<any>this.expression).bind(binding, scope, flags);
    }
    const behaviorKey = this.behaviorKey;
    const locator = binding.locator;
    const behavior = locator.get(behaviorKey);
    if (!behavior) {
      throw new Error(`No BindingBehavior named "${this.name}" was found!`);
    }
    if ((binding as any)[behaviorKey]) {
      throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
    }

    binding[behaviorKey] = behavior;
    behavior.bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, locator, flags)));
  }

  public unbind(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const behaviorKey = this.behaviorKey;
    binding[behaviorKey].unbind(binding, scope, flags);
    binding[behaviorKey] = null;

    if (this.expressionHasUnbind) {
      (<any>this.expression).unbind(binding, scope, flags);
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

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    if ('toView' in converter) {
      return (<any>converter).toView.apply(converter, evalList(scope, this.allArgs, locator, flags));
    }

    return this.expression.evaluate(scope, locator, flags);
  }

  public assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags): any {
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    if ('fromView' in converter) {
      value = (<any>converter).fromView.apply(converter, [value].concat(evalList(scope, this.args, locator, flags)));
    }

    return (<any>this.expression).assign(scope, value, locator, flags);
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const expressions = this.allArgs;
    let i = expressions.length;
    
    while (i--) {
      expressions[i].connect(binding, scope, flags);
    }

    const locator = binding.locator;
    const converter = locator.get(this.converterKey);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    
    const signals = (converter as any).signals;
    if (signals === undefined) {
      return;
    }
    
    const signaler = locator.get(ISignaler);
    i = signals.length;
    while (i--) {
      signaler.addSignalListener(signals[i], binding as any);
    }
  }

  public unbind(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const locator = binding.locator;
    const converter = locator.get(this.converterKey);
    const signals = (converter as any).signals;
    if (signals === undefined) {
      return;
    }
    
    const signaler = locator.get(ISignaler);
    let i = signals.length;
    while (i--) {
      signaler.removeSignalListener(signals[i], binding as any);
    }
  }
}

export class Assign implements IExpression {
  constructor(public target: IsAssignable, public value: IsAssign) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    return (<any>this.target).assign(scope, this.value.evaluate(scope, locator, flags), locator, flags);
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void { }

  public assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags): void {
    (<any>this.value).assign(scope, value, locator, flags);
    (<any>this.target).assign(scope, value, locator, flags);
  }
}

export class Conditional implements IExpression {
  constructor(public condition: IExpression, public yes: IExpression, public no: IExpression) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    return (!!this.condition.evaluate(scope, locator, flags))
      ? this.yes.evaluate(scope, locator, flags)
      : this.no.evaluate(scope, locator, flags);
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.condition.connect(binding, scope, flags);
    if (this.condition.evaluate(scope, null, flags)) {
      this.yes.connect(binding, scope, flags);
    } else {
      this.no.connect(binding, scope, flags);
    }
  }
}

export class AccessThis implements IExpression {
  constructor(public ancestor: number = 0) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    let oc = scope.overrideContext;
    let i = this.ancestor;
    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }
    return i < 1 && oc ? oc.bindingContext : undefined;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void { }
}

export class AccessScope implements IExpression {
  constructor(public name: string, public ancestor: number = 0) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const name = this.name;
    return BindingContext.get(scope, name, this.ancestor)[name];
  }

  public assign(scope: IScope, value: any) {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    return context ? (context[name] = value) : undefined;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const name = this.name;
    const context = BindingContext.get(scope, name, this.ancestor);
    binding.observeProperty(context, name);
  }
}

export class AccessMember implements IExpression {
  constructor(public object: IExpression, public name: string) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const instance = this.object.evaluate(scope, locator, flags);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  public assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags): any {
    let instance = this.object.evaluate(scope, locator, flags);

    if (instance === null || typeof instance !== 'object') {
      if (flags & BindingFlags.createObjects) {
        instance = {};
        this.object.assign(scope, instance, locator, flags);
      } else {
        return value;
      }
    }

    instance[this.name] = value;
    return value;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.object.connect(binding, scope, flags);

    const obj = this.object.evaluate(scope, null, flags);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  }
}

export class AccessKeyed implements IExpression {
  constructor(public object: IExpression, public key: IExpression) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const instance = this.object.evaluate(scope, locator, flags);
    if (instance === null || instance === undefined) {
      return undefined;
    }
    const key = this.key.evaluate(scope, locator, flags);
    // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
    // and the runtime does this this faster
    return instance[key];
  }

  public assign(scope: IScope, value: any, locator: IServiceLocator | null, flags: BindingFlags): any {
    const instance = this.object.evaluate(scope, locator, flags);
    const key = this.key.evaluate(scope, locator, flags);
    return instance[key] = value;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.object.connect(binding, scope, flags);
    const obj = this.object.evaluate(scope, null, flags);
    if (typeof obj === 'object' && obj !== null) {
      this.key.connect(binding, scope, flags);
      const key = this.key.evaluate(scope, null, flags);
      // observe the property represented by the key as long as it's not an array indexer
      // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
      if (!(Array.isArray(obj) && isNumeric(key))) {
        binding.observeProperty(obj, key);
      }
    }
  }
}

export class CallScope implements IExpression {
  constructor(public name: string, public args: IExpression[], public ancestor: number = 0) { }

  public evaluate(scope: IScope, locator: IServiceLocator | null, flags: BindingFlags): any {
    const args = evalList(scope, this.args, locator, flags);
    const context = BindingContext.get(scope, this.name, this.ancestor);
    const func = getFunction(context, this.name, flags);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const args = this.args;
    let i = args.length;
    while (i--) {
      args[i].connect(binding, scope, flags);
    }
  }
}

export class CallMember implements IExpression {
  constructor(public object: IExpression, public name: string, public args: IExpression[]) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const instance = this.object.evaluate(scope, locator, flags);
    const args = evalList(scope, this.args, locator, flags);
    const func = getFunction(instance, this.name, flags);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.object.connect(binding, scope, flags);
    const obj = this.object.evaluate(scope, null, flags);
    if (getFunction(obj, this.name, flags & ~BindingFlags.mustEvaluate)) {
      const args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(binding, scope, flags);
      }
    }
  }
}

export class CallFunction implements IExpression {
  constructor(public func: IExpression, public args: IExpression[]) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const func = this.func.evaluate(scope, locator, flags);
    if (typeof func === 'function') {
      return func.apply(null, evalList(scope, this.args, locator, flags));
    }
    if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.func.connect(binding, scope, flags);
    const func = this.func.evaluate(scope, null, flags);
    if (typeof func === 'function') {
      const args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(binding, scope, flags);
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

  public evaluate: (scope: IScope, locator: IServiceLocator, flags: BindingFlags) => any;

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.left.connect(binding, scope, flags);
    let left = this.left.evaluate(scope, null, flags);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(binding, scope, flags);
  }

  private ['&&'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) && this.right.evaluate(s, l, f);
  }
  private ['||'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) || this.right.evaluate(s, l, f);
  }
  private ['=='](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) == this.right.evaluate(s, l, f);
  }
  private ['==='](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) === this.right.evaluate(s, l, f);
  }
  private ['!='](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) != this.right.evaluate(s, l, f);
  }
  private ['!=='](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) !== this.right.evaluate(s, l, f);
  }
  private ['instanceof'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    const right = this.right.evaluate(s, l, f);
    if (typeof right === 'function') {
      return this.left.evaluate(s, l, f) instanceof right;
    }
    return false;
  }
  private ['in'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    const right = this.right.evaluate(s, l, f);
    if (right !== null && typeof right === 'object') {
      return this.left.evaluate(s, l, f) in right;
    }
    return false;
  }
  // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
  // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
  // this makes bugs in user code easier to track down for end users
  // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
  private ['+'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) + this.right.evaluate(s, l, f);
  }
  private ['-'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) - this.right.evaluate(s, l, f);
  }
  private ['*'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) * this.right.evaluate(s, l, f);
  }
  private ['/'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) / this.right.evaluate(s, l, f);
  }
  private ['%'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) % this.right.evaluate(s, l, f);
  }
  private ['<'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) < this.right.evaluate(s, l, f);
  }
  private ['>'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) > this.right.evaluate(s, l, f);
  }
  private ['<='](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) <= this.right.evaluate(s, l, f);
  }
  private ['>='](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return this.left.evaluate(s, l, f) >= this.right.evaluate(s, l, f);
  }
}

export class Unary {
  constructor(public operation: 'void' | 'typeof' | '!' | '-' | '+', public expression: IsLeftHandSide) {
    // see Binary (we're doing the same thing here)
    this.evaluate = this[operation];
  }

  public evaluate: (scope: IScope, locator: IServiceLocator, flags: BindingFlags) => any;

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.expression.connect(binding, scope, flags);
  }

  public assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags): any {
    throw new Error(`Binding expression "${this}" cannot be assigned to.`);
  }

  private ['void'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return void this.expression.evaluate(s, l, f);
  }
  private ['typeof'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return typeof this.expression.evaluate(s, l, f);
  }
  private ['!'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return !this.expression.evaluate(s, l, f);
  }
  private ['-'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return -this.expression.evaluate(s, l, f);
  }
  private ['+'](s: IScope, l: IServiceLocator, f: BindingFlags): any {
    return +this.expression.evaluate(s, l, f);
  }
}

export class PrimitiveLiteral implements IExpression {
  constructor(public value: any) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    return this.value;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
  }
}

export class HtmlLiteral implements IExpression {
  constructor(public parts: IExpression[]) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const elements = this.parts;
    const length = elements.length;
    let result = '';

    let i = 0;
    while (i < length) {
      const value = elements[i].evaluate(scope, locator, flags);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
      i++;
    }
    return result;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const length = this.parts.length;
    let i = 0;
    while (i < length) {
      this.parts[i].connect(binding, scope, flags);
      i++;
    }
  }
}

export class ArrayLiteral implements IExpression {
  constructor(public elements: IExpression[]) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const elements = this.elements;
    const length = this.elements.length;
    const result = new Array(length);

    let i = 0;
    while (i < length) {
      result[i] = elements[i].evaluate(scope, locator, flags);
      i++;
    }

    return result;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const elements = this.elements;
    const length = this.elements.length;

    let i = 0;
    while (i < length) {
      elements[i].connect(binding, scope, flags);
      i++;
    }
  }
}

export class ObjectLiteral implements IExpression {
  constructor(public keys: (number | string)[], public values: IExpression[]) { }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    const instance: Record<string, any> = {};
    const keys = this.keys;
    const values = this.values;
    const length = keys.length;

    let i = 0;
    while (i < length) {
      instance[keys[i]] = values[i].evaluate(scope, locator, flags);
      i++;
    }

    return instance;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const keys = this.keys;
    const values = this.values;
    const length = keys.length;

    let i = 0;
    while (i < length) {
      values[i].connect(binding, scope, flags);
      i++;
    }
  }
}

export class Template {
  constructor(public cooked: string[], public expressions?: IsAssign[]) {
    this.expressions = expressions || [];
  }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): string {
    const expressions = this.expressions;
    const length = expressions.length;
    const cooked = this.cooked;

    let result = cooked[0];
    let i = 0;
    while (i < length) {
      result += expressions[i].evaluate(scope, locator, flags);
      result += cooked[i + 1];
      i++;
    }
    return result;
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const expressions = this.expressions;
    const length = expressions.length;
    
    let i = 0;
    while (i < length) {
      expressions[i].connect(binding, scope, flags);
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
    (<any>cooked).raw = raw;
    this.expressions = expressions || [];
  }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): string {
    const expressions = this.expressions;
    const length = expressions.length;
    const results = new Array(length);

    let i = 0;
    while (i < length) {
      results[i] = expressions[i].evaluate(scope, locator, flags);
      i++;
    }
    const func = this.func.evaluate(scope, locator, flags);
    if (typeof func !== 'function') {
      throw new Error(`${this.func} is not a function`);
    }
    return func.apply(null, [this.cooked].concat(results));
  }

  public connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    const expressions = this.expressions;
    const length = expressions.length;

    let i = 0;
    while (i < length) {
      expressions[i].connect(binding, scope, flags);
      i++;
    }
    this.func.connect(binding, scope, flags);
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
// todo: magic stuff (maybe)
export class ForOfStatement {
  public declaration: ForDeclaration;
  public iterable: IsAssign;
  constructor(declaration: ForDeclaration, iterable: IsAssign) {
    this.declaration = declaration;
    this.iterable = iterable;
  }

  public evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any[] {
    const result = this.iterable.evaluate(scope, locator, flags);
    if (!Array.isArray(result)) {
      throw new Error(`${result} is not an array`);
    }
    return result;
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(scope: IScope, list: IExpression[], locator: IServiceLocator, flags: BindingFlags) {
  const length = list.length;
  const result = new Array(length);

  let i = 0;
  while (i < length) {
    result[i] = list[i].evaluate(scope, locator, flags);
    i++;
  }

  return result;
}

function getFunction(obj: any, name: string, flags: BindingFlags) {
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
