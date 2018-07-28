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
  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): any;
  connect(flags: BindingFlags, scope: IScope, binding: IBinding): any;
  assign?(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null, value: any): any;
  bind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
  unbind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
}

export class BindingBehavior implements IExpression {
  constructor(public expression: IsBindingBehavior, public name: string, public args: IsAssign[]) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return this.expression.evaluate(flags, scope, locator);
  }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any,) {
    return (<any>this.expression).assign(flags, scope, locator, value);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.expression.connect(flags, scope, binding);
  }

  bind(flags: BindingFlags, scope: IScope, binding: IBinding) {
    if ((<any>this.expression).expression && (<any>this.expression).bind) {
      (<any>this.expression).bind(flags, scope, binding);
    }

    const behaviorKey = BindingBehaviorResource.key(this.name);
    const behavior = binding.locator.get(behaviorKey);

    if (!behavior) {
      throw new Error(`No BindingBehavior named "${this.name}" was found!`);
    }

    if ((binding as any)[behaviorKey]) {
      throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
    }

    (binding as any)[behaviorKey] = behavior;
    (behavior as any).bind.apply(behavior, [binding, scope].concat(evalList(flags, scope, binding.locator, this.args)));
  }

  unbind(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const behaviorKey = BindingBehaviorResource.key(this.name);

    (binding as any)[behaviorKey].unbind(flags, scope, binding);
    (binding as any)[behaviorKey] = null;

    if ((<any>this.expression).expression && (<any>this.expression).unbind) {
      (<any>this.expression).unbind(flags, scope, binding);
    }
  }
}

export class ValueConverter implements IExpression {
  public allArgs: IsValueConverter[];
  constructor(public expression: IsValueConverter, public name: string, public args: IsAssign[]) {
    this.allArgs = [expression].concat(args);
  }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    const converterKey = ValueConverterResource.key(this.name);
    const converter = locator.get(converterKey);

    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('toView' in converter) {
      return (<any>converter).toView.apply(converter, evalList(flags, scope, locator, this.allArgs));
    }

    return this.allArgs[0].evaluate(flags, scope, locator);
  }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any,) {
    const converterKey = ValueConverterResource.key(this.name);
    const converter = locator.get(converterKey);

    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('fromView' in converter) {
      value = (<any>converter).fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.allArgs)));
    }

    return (<any>this.allArgs[0]).assign(flags, scope, locator, value);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const expressions = this.allArgs;
    let i = expressions.length;
    
    while (i--) {
      expressions[i].connect(flags, scope, binding);
    }

    const converterKey = ValueConverterResource.key(this.name);
    const converter = binding.locator.get(converterKey);
    
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    
    const signals = (converter as any).signals;
    
    if (signals === undefined) {
      return;
    }
    
    const signaler = binding.locator.get(ISignaler);
    i = signals.length;
    
    while (i--) {
      signaler.addSignalListener(signals[i], binding as any);
    }
  }

  unbind(flags: BindingFlags, scope: IScope, binding: IBinding) {
    const converterKey = ValueConverterResource.key(this.name);
    const converter = binding.locator.get(converterKey);
    const signals = (converter as any).signals;
    
    if (signals === undefined) {
      return;
    }
    
    const signaler = binding.locator.get(ISignaler);
    let i = signals.length;
    
    while (i--) {
      signaler.removeSignalListener(signals[i], binding as any);
    }
  }
}

export class Assign implements IExpression {
  constructor(public target: IsAssignable, public value: IsAssign) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    return (<any>this.target).assign(scope, this.value.evaluate(flags, scope, locator), locator, flags);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) { }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any,) {
    (<any>this.value).assign(flags, scope, locator, value);
    (<any>this.target).assign(flags, scope, locator, value);
  }
}

export class Conditional implements IExpression {
  constructor(public condition: IExpression, public yes: IExpression, public no: IExpression) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return (!!this.condition.evaluate(flags, scope, locator))
      ? this.yes.evaluate(flags, scope, locator)
      : this.no.evaluate(flags, scope, locator);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
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

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let oc = scope.overrideContext;
    let i = this.ancestor;

    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }

    return i < 1 && oc ? oc.bindingContext : undefined;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) { }
}

export class AccessScope implements IExpression {
  constructor(public name: string, public ancestor: number = 0) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let context = BindingContext.get(scope, this.name, this.ancestor);
    return context[this.name];
  }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    let context = BindingContext.get(scope, this.name, this.ancestor);
    return context ? (context[this.name] = value) : undefined;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    let context = BindingContext.get(scope, this.name, this.ancestor);
    binding.observeProperty(context, this.name);
  }
}

