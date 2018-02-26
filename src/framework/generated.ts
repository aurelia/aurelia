import { Scope } from './binding/scope';
import { Observer } from './binding/property-observation';
import {
  IExpression,
  ILookupFunctions,
  AccessScope,
  AccessMember,
  CallScope,
  LiteralString,
  Binary,
  Conditional
} from './binding/ast';
import { IBindingTarget, IObservable, Binding } from './binding/binding';
import { bindingMode } from './binding/binding-mode';
import { Listener } from './binding/listener';
import { delegationStrategy } from './binding/event-manager';
import { DOM } from './dom';
import { InterpolationString } from './new';

const emptyArray = [];

let lookupFunctions: ILookupFunctions = {
  valueConverters: {},
  bindingBehaviors: {}
};

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
  nameTagColor: new AccessScope('color'),
  duplicateMessage: new AccessScope('duplicateMessage'),
  checked: new AccessScope('checked')
};

function getAST(key: string) {
  return astLookup[key];
}

export function oneWay(sourceExpression: string, target: IBindingTarget, targetProperty: string) {
  return new Binding(getAST(sourceExpression), target, targetProperty, bindingMode.oneWay, lookupFunctions);
}

export function oneWayText(sourceExpression: string, target: Element) {
  let next = target.nextSibling;
  next['auInterpolationTarget'] = true;
  target.parentNode.removeChild(target);
  return oneWay(sourceExpression, next, 'textContent');
}

export function twoWay(sourceExpression: string, target: IBindingTarget, targetProperty: string) {
  return new Binding(getAST(sourceExpression), target, targetProperty, bindingMode.twoWay, lookupFunctions);
}

export function listener(targetEvent: string, target: Element, sourceExpression: string, preventDefault = true, strategy: number = delegationStrategy.none) {
  return new Listener(targetEvent, strategy, getAST(sourceExpression), target, preventDefault, lookupFunctions);
}

export function makeElementIntoAnchor(element: Element, elementInstruction?) {
  let anchor = DOM.createComment('anchor');

  if (elementInstruction) {
    // let firstChild = element.firstChild;

    // if (firstChild && firstChild.tagName === 'AU-CONTENT') {
    //   anchor.contentElement = firstChild;
    // }

    // anchor._element = element;

    // anchor.hasAttribute = hasAttribute;
    // anchor.getAttribute = getAttribute;
    // anchor.setAttribute = setAttribute;
  }

  DOM.replaceNode(anchor, element);

  return anchor;
}

type valueOf<K, T extends keyof K = keyof K> = K[T];

interface IBindingType {
  binding: 1;
  listener: 2;
  ref: 3;
  text: 4;
}

export const bindingType: IBindingType = {
  binding: 1,
  listener: 2,
  ref: 3,
  text: 4,
}

export interface dehydratedBinding extends Array<any> {
  0: /** targetIndex */ number,
  1: /** bindingType */ valueOf<typeof bindingType>,
  2: /** expression */ any[],
  3?: /** attr or Event or ref type */ string,
  4?: /** bindingMode */ valueOf<typeof bindingMode & typeof delegationStrategy>
};

export function hydrateBindings(bindings: dehydratedBinding[]) {
  return bindings.map(hydrateBinding);
}

export function hydrateBinding(binding: dehydratedBinding) {
  const [targetIndex, _bindingType, expression, attrOrEventOrRef, bindingSpecifier] = binding;
  switch (_bindingType) {
    case bindingType.binding:
      break;
    case bindingType.listener:
      break;
    default: throw new Error('Invalid binding type');
  }
}

export function hydrateExpression(hydratedExpression: any[]): IExpression {
  const [astKind,]
  return null;
}
