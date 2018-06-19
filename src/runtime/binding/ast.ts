import { IBinding } from './binding';
import { IServiceLocator } from '../../kernel/di';
import { IScope, BindingContext } from './binding-context';
import { ISignaler } from './signaler';
import { BindingFlags } from './binding-flags';

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
  constructor(public expression: IsBindingBehavior, public name: string, public args: IsAssign[]) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    return this.expression.evaluate(scope, locator, flags);
  }

  assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags) {
    return (<any>this.expression).assign(scope, value, locator, flags);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    this.expression.connect(binding, scope, flags);
  }

  bind(binding: IBinding, scope: IScope, flags: BindingFlags) {
    if ((<any>this.expression).expression && (<any>this.expression).bind) {
      (<any>this.expression).bind(binding, scope, flags);
    }

    let behavior = binding.locator.get(this.name);
    if (!behavior) {
      throw new Error(`No BindingBehavior named "${this.name}" was found!`);
    }

    let behaviorKey = `behavior-${this.name}`;
    if ((binding as any)[behaviorKey]) {
      throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
    }

    (binding as any)[behaviorKey] = behavior;
    (behavior as any).bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, binding.locator, flags)));
  }

  unbind(binding: IBinding, scope: IScope, flags: BindingFlags) {
    let behaviorKey = `behavior-${this.name}`;

    (binding as any)[behaviorKey].unbind(binding, scope, flags);
    (binding as any)[behaviorKey] = null;

    if ((<any>this.expression).expression && (<any>this.expression).unbind) {
      (<any>this.expression).unbind(binding, scope, flags);
    }
  }
}

export class ValueConverter implements IExpression {
  public allArgs: IsValueConverter[];
  constructor(public expression: IsValueConverter, public name: string, public args: IsAssign[]) {
    this.allArgs = [expression].concat(args);
  }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let converter = locator.get(this.name);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('toView' in converter) {
      return (<any>converter).toView.apply(converter, evalList(scope, this.allArgs, locator, flags));
    }

    return this.allArgs[0].evaluate(scope, locator, flags);
  }

  assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags) {
    let converter = locator.get(this.name);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('fromView' in converter) {
      value = (<any>converter).fromView.apply(converter, [value].concat(evalList(scope, this.args, locator, flags)));
    }

    return (<any>this.allArgs[0]).assign(scope, value, locator, flags);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    const expressions = this.allArgs;
    let i = expressions.length;
    
    while (i--) {
      expressions[i].connect(binding, scope, flags);
    }

    const converter = binding.locator.get(this.name);
    
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

  unbind(binding: IBinding, scope: IScope, flags: BindingFlags) {
    const converter = binding.locator.get(this.name);
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

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    return (<any>this.target).assign(scope, this.value.evaluate(scope, locator, flags), locator, flags);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) { }

  assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags) {
    (<any>this.value).assign(scope, value, locator, flags);
    (<any>this.target).assign(scope, value, locator, flags);
  }
}

export class Conditional implements IExpression {
  constructor(public condition: IExpression, public yes: IExpression, public no: IExpression) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    return (!!this.condition.evaluate(scope, locator, flags))
      ? this.yes.evaluate(scope, locator, flags)
      : this.no.evaluate(scope, locator, flags);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
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

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let oc = scope.overrideContext;
    let i = this.ancestor;

    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }

    return i < 1 && oc ? oc.bindingContext : undefined;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) { }
}

export class AccessScope implements IExpression {
  constructor(public name: string, public ancestor: number = 0) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let context = BindingContext.get(scope, this.name, this.ancestor);
    return context[this.name];
  }

  assign(scope: IScope, value: any) {
    let context = BindingContext.get(scope, this.name, this.ancestor);
    return context ? (context[this.name] = value) : undefined;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    let context = BindingContext.get(scope, this.name, this.ancestor);
    binding.observeProperty(context, this.name);
  }
}

export class AccessMember implements IExpression {
  constructor(public object: IExpression, public name: string) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let instance = this.object.evaluate(scope, locator, flags);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags) {
    let instance = this.object.evaluate(scope, locator, flags);

    if (instance === null || instance === undefined) {
      instance = {};
      this.object.assign(scope, instance, locator, flags);
    }

    instance[this.name] = value;
    return value;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    this.object.connect(binding, scope, flags);

    let obj = this.object.evaluate(scope, null, flags);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  }
}

export class AccessKeyed implements IExpression {
  constructor(public object: IExpression, public key: IExpression) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let instance = this.object.evaluate(scope, locator, flags);
    let lookup = this.key.evaluate(scope, locator, flags);
    return getKeyed(instance, lookup);
  }

  assign(scope: IScope, value: any, locator: IServiceLocator | null, flags: BindingFlags) {
    let instance = this.object.evaluate(scope, locator, flags);
    let lookup = this.key.evaluate(scope, locator, flags);
    return setKeyed(instance, lookup, value);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    this.object.connect(binding, scope, flags);
    let obj = this.object.evaluate(scope, null, flags);
    if (obj instanceof Object) {
      this.key.connect(binding, scope, flags);
      let key = this.key.evaluate(scope, null, flags);
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

  evaluate(scope: IScope, locator: IServiceLocator | null, flags: BindingFlags) {
    let args = evalList(scope, this.args, locator, flags);
    let context = BindingContext.get(scope, this.name, this.ancestor);
    let func = getFunction(context, this.name, flags);
    
    if (func) {
      return func.apply(context, args);
    }

    return undefined;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    let args = this.args;
    let i = args.length;
    while (i--) {
      args[i].connect(binding, scope, flags);
    }
    // todo: consider adding `binding.observeProperty(scope, this.name);`
  }
}

export class CallMember implements IExpression {
  constructor(public object: IExpression, public name: string, public args: IExpression[]) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let instance = this.object.evaluate(scope, locator, flags);
    let args = evalList(scope, this.args, locator, flags);
    let func = getFunction(instance, this.name, flags);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    this.object.connect(binding, scope, flags);
    let obj = this.object.evaluate(scope, null, flags);
    if (getFunction(obj, this.name, flags & ~BindingFlags.mustEvaluate)) {
      let args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(binding, scope, flags);
      }
    }
  }
}

