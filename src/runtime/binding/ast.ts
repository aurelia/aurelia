import { getContextFor } from './scope';
import { connectBindingToSignal } from './signals';
import { IBinding } from './binding';
import { Scope } from './binding-interfaces';

interface AstKind {
  Base: 1;
  Chain: 2;
  ValueConverter: 3;
  BindingBehavior: 4;
  Assign: 5;
  Conditional: 6;
  AccessThis: 7;
  AccessScope: 8;
  AccessMember: 9;
  AccessKeyed: 10;
  CallScope: 11;
  CallFunction: 12;
  CallMember: 13;
  PrefixNot: 14;
  Binary: 15;
  LiteralPrimitive: 16;
  LiteralArray: 17;
  LiteralObject: 18;
  LiteralString: 19;
  TemplateLiteral: 20;
}

export const AstKind: AstKind = {
  Base: 1,
  Chain: 2,
  ValueConverter: 3,
  BindingBehavior: 4,
  Assign: 5,
  Conditional: 6,
  AccessThis: 7,
  AccessScope: 8,
  AccessMember: 9,
  AccessKeyed: 10,
  CallScope: 11,
  CallFunction: 12,
  CallMember: 13,
  PrefixNot: 14,
  Binary: 15,
  LiteralPrimitive: 16,
  LiteralArray: 17,
  LiteralObject: 18,
  LiteralString: 19,
  TemplateLiteral: 20,
};

export interface IExpression {
  evaluate(scope: Scope, lookupFunctions: ILookupFunctions | null, mustEvaluateIfFunction?: boolean): any;
  assign?(scope: Scope, value: any, lookupFunctions: ILookupFunctions | null): any;
  connect(binding: IBinding, scope: Scope): any;
  bind?(binding: IBinding, scope: Scope): void;
  unbind?(binding: IBinding, scope: Scope): void;
}

export interface ILookupFunctions {
  valueConverters: Record<string, any>;
  bindingBehaviors: Record<string, any>;
}

export class Chain implements IExpression {
  constructor(private expressions: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let result;
    let expressions = this.expressions;
    let last;

    for (let i = 0, length = expressions.length; i < length; ++i) {
      last = expressions[i].evaluate(scope, lookupFunctions);

      if (last !== null) {
        result = last;
      }
    }

    return result;
  }

  connect() { }
}

export class BindingBehavior implements IExpression {
  constructor(private expression: IExpression, private name: string, private args: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return this.expression.evaluate(scope, lookupFunctions);
  }

  assign(scope: Scope, value: any, lookupFunctions: ILookupFunctions) {
    return this.expression.assign(scope, value, lookupFunctions);
  }

  connect(binding: IBinding, scope: Scope) {
    this.expression.connect(binding, scope);
  }

  bind(binding: IBinding, scope: Scope) {
    if ((this.expression as any)['expression'] && this.expression.bind) {
      this.expression.bind(binding, scope);
    }

    let behavior = binding.lookupFunctions.bindingBehaviors[this.name];
    if (!behavior) {
      throw new Error(`No BindingBehavior named "${this.name}" was found!`);
    }

    let behaviorKey = `behavior-${this.name}`;
    if ((binding as any)[behaviorKey]) {
      throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
    }

    (binding as any)[behaviorKey] = behavior;
    behavior.bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, binding.lookupFunctions)));
  }

  unbind(binding: IBinding, scope: Scope) {
    let behaviorKey = `behavior-${this.name}`;

    (binding as any)[behaviorKey].unbind(binding, scope);
    (binding as any)[behaviorKey] = null;

    if ((this.expression as any)['expression'] && this.expression.unbind) {
      this.expression.unbind(binding, scope);
    }
  }
}

export class ValueConverter implements IExpression {
  constructor(private expression: IExpression, private name: string, private args: IExpression[], private allArgs: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let converter = lookupFunctions.valueConverters[this.name];
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('toView' in converter) {
      return converter.toView.apply(converter, evalList(scope, this.allArgs, lookupFunctions));
    }

    return this.allArgs[0].evaluate(scope, lookupFunctions);
  }

