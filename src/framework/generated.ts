import { Observer } from './binding/property-observation';
import {
  IExpression,
  ILookupFunctions,
  AccessScope,
  AccessMember,
  CallScope,
  LiteralString,
  Binary,
  Conditional,
  TemplateLiteral
} from './binding/ast';
import { IBindingTarget, Binding } from './binding/binding';
import { Scope, IObservable, IDelegationStrategy } from './binding/binding-interfaces';
import { bindingMode } from './binding/binding-mode';
import { Listener } from './binding/listener';
import { delegationStrategy } from './binding/event-manager';
import { DOM } from './dom';
import { Ref } from './binding/ref';

const emptyArray: any[] = [];

let lookupFunctions: ILookupFunctions = {
  valueConverters: {},
  bindingBehaviors: {}
};

let astLookup: Record<string, any> = {
  message: new AccessScope('message'),
  textContent: new AccessScope('textContent'),
  value: new AccessScope('value'),
  nameTagBorderWidth: new AccessScope('borderWidth'),
  nameTagBorderColor: new AccessScope('borderColor'),
  nameTagBorder: new TemplateLiteral([
    new AccessScope('borderWidth'),
    new LiteralString('px solid '),
    new AccessScope('borderColor')
  ]),
  nameTagHeaderVisible: new AccessScope('showHeader'),
  nameTagClasses: new TemplateLiteral([
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
  checked: new AccessScope('checked'),
  nameTag: new AccessScope('nameTag')
};

function getAST(key: string) {
  return astLookup[key];
}

export function oneWay(sourceExpression: string, target: IBindingTarget, targetProperty: string) {
  return new Binding(getAST(sourceExpression), target, targetProperty, bindingMode.oneWay, lookupFunctions);
}

export function oneWayText(sourceExpression: string, target: Element) {
  let next = target.nextSibling;
  (next as any)['auInterpolationTarget'] = true;
  target.parentNode.removeChild(target);
  return oneWay(sourceExpression, next, 'textContent');
}

export function twoWay(sourceExpression: string, target: IBindingTarget, targetProperty: string) {
  return new Binding(getAST(sourceExpression), target, targetProperty, bindingMode.twoWay, lookupFunctions);
}

export function listener(
  targetEvent: string,
  target: Element,
  sourceExpression: string,
  preventDefault = true,
  strategy: IDelegationStrategy[keyof IDelegationStrategy] = delegationStrategy.none
) {
  return new Listener(targetEvent, strategy, getAST(sourceExpression), target, preventDefault, lookupFunctions);
}

export function ref(target: IBindingTarget, sourceExpression: string) {
  return new Ref(getAST(sourceExpression), target, lookupFunctions);
}

export function makeElementIntoAnchor(element: Element, elementInstruction?: any) {
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
