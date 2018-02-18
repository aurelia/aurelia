import { InterpolationString } from './core';
import { Scope } from './framework/scope';
import {
  Expression,
  IBinding,
  ILookupFunctions,
  AccessScope,
  AccessMember,
  CallScope,
  LiteralString,
  Binary,
  Conditional
} from './framework/ast';

const emptyArray = [];

export class Observer<T> {
  currentValue: T;
  subscribers: { callable: ICallable, context: string }[] = [];

  constructor(value: T) {
    this.currentValue = value;
  }

  getValue(): T {
    return this.currentValue;
  }

  setValue(value: T) {
    let oldValue = this.currentValue;
    if (Object.is(value, oldValue)) {
      return;
    }
    this.currentValue = value;
    this.subscribers.forEach(x => x.callable.call(x.context, value, oldValue));
  }

  subscribe(callable: ICallable, context: string) {
    this.subscribers.push({ callable, context });
  }

  unsubscribe(callable: ICallable, context: string) {
    let idx = this.subscribers.findIndex(x => x.context === context && x.callable === callable);
    if (idx > -1) {
      this.subscribers.splice(idx, 1);
    }
  }
}

export interface ICallable {
  call(context, newValue, oldValue);
}

export interface IObservable<T = any> {
  $observers: Record<string, Observer<T>>;
  bind();
  unbind();
}

export type IBindingTarget = Element | CSSStyleDeclaration | IObservable;



export function getTargets(element: Element) {
  return element.getElementsByClassName('au');
}

let astLookup = {
  message: new AccessScope('message'),
  textContent: new AccessScope('textContent'),
  value: new AccessScope('value'),
  nameTagBorderWidth: new AccessScope('borderWidth'),
  nameTagBorderColor: new AccessScope('borderColor'),
  nameTagBorder: new InterpolationString([
    new AccessScope('borderWidth'),
    new LiteralString('px solid '),
    new AccessScope('borderColor')
  ]),
  nameTagHeaderVisible: new AccessScope('showHeader'),
  nameTagClasses: new InterpolationString([
    new LiteralString('au name-tag '),
    new Conditional(
      new AccessScope('showHeader'),
      new LiteralString('header-visible'),
      new LiteralString('')
    )
  ]),
  name: new AccessScope('name'),
  click: new CallScope('submit', emptyArray, 0),
  nameTagColor: new AccessScope('color')
};

export class OneWay implements IBinding {
  sourceAst: Expression;

  constructor(
    protected source: Scope,
    protected sourceExpression: string,
    protected target: IBindingTarget,
    protected targetProperty: string
  ) {
    this.sourceAst = astLookup[sourceExpression];
  }

  bind() {
    this.target[this.targetProperty] = this.sourceAst.evaluate(this.source, null);
    this.sourceAst.connect(this, this.source);
  }

  unbind() {

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

  constructor(
    source: Scope,
    sourceExpression: string,
    target: IBindingTarget,
    targetProperty: string,
    protected events?: string[]
  ) {
    super(source, sourceExpression, target, targetProperty);
  }

  bind() {
    super.bind();
    let target = this.target;
    let events = this.events;
    if (events) {
      for (let i = 0, ii = events.length; ii > i; ++i) {
        (target as Element).addEventListener(events[i], this);
      }
      return;
    }
    target = target as IObservable;
    target.$observers[this.targetProperty].subscribe(this, 'target');
    target.bind();
  }

  unbind() {
    let target = this.target;
    let events = this.events;
    if (events) {
      for (let i = 0, ii = events.length; ii > i; ++i) {
        (target as Element).removeEventListener(events[i], this);
      }
      return;
    }
    target = target as IObservable;
    target.$observers[this.targetProperty].unsubscribe(this, 'target');
    target.unbind();
  }

  call<T = any>(context: string, newValue: T, oldValue: T) {
    if (context === 'target') {
      this.updateSource();
    } else {
      this.updateTarget();
    }
  }

  handleEvent(e: Event) {
    this[`on${e.type}`](e);
  }

  updateSource() {
    this.sourceAst.assign(this.source, this.target[this.targetProperty]);
  }

  updateTarget() {
    this.target[this.targetProperty] = this.sourceAst.evaluate(this.source, null);
  }

  oninput() {
    this.updateSource();
  }

  onchange() {
    this.updateSource();
  }
}

export class Listener implements IBinding {

  sourceAst: Expression;

  constructor(
    protected source: Scope,
    protected name: string,
    protected target: EventTarget,
    protected targetEvent: string,
    protected lookupFunctions: ILookupFunctions | null,
    protected preventDefault = true
  ) {
    this.sourceAst = astLookup[name];
  }

  observeProperty() {
    throw new Error('Listener does not observe property');
  }

  handleEvent(e: Event) {
    this.callSource(e);
  }

  callSource(e: Event) {
    let overrideContext = this.source.bindingContext;
    (overrideContext as any).$event = event;
    let mustEvaluate = true;
    let result = this.sourceAst.evaluate(this.source, null, mustEvaluate);
    delete (overrideContext as any).$event;
    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }
    return result;
  }

  bind() {
    if (this.sourceAst.bind) {
      this.sourceAst.bind(this, this.source, this.lookupFunctions);
    }
    this.target.addEventListener(this.targetEvent, this, false);
  }

  unbind() {
    if (this.sourceAst.unbind) {
      this.sourceAst.unbind(this, this.source, this.lookupFunctions);
    }
    this.target.removeEventListener(this.targetEvent, this, false);
  }
}
