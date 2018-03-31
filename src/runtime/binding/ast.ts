import { getContextFor } from './scope';
import { connectBindingToSignal } from './signals';
import { IBinding } from './binding';
import { IScope } from './binding-interfaces';
import { IContainer } from '../di';

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
  evaluate(scope: IScope, container: IContainer | null, mustEvaluateIfFunction?: boolean): any;
  assign?(scope: IScope, value: any, container: IContainer | null): any;
  connect(binding: IBinding, scope: IScope): any;
  bind?(binding: IBinding, scope: IScope): void;
  unbind?(binding: IBinding, scope: IScope): void;
}

export class Chain implements IExpression {
  constructor(private expressions: IExpression[]) { }

  evaluate(scope: IScope, container: IContainer) {
    let result;
    let expressions = this.expressions;
    let last;

    for (let i = 0, length = expressions.length; i < length; ++i) {
      last = expressions[i].evaluate(scope, container);

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

  evaluate(scope: IScope, container: IContainer) {
    return this.expression.evaluate(scope, container);
  }

  assign(scope: IScope, value: any, container: IContainer) {
    return this.expression.assign(scope, value, container);
  }

  connect(binding: IBinding, scope: IScope) {
    this.expression.connect(binding, scope);
  }

  bind(binding: IBinding, scope: IScope) {
    if ((this.expression as any)['expression'] && this.expression.bind) {
      this.expression.bind(binding, scope);
    }

    let behavior = binding.container.get(this.name);
    if (!behavior) {
      throw new Error(`No BindingBehavior named "${this.name}" was found!`);
    }

    let behaviorKey = `behavior-${this.name}`;
    if ((binding as any)[behaviorKey]) {
      throw new Error(`A binding behavior named "${this.name}" has already been applied to "${this.expression}"`);
    }

    (binding as any)[behaviorKey] = behavior;
    (behavior as any).bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, binding.container)));
  }

  unbind(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer) {
    let converter = container.get(this.name);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('toView' in converter) {
      return (<any>converter).toView.apply(converter, evalList(scope, this.allArgs, container));
    }

    return this.allArgs[0].evaluate(scope, container);
  }

  assign(scope: IScope, value: any, container: IContainer) {
    let converter = container.get(this.name);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }

    if ('fromView' in converter) {
      value = (<any>converter).fromView.apply(converter, [value].concat(evalList(scope, this.args, container)));
    }

    return this.allArgs[0].assign(scope, value, container);
  }

  connect(binding: IBinding, scope: IScope) {
    let expressions = this.allArgs;
    let i = expressions.length;
    while (i--) {
      expressions[i].connect(binding, scope);
    }
    let converter = binding.container.get(this.name);
    if (!converter) {
      throw new Error(`No ValueConverter named "${this.name}" was found!`);
    }
    let signals = (converter as any).signals;
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

  evaluate(scope: IScope, container: IContainer): any {
    return this.target.assign(scope, this.value.evaluate(scope, container), container);
  }

  connect() { }

  assign(scope: IScope, value: any, container: IContainer) {
    this.value.assign(scope, value, container);
    this.target.assign(scope, value, container);
  }
}

export class Conditional implements IExpression {
  constructor(private condition: IExpression, private yes: IExpression, private no: IExpression) { }

  evaluate(scope: IScope, container: IContainer) {
    return (!!this.condition.evaluate(scope, container))
      ? this.yes.evaluate(scope, container)
      : this.no.evaluate(scope, container);
  }

  connect(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer) {
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

  evaluate(scope: IScope, container: IContainer) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context[this.name];
  }

  assign(scope: IScope, value: any) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context ? (context[this.name] = value) : undefined;
  }

  connect(binding: IBinding, scope: IScope) {
    let context = getContextFor(this.name, scope, this.ancestor);
    binding.observeProperty(context, this.name);
  }
}

export class AccessMember implements IExpression {
  constructor(private object: IExpression, private name: string) { }

  evaluate(scope: IScope, container: IContainer) {
    let instance = this.object.evaluate(scope, container);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  assign(scope: IScope, value: any, container: IContainer) {
    let instance = this.object.evaluate(scope, container);

    if (instance === null || instance === undefined) {
      instance = {};
      this.object.assign(scope, instance, container);
    }

    instance[this.name] = value;
    return value;
  }

  connect(binding: IBinding, scope: IScope) {
    this.object.connect(binding, scope);

    let obj = this.object.evaluate(scope, null);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  }
}

export class AccessKeyed implements IExpression {
  constructor(private object: IExpression, private key: IExpression) { }

