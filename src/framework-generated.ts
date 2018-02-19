import { Scope } from './framework/scope';
import { Observer } from './framework/property-observation';
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
import { IBindingTarget, IObservable, Binding } from './framework/binding';
import { bindingMode } from './framework/binding-mode';
import { Listener } from './framework/listener';
import { delegationStrategy } from './framework/event-manager';
import { InterpolationString } from './framework-new';

const emptyArray = [];

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
  submit: new CallScope('submit', emptyArray, 0),
  nameTagColor: new AccessScope('color')
};

function getAST(key: string) {
  return astLookup[key];
}

export function oneWay(sourceExpression: string, target: IBindingTarget, targetProperty: string) {
  return new Binding(getAST(sourceExpression), target, targetProperty, bindingMode.oneWay, null);
}

export function oneWayText(sourceExpression: string, target: Element) {
  let next = target.nextSibling;
  next['auInterpolationTarget'] = true;
  target.parentNode.removeChild(target);
  return oneWay(sourceExpression, next, 'textContent');
}

export function twoWay(sourceExpression: string, target: IBindingTarget, targetProperty: string) {
  return new Binding(getAST(sourceExpression), target, targetProperty, bindingMode.twoWay, null);
}

export function listener(targetEvent: string, target: Element, sourceExpression: string, preventDefault = true, strategy: number = delegationStrategy.none) {
  return new Listener(targetEvent, strategy, getAST(sourceExpression), target, preventDefault, null);
}