export class AccessMember implements IExpression {
  constructor(public object: IExpression, public name: string) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let instance = this.object.evaluate(flags, scope, locator);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any) {
    let instance = this.object.evaluate(flags, scope, locator);

    if (instance === null || instance === undefined) {
      instance = {};
      this.object.assign(flags, scope, locator, instance);
    }

    instance[this.name] = value;
    return value;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.object.connect(flags, scope, binding);

    let obj = this.object.evaluate(flags, scope, null);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  }
}

export class AccessKeyed implements IExpression {
  constructor(public object: IExpression, public key: IExpression) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let instance = this.object.evaluate(flags, scope, locator);
    let lookup = this.key.evaluate(flags, scope, locator);
    return getKeyed(instance, lookup);
  }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null, value: any) {
    let instance = this.object.evaluate(flags, scope, locator);
    let lookup = this.key.evaluate(flags, scope, locator);
    return setKeyed(instance, lookup, value);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.object.connect(flags, scope, binding);
    let obj = this.object.evaluate(flags, scope, null);
    if (obj instanceof Object) {
      this.key.connect(flags, scope, binding);
      let key = this.key.evaluate(flags, scope, null);
      // observe the property represented by the key as long as it's not an array
      // being accessed by an integer key which would require dirty-checking.
      if (key !== null && key !== undefined
        && !(Array.isArray(obj) && typeof (key) === 'number')) {
        binding.observeProperty(obj, key);
      }
    }
  }
}

export class CallScope implements IExpression {
  constructor(public name: string, public args: IExpression[], public ancestor: number = 0) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null) {
    let args = evalList(flags, scope, locator, this.args);
    let context = BindingContext.get(scope, this.name, this.ancestor);
    let func = getFunction(flags, context, this.name);
    
    if (func) {
      return func.apply(context, args);
    }

    return undefined;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    let args = this.args;
    let i = args.length;
    while (i--) {
      args[i].connect(flags, scope, binding);
    }
    // todo: consider adding `binding.observeProperty(scope, this.name);`
  }
}

export class CallMember implements IExpression {
  constructor(public object: IExpression, public name: string, public args: IExpression[]) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let instance = this.object.evaluate(flags, scope, locator);
    let args = evalList(flags, scope, locator, this.args);
    let func = getFunction(flags, instance, this.name);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.object.connect(flags, scope, binding);
    let obj = this.object.evaluate(flags, scope, null);
    if (getFunction(flags & ~BindingFlags.mustEvaluate, obj, this.name)) {
      let args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(flags, scope, binding);
      }
    }
  }
}

export class CallFunction implements IExpression {
  constructor(public func: IExpression, public args: IExpression[]) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let func = this.func.evaluate(flags, scope, locator);
    if (typeof func === 'function') {
      return func.apply(null, evalList(flags, scope, locator, this.args));
    }
    if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.func.connect(flags, scope, binding);
    let func = this.func.evaluate(flags, scope, null);
    if (typeof func === 'function') {
      let args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(flags, scope, binding);
      }
    }
  }
}

export class Binary implements IExpression {
  constructor(public operation: string, public left: IExpression, public right: IExpression) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let left = this.left.evaluate(flags, scope, locator);

    switch (this.operation) {
      case '&&': return left && this.right.evaluate(flags, scope, locator);
      case '||': return left || this.right.evaluate(flags, scope, locator);
    }

    let right = this.right.evaluate(flags, scope, locator);

    switch (this.operation) {
      case '==': return left == right;
      case '===': return left === right;
      case '!=': return left != right;
      case '!==': return left !== right;
      case 'instanceof': return typeof right === 'function' && left instanceof right;
      case 'in': return typeof right === 'object' && right !== null && left in right;
    }

    // Null check for the operations.
    if (left === null || right === null || left === undefined || right === undefined) {
      switch (this.operation) {
        case '+':
          if (left !== null && left !== undefined) return left;
          if (right !== null && right !== undefined) return right;
          return 0;
        case '-':
          if (left !== null && left !== undefined) return left;
          if (right !== null && right !== undefined) return 0 - right;
          return 0;
      }

      return null;
    }

    switch (this.operation) {
      case '+': return autoConvertAdd(left, right);
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
    }

    throw new Error(`Internal error [${this.operation}] not handled`);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    this.left.connect(flags, scope, binding);
    let left = this.left.evaluate(flags, scope, null);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(flags, scope, binding);
  }
}

export class Unary {
  public expression:  IsLeftHandSide;
  public operation: 'void' | 'typeof' | '!' | '-' | '+';
  constructor(operation: 'void' | 'typeof' | '!' | '-' | '+', expression: IsLeftHandSide) {
    this.operation = operation;
    this.expression = expression;
  }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any {
    switch (this.operation) {
      case 'void':
        return void this.expression.evaluate(flags, scope, locator);
      case 'typeof':
        return typeof this.expression.evaluate(flags, scope, locator);
      case '!':
        return !this.expression.evaluate(flags, scope, locator);
      case '-':
        return -this.expression.evaluate(flags, scope, locator);
      case '+':
        return +this.expression.evaluate(flags, scope, locator);
      default:
    }

    throw new Error(`Internal error [${this.operation}] not handled`);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    this.expression.connect(flags, scope, binding);
  }

  assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: any,): any {
    throw new Error(`Binding expression "${this}" cannot be assigned to.`);
  }
}

export class PrimitiveLiteral implements IExpression {
  constructor(public value: any) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    return this.value;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
  }
}

export class HtmlLiteral implements IExpression {
  constructor(public parts: IExpression[]) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let elements = this.parts;
    let result = '';

    for (let i = 0, length = elements.length; i < length; ++i) {
      let value = elements[i].evaluate(flags, scope, locator);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
    }

    return result;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    let length = this.parts.length;
    for (let i = 0; i < length; i++) {
      this.parts[i].connect(flags, scope, binding);
    }
  }
}

export class ArrayLiteral implements IExpression {
  constructor(public elements: IExpression[]) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let elements = this.elements;
    let result = [];

    for (let i = 0, length = elements.length; i < length; ++i) {
      result[i] = elements[i].evaluate(flags, scope, locator);
    }

    return result;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    let length = this.elements.length;
    for (let i = 0; i < length; i++) {
      this.elements[i].connect(flags, scope, binding);
    }
  }
}

export class ObjectLiteral implements IExpression {
  constructor(public keys: (number | string)[], public values: IExpression[]) { }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator) {
    let instance: Record<string, any> = {};
    let keys = this.keys;
    let values = this.values;

    for (let i = 0, length = keys.length; i < length; ++i) {
      instance[keys[i]] = values[i].evaluate(flags, scope, locator);
    }

    return instance;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding) {
    let length = this.keys.length;
    for (let i = 0; i < length; i++) {
      this.values[i].connect(flags, scope, binding);
    }
  }
}

export class Template {
  public length: number;
  constructor(public cooked: string[], public expressions?: IsAssign[]) {
    this.cooked = cooked;
    this.expressions = expressions || [];
    this.length = this.expressions.length;
  }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const results = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      results[i] = this.expressions[i].evaluate(flags, scope, locator);
    }
    let result = this.cooked[0];
    for (let i = 0; i < this.length; i++) {
      result = String.prototype.concat(result, results[i], this.cooked[i + 1]);
    }
    return result;
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    for (let i = 0; i < this.length; i++) {
      this.expressions[i].connect(flags, scope, binding);
    }
  }
}

export class TaggedTemplate {
  public cooked: Array<string> & { raw: Array<string> };
  public func: IsLeftHandSide;
  public expressions: Array<IsAssign>;
  public length: number;
  constructor(cooked: Array<string>, raw: Array<string>, func: IsLeftHandSide, expressions?: Array<IsAssign>) {
    (<any>cooked).raw = raw;
    this.cooked = cooked as any;
    this.func = func;
    this.expressions = expressions || [];
    this.length = this.expressions.length;
  }

  evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string {
    const results = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      results[i] = this.expressions[i].evaluate(flags, scope, locator);
    }
    const func = this.func.evaluate(flags, scope, locator);
    if (typeof func !== 'function') {
      throw new Error(`${this.func} is not a function`);
    }
    return func.call(null, this.cooked, ...results);
  }

  connect(flags: BindingFlags, scope: IScope, binding: IBinding): void {
    for (let i = 0; i < this.length; i++) {
      this.expressions[i].connect(flags, scope, binding);
    }
    this.func.connect(flags, scope, binding);
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(flags: BindingFlags, scope: IScope, locator: IServiceLocator, list: IExpression[]) {
  const length = list.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    result[i] = list[i].evaluate(flags, scope, locator);
  }

  return result;
}

/// Add the two arguments with automatic type conversion.
function autoConvertAdd(a: any, b: any) {
  if (a !== null && b !== null) {
    // TODO(deboer): Support others.
    if (typeof a === 'string' && typeof b !== 'string') {
      return a + b.toString();
    }

    if (typeof a !== 'string' && typeof b === 'string') {
      return a.toString() + b;
    }

    return a + b;
  }

  if (a !== null) {
    return a;
  }

  if (b !== null) {
    return b;
  }

  return 0;
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

function getKeyed(obj: any, key: any) {
  if (Array.isArray(obj)) {
    return obj[parseInt(key, 10)];
  } else if (obj) {
    return obj[key];
  } else if (obj === null || obj === undefined) {
    return undefined;
  }

  return obj[key];
}

function setKeyed(obj: any, key: any, value: any) {
  if (Array.isArray(obj)) {
    let index = parseInt(key, 10);

    if (obj.length <= index) {
      obj.length = index + 1;
    }

    obj[index] = value;
  } else {
    obj[key] = value;
  }

  return value;
}
