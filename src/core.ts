export interface OverrideContext {
  parentOverrideContext: OverrideContext;
  bindingContext: any;
}

export interface Scope {
  bindingContext: any;
  overrideContext: OverrideContext;
}

export interface IBindingExpression {
  createBinding(target, source): IBinding;
}

export interface IBinding {
  bind();
  unbind();
  observeProperty(context, name);
}

export interface ILookupFunctions {
  valueConverters: Record<string, any>;
  bindingBehaviors: Record<string, any>;
}

export interface IExpression {
  evaluate(scope: Scope, lookupFunctions: ILookupFunctions | null, mustEvaluateIfFunction?: boolean): any;
  assign(scope: Scope, value: any): any;
  connect(binding: IBinding, scope: Scope);
  bind?(binding: IBinding, scope: Scope, lookupFunctions: ILookupFunctions | null): void;
  unbind?(binding: IBinding, scope: Scope, lookupFunctions: ILookupFunctions | null): void;
}

export class AccessScope implements IExpression {
  constructor(private name: string, private ancestor: number = 0) {
    this.name = name;
  }

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
  isAssignable: boolean;

  constructor(
    protected object: AccessScope,
    protected name: string
  ) {
    this.object = object;
    this.name = name;
    this.isAssignable = true;
  }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions | null) {
    let instance = this.object.evaluate(scope, lookupFunctions);
    return instance === null || instance === undefined ? instance : instance[this.name];
  }

  assign(scope, value) {
    let instance = this.object.evaluate(scope, null);

    if (instance === null || instance === undefined) {
      // instance = {};
      // this.object.assign(scope, instance);
      return;
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

export class CallScope implements IExpression {
  constructor(
    private name: string,
    private args: IExpression[],
    private ancestor: number
  ) { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions | null, mustEvaluate?: boolean) {
    let args = evalList(scope, this.args, lookupFunctions);
    let context = getContextFor(this.name, scope, this.ancestor);
    let func = getFunction(context, this.name, mustEvaluate);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  }

  assign() { }

  connect(binding: IBinding, scope: Scope) {
    let args = this.args;
    let i = args.length;
    while (i--) {
      args[i].connect(binding, scope);
    }
  }
}

export class LiteralString implements IExpression {

  constructor(
    protected value: string
  ) {
  }

  assign() { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return this.value;
  }

  connect(binding: IBinding, scope: Scope) { }
}

export class InterpolationString implements IExpression {

  constructor(
    protected parts: IExpression[]
  ) {

  }

  assign() { }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    let result = '';
    let parts = this.parts;
    let ii = parts.length;
    for (let i = 0; ii > i; ++i) {
      let partValue = parts[i].evaluate(scope, lookupFunctions);
      if (partValue === null || partValue === undefined) {
        continue;
      }
      result += partValue.toString();
    }
    return result;
  }

  connect(binding: IBinding, scope: Scope) {
    let parts = this.parts;
    let i = parts.length;
    while (i--) {
      parts[i].connect(binding, scope);
    }
  }
}

export class Conditional implements IExpression {
  constructor(
    protected condition: IExpression,
    protected yes: IExpression,
    protected no: IExpression
  ) {
  }

  evaluate(scope: Scope, lookupFunctions: ILookupFunctions) {
    return (!!this.condition.evaluate(scope, lookupFunctions))
      ? this.yes.evaluate(scope, lookupFunctions)
      : this.no.evaluate(scope, lookupFunctions);
  }

  assign() { }

  connect(binding: IBinding, scope: Scope) {
    this.condition.connect(binding, scope);
    if (this.condition.evaluate(scope, null)) {
      this.yes.connect(binding, scope);
    } else {
      this.no.connect(binding, scope);
    }
  }
}

export class Binary implements IExpression {
  constructor(
    protected operation: string,
    protected left: IExpression,
    protected right: IExpression
  ) {

  }

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

  assign() { }

  connect(binding: IBinding, scope: Scope) {
    this.left.connect(binding, scope);
    let left = this.left.evaluate(scope, null, false);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(binding, scope);
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

function getContextFor(name: string, scope: Scope, ancestor: number): any {
  let oc = scope.overrideContext;

  if (ancestor) {
    // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
    while (ancestor && oc) {
      ancestor--;
      oc = oc.parentOverrideContext;
    }
    if (ancestor || !oc) {
      return undefined;
    }
    return name in oc ? oc : oc.bindingContext;
  }

  // traverse the context and it's ancestors, searching for a context that has the name.
  while (oc && !(name in oc) && !(oc.bindingContext && name in oc.bindingContext)) {
    oc = oc.parentOverrideContext;
  }
  if (oc) {
    // we located a context with the property.  return it.
    return name in oc ? oc : oc.bindingContext;
  }
  // the name wasn't found.  return the root binding context.
  return scope.bindingContext || scope.overrideContext;
}

function getFunction(obj: object, name: string, mustExist?: boolean) {
  let func = obj === null || obj === undefined ? null : obj[name];
  if (typeof func === 'function') {
    return func;
  }
  if (!mustExist && (func === null || func === undefined)) {
    return null;
  }
  throw new Error(`${name} is not a function`);
}

/// Add the two arguments with automatic type conversion.
function autoConvertAdd(a, b) {
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