export class CallFunction implements IExpression {
  constructor(public func: IExpression, public args: IExpression[]) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let func = this.func.evaluate(scope, locator, flags);
    if (typeof func === 'function') {
      return func.apply(null, evalList(scope, this.args, locator, flags));
    }
    if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    this.func.connect(binding, scope, flags);
    let func = this.func.evaluate(scope, null, flags);
    if (typeof func === 'function') {
      let args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(binding, scope, flags);
      }
    }
  }
}

export class Binary implements IExpression {
  constructor(public operation: string, public left: IExpression, public right: IExpression) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let left = this.left.evaluate(scope, locator, flags);

    switch (this.operation) {
      case '&&': return left && this.right.evaluate(scope, locator, flags);
      case '||': return left || this.right.evaluate(scope, locator, flags);
    }

    let right = this.right.evaluate(scope, locator, flags);

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

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    this.left.connect(binding, scope, flags);
    let left = this.left.evaluate(scope, null, flags);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(binding, scope, flags);
  }
}

export class Unary {
  public expression:  IsLeftHandSide;
  public operation: 'void' | 'typeof' | '!' | '-' | '+';
  constructor(operation: 'void' | 'typeof' | '!' | '-' | '+', expression: IsLeftHandSide) {
    this.operation = operation;
    this.expression = expression;
  }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): any {
    switch (this.operation) {
      case 'void':
        return void this.expression.evaluate(scope, locator, flags);
      case 'typeof':
        return typeof this.expression.evaluate(scope, locator, flags);
      case '!':
        return !this.expression.evaluate(scope, locator, flags);
      case '-':
        return -this.expression.evaluate(scope, locator, flags);
      case '+':
        return +this.expression.evaluate(scope, locator, flags);
      default:
    }

    throw new Error(`Internal error [${this.operation}] not handled`);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    this.expression.connect(binding, scope, flags);
  }

  assign(scope: IScope, value: any, locator: IServiceLocator, flags: BindingFlags): any {
    throw new Error(`Binding expression "${this}" cannot be assigned to.`);
  }
}

export class PrimitiveLiteral implements IExpression {
  constructor(public value: any) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    return this.value;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
  }
}

export class HtmlLiteral implements IExpression {
  constructor(public parts: IExpression[]) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let elements = this.parts;
    let result = '';

    for (let i = 0, length = elements.length; i < length; ++i) {
      let value = elements[i].evaluate(scope, locator, flags);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
    }

    return result;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    let length = this.parts.length;
    for (let i = 0; i < length; i++) {
      this.parts[i].connect(binding, scope, flags);
    }
  }
}

export class ArrayLiteral implements IExpression {
  constructor(public elements: IExpression[]) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let elements = this.elements;
    let result = [];

    for (let i = 0, length = elements.length; i < length; ++i) {
      result[i] = elements[i].evaluate(scope, locator, flags);
    }

    return result;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    let length = this.elements.length;
    for (let i = 0; i < length; i++) {
      this.elements[i].connect(binding, scope, flags);
    }
  }
}

export class ObjectLiteral implements IExpression {
  constructor(public keys: (number | string)[], public values: IExpression[]) { }

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags) {
    let instance: Record<string, any> = {};
    let keys = this.keys;
    let values = this.values;

    for (let i = 0, length = keys.length; i < length; ++i) {
      instance[keys[i]] = values[i].evaluate(scope, locator, flags);
    }

    return instance;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags) {
    let length = this.keys.length;
    for (let i = 0; i < length; i++) {
      this.values[i].connect(binding, scope, flags);
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

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): string {
    const results = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      results[i] = this.expressions[i].evaluate(scope, locator, flags);
    }
    let result = this.cooked[0];
    for (let i = 0; i < this.length; i++) {
      result = String.prototype.concat(result, results[i], this.cooked[i + 1]);
    }
    return result;
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    for (let i = 0; i < this.length; i++) {
      this.expressions[i].connect(binding, scope, flags);
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

  evaluate(scope: IScope, locator: IServiceLocator, flags: BindingFlags): string {
    const results = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      results[i] = this.expressions[i].evaluate(scope, locator, flags);
    }
    const func = this.func.evaluate(scope, locator, flags);
    if (typeof func !== 'function') {
      throw new Error(`${this.func} is not a function`);
    }
    return func.call(null, this.cooked, ...results);
  }

  connect(binding: IBinding, scope: IScope, flags: BindingFlags): void {
    for (let i = 0; i < this.length; i++) {
      this.expressions[i].connect(binding, scope, flags);
    }
    this.func.connect(binding, scope, flags);
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(scope: IScope, list: IExpression[], locator: IServiceLocator, flags: BindingFlags) {
  const length = list.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    result[i] = list[i].evaluate(scope, locator, flags);
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