  evaluate(scope: IScope, container: IContainer) {
    let instance = this.object.evaluate(scope, container);
    let lookup = this.key.evaluate(scope, container);
    return getKeyed(instance, lookup);
  }

  assign(scope: IScope, value: any, container: IContainer | null) {
    let instance = this.object.evaluate(scope, container);
    let lookup = this.key.evaluate(scope, container);
    return setKeyed(instance, lookup, value);
  }

  connect(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer | null, mustEvaluate?: boolean) {
    let args = evalList(scope, this.args, container);
    let context = getContextFor(this.name, scope, this.ancestor);
    let func = getFunction(context, this.name, mustEvaluate);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  connect(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer, mustEvaluate: boolean) {
    let instance = this.object.evaluate(scope, container);
    let args = evalList(scope, this.args, container);
    let func = getFunction(instance, this.name, mustEvaluate);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  }

  connect(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer, mustEvaluate: boolean) {
    let func = this.func.evaluate(scope, container);
    if (typeof func === 'function') {
      return func.apply(null, evalList(scope, this.args, container));
    }
    if (!mustEvaluate && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(`${this.func} is not a function`);
  }

  connect(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer) {
    let left = this.left.evaluate(scope, container);

    switch (this.operation) {
      case '&&': return left && this.right.evaluate(scope, container);
      case '||': return left || this.right.evaluate(scope, container);
      // no default
    }

    let right = this.right.evaluate(scope, container);

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

  connect(binding: IBinding, scope: IScope) {
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

  evaluate(scope: IScope, container: IContainer) {
    return !this.expression.evaluate(scope, container);
  }

  connect(binding: IBinding, scope: IScope) {
    this.expression.connect(binding, scope);
  }
}

export class LiteralPrimitive implements IExpression {
  constructor(private value: any) { }

  evaluate(scope: IScope, container: IContainer) {
    return this.value;
  }

  connect(binding: IBinding, scope: IScope) {
  }
}

export class LiteralString implements IExpression {
  constructor(private value: string) { }

  evaluate(scope: IScope, container: IContainer) {
    return this.value;
  }

  connect(binding: IBinding, scope: IScope) { }
}

export class TemplateLiteral implements IExpression {
  constructor(private parts: IExpression[]) { }

  evaluate(scope: IScope, container: IContainer) {
    let elements = this.parts;
    let result = '';

    for (let i = 0, length = elements.length; i < length; ++i) {
      let value = elements[i].evaluate(scope, container);
      if (value === undefined || value === null) {
        continue;
      }
      result += value;
    }

    return result;
  }

  connect(binding: IBinding, scope: IScope) {
    let length = this.parts.length;
    for (let i = 0; i < length; i++) {
      this.parts[i].connect(binding, scope);
    }
  }
}

export class LiteralArray implements IExpression {
  constructor(private elements: IExpression[]) { }

  evaluate(scope: IScope, container: IContainer) {
    let elements = this.elements;
    let result = [];

    for (let i = 0, length = elements.length; i < length; ++i) {
      result[i] = elements[i].evaluate(scope, container);
    }

    return result;
  }

  connect(binding: IBinding, scope: IScope) {
    let length = this.elements.length;
    for (let i = 0; i < length; i++) {
      this.elements[i].connect(binding, scope);
    }
  }
}

export class LiteralObject implements IExpression {
  constructor(private keys: string[], private values: IExpression[]) { }

  evaluate(scope: IScope, container: IContainer) {
    let instance: Record<string, any> = {};
    let keys = this.keys;
    let values = this.values;

    for (let i = 0, length = keys.length; i < length; ++i) {
      instance[keys[i]] = values[i].evaluate(scope, container);
    }

    return instance;
  }

  connect(binding: IBinding, scope: IScope) {
    let length = this.keys.length;
    for (let i = 0; i < length; i++) {
      this.values[i].connect(binding, scope);
    }
  }
}

/// Evaluate the [list] in context of the [scope].
function evalList(scope: IScope, list: IExpression[], container: IContainer) {
  const length = list.length;
  const result = [];

  for (let i = 0; i < length; i++) {
    result[i] = list[i].evaluate(scope, container);
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