  assign(scope: Scope, value: any, lookupFunctions: ILookupFunctions) {
    let converter = lookupFunctions.valueConverters[this.name];
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('fromView' in converter) {
      value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, lookupFunctions)));
    }

    return this.allArgs[0].assign(scope, value, lookupFunctions);
  }

  connect(binding: IBinding, scope: Scope) {
    let expressions = this.allArgs;
    let i = expressions.length;
    while (i--) {
      expressions[i].connect(binding, scope);
    }
    let converter = binding.lookupFunctions.valueConverters[this.name];
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    let signals = converter.signals;
    if (signals === undefined) {
      return;
    }
    i = signals.length;
    while (i--) {
      connectBindingToSignal((binding as any), signals[i]);
    }
  }
}

export class Assign implements IExpression {
  constructor(private target: IExpression, private value: IExpression) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions): any {
    return this.target.assign(scope, this.value.evaluate(scope, lookupFunctions), lookupFunctions);
  }

  connect() { }

  assign(scope: Scope, value: any, lookupFunctions: ILookupFunctions) {
    this.value.assign(scope, value, lookupFunctions);
    this.target.assign(scope, value, lookupFunctions);
  }
}

export class Conditional implements IExpression {
  constructor(private condition: IExpression, private yes: IExpression, private no: IExpression) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return (!!this.condition.evaluate(scope, lookupFunctions))
      ? this.yes.evaluate(scope, lookupFunctions)
      : this.no.evaluate(scope, lookupFunctions);
  }

  connect(binding: IBinding, scope: Scope) {
    this.condition.connect(binding, scope);
    if (this.condition.evaluate(scope, null)) {
      this.yes.connect(binding, scope);
    } else {
      this.no.connect(binding, scope);
    }
  }
}

export class AccessThis implements IExpression {
  constructor(private ancestor: number = 0) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let oc = scope.overrideContext;
    let i = this.ancestor;

    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }

    return i < 1 && oc ? oc.bindingContext : undefined;
  }

  connect() { }
}

export class AccessScope implements IExpression {
  constructor(private name: string, private ancestor: number = 0) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context[this.name];
  }

  assign(scope: Scope, value: any) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context ? (context[this.name] = value) : undefined;
  }

  connect(binding: IBinding, scope: Scope) {
    let context = getContextFor(this.name, scope, this.ancestor);
    binding.observeProperty(context, this.name);
  }
}

export class AccessMember implements IExpression {
  constructor(private object: IExpression, private name: string) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let instance = this.object.evaluate(scope, lookupFunctions);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  assign(scope: Scope, value: any, lookupFunctions: ILookupFunctions) {
    let instance = this.object.evaluate(scope, lookupFunctions);

    if (instance === null || instance === undefined) {
      instance = {};
      this.object.assign(scope, instance, lookupFunctions);
    }

    instance[this.name] = value;
    return value;
  }

  connect(binding: IBinding, scope: Scope) {
    this.object.connect(binding, scope);

    let obj = this.object.evaluate(scope, null);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  }
}

