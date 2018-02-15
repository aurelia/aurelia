export class Observer<T> {
  currentValue: T;
  subscribers: {callable: ICallable, context: string}[] = [];

  constructor(value: T) {
    this.currentValue = value;
  }

  getValue(): T {
    return this.currentValue;
  }

  setValue(value: T) {
    let oldValue = this.currentValue;
    this.currentValue = value;
    this.subscribers.forEach(x => x.callable.call(x.context, value, oldValue));
  }

  subscribe(callable: ICallable, context: string) {
    this.subscribers.push({ callable, context });
  }
}

export interface ICallable {
  call(context, newValue, oldValue);
}

export interface IBinding {
  bind();
  observeProperty(context, name);
}

interface IExpression {
  evaluate(scope, lookupFunctions): any;
  assign(scope, value): any;
  connect(binding, scope);
}

interface OverrideContext {
  parentOverrideContext: OverrideContext;
  bindingContext: any;
}

interface Scope {
  bindingContext: any;
  overrideContext: OverrideContext;
}

export function getTargets(element: Element) {
  return element.getElementsByClassName('au');
}

export function getContextFor(name: string, scope: Scope, ancestor: number): any {
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

class AccessScope implements IExpression {
  constructor(private name: string, private ancestor: number = 0) {
    this.name = name;
  }

  evaluate(scope, lookupFunctions) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context[this.name];
  }

  assign(scope, value) {
    let context = getContextFor(this.name, scope, this.ancestor);
    return context ? (context[this.name] = value) : undefined;
  }

  connect(binding, scope) {
    let context = getContextFor(this.name, scope, this.ancestor);
    binding.observeProperty(context, this.name);
  }
}

let astLookup = {
  message: new AccessScope('message'),
  textContent: new AccessScope('textContent'),
  value: new AccessScope('value')
};

export class OneWay implements IBinding {
  sourceAst: IExpression;

  constructor(protected source, protected sourceExpression: string, protected target, protected targetProperty: string) {
    this.sourceAst = astLookup[sourceExpression];
  }

  bind() {
    this.target[this.targetProperty] = this.sourceAst.evaluate(this.source, null);
    this.sourceAst.connect(this, this.source);
  }

  observeProperty(context, name) {
    context.$observers[name].subscribe(this, 'source');
  }

  call(context, newValue, oldValue) {
    if (context == 'source') {
      this.target[this.targetProperty] = this.sourceAst.evaluate(this.source, null);
    }
  }
}

export class TwoWay extends OneWay {
  bind() {
    super.bind();
    this.target.addEventListener('input', () => this.sourceAst.assign(this.source, this.target[this.targetProperty]));
  }
}