export class AccessKeyed implements IExpression {
  constructor(private object: IExpression, private key: IExpression) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let instance = this.object.evaluate(scope, lookupFunctions);
    let lookup = this.key.evaluate(scope, lookupFunctions);
    return getKeyed(instance, lookup);
  }

  assign(scope: Scope, value: any, lookupFunctions: ILookupFunctions | null) {
    let instance = this.object.evaluate(scope, lookupFunctions);
    let lookup = this.key.evaluate(scope, lookupFunctions);
    return setKeyed(instance, lookup, value);
  }

  connect(binding: IBinding, scope: Scope) {
    this.object.connect(binding, scope);
    let obj = this.object.evaluate(scope, null);
    if (obj instanceof Object) {
      this.key.connect(binding, scope);
      let key = this.key.evaluate(scope, null);
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
  constructor(private name: string, private args: IExpression[], private ancestor: number) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions | null, mustEvaluate?: boolean) {
    let args = evalList(scope, this.args, lookupFunctions);
    let context = getContextFor(this.name, scope, this.ancestor);
    let func = getFunction(context, this.name, mustEvaluate);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  connect(binding: IBinding, scope: Scope) {
    let args = this.args;
    let i = args.length;
    while (i--) {
      args[i].connect(binding, scope);
    }
    // todo: consider adding `binding.observeProperty(scope, this.name);`
  }
}

export class CallMember implements IExpression {
  constructor(private object: IExpression, private name: string, private args: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions, mustEvaluate: boolean) {
    let instance = this.object.evaluate(scope, lookupFunctions);
    let args = evalList(scope, this.args, lookupFunctions);
    let func = getFunction(instance, this.name, mustEvaluate);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  connect(binding: IBinding, scope: Scope) {
    this.object.connect(binding, scope);
    let obj = this.object.evaluate(scope, null);
    if (getFunction(obj, this.name, false)) {
      let args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(binding, scope);
      }
    }
  }
}

export class CallFunction implements IExpression {
  constructor(private func: IExpression, private args: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions, mustEvaluate: boolean) {
    let func = this.func.evaluate(scope, lookupFunctions);
    if (typeof func === 'function') {
      return func.apply(null, evalList(scope, this.args, lookupFunctions));
    }
    if (!mustEvaluate && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  connect(binding: IBinding, scope: Scope) {
    this.func.connect(binding, scope);
    let func = this.func.evaluate(scope, null);
    if (typeof func === 'function') {
      let args = this.args;
      let i = args.length;
      while (i--) {
        args[i].connect(binding, scope);
      }
    }
  }
}

export class Binary implements IExpression {
  constructor(private operation: string, private left: IExpression, private right: IExpression) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let left = this.left.evaluate(scope, lookupFunctions);

    switch (this.operation) {
      case '&&': return left && this.right.evaluate(scope, lookupFunctions);
      case '||': return left || this.right.evaluate(scope, lookupFunctions);
      // no default
    }

    let right = this.right.evaluate(scope, lookupFunctions);

    switch (this.operation) {
      case '==': return left == right; // eslint-disable-line eqeqeq
      case '===': return left === right;
      case '!=': return left != right; // eslint-disable-line eqeqeq
      case '!==': return left !== right;
      // no default
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
        // no default
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
      case '^': return left ^ right;
      // no default
    }

    throw new Error(`Internal error [${this.operation}] not handled`);
  }

  connect(binding: IBinding, scope: Scope) {
    this.left.connect(binding, scope);
    let left = this.left.evaluate(scope, null);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(binding, scope);
  }
}

export class PrefixNot implements IExpression {
  constructor(private operation: string, private expression: IExpression) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return !this.expression.evaluate(scope, lookupFunctions);
  }

  connect(binding: IBinding, scope: Scope) {
    this.expression.connect(binding, scope);
  }
}

export class LiteralPrimitive implements IExpression {
  constructor(private value: any) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return this.value;
  }

  connect(binding: IBinding, scope: Scope) {
  }
}

export class LiteralString implements IExpression {
  constructor(private value: string) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return this.value;
  }

  connect(binding: IBinding, scope: Scope) { }
}

export class TemplateLiteral implements IExpression {
  constructor(private parts: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let elements = this.parts;
    let result = '';

    for (let i = 0, length = elements.length; i < length; ++i) {
      let value = elements[i].evaluate(scope, lookupFunctions);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
    }

    return result;
  }

  connect(binding: IBinding, scope: Scope) {
    let length = this.parts.length;
    for (let i = 0; i < length; i++) {
      this.parts[i].connect(binding, scope);
    }
  }
}

export class LiteralArray implements IExpression {
  constructor(private elements: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let elements = this.elements;
    let result = [];

    for (let i = 0, length = elements.length; i < length; ++i) {
      result[i] = elements[i].evaluate(scope, lookupFunctions);
    }

    return result;
  }

  connect(binding: IBinding, scope: Scope) {
    let length = this.elements.length;
    for (let i = 0; i < length; i++) {
      this.elements[i].connect(binding, scope);
    }
  }
}

export class LiteralObject implements IExpression {
  constructor(private keys: string[], private values: IExpression[]) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let instance: Record<string, any> = {};
    let keys = this.keys;
    let values = this.values;

    for (let i = 0, length = keys.length; i < length; ++i) {
      instance[keys[i]] = values[i].evaluate(scope, lookupFunctions);
    }

    return instance;
  }

  connect(binding: IBinding, scope: Scope) {
    let length = this.keys.length;
    for (let i = 0; i < length; i++) {
      this.values[i].connect(binding, scope);
    }
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(scope: Scope, list: IExpression[], lookupFunctions: ILookupFunctions) {
  const length = list.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    result[i] = list[i].evaluate(scope, lookupFunctions);
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

function getFunction(obj: any, name: string, mustExist: boolean) {
  let func = obj === null || obj === undefined ? null : obj[name];

  if (typeof func === 'function') {
    return func;
  }

  if (!mustExist && (func === null || func === undefined)) {
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
