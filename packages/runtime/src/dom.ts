import { DI, IContainer, IResolver, PLATFORM, Reporter, Writable } from '@aurelia/kernel';
import { ICustomElement } from './templating/custom-element';

// ensure we don't get "... is not defined" errors in non-browser environments
// tslint:disable-next-line
var document: typeof DOM;
// tslint:disable-next-line
var Element: IElement;
// tslint:disable-next-line
var HTMLElement: IElement;
// tslint:disable-next-line
var SVGElement: IElement;

export const ELEMENT_NODE = 1;
export const ATTRIBUTE_NODE = 2;
export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;
export const DOCUMENT_FRAGMENT_NODE = 11;

export interface INodeLike {
  readonly firstChild: INode | null;
  readonly lastChild: INode | null;
  readonly childNodes: ArrayLike<INode>;
}
export const INode = DI.createInterface<INode>().noDefault();
export interface INode extends INodeLike {
  textContent: string;
  readonly parentNode: INode | null;
  readonly nextSibling: INode | null;
  readonly previousSibling: INode | null;
  readonly nodeName: string;
  readonly nodeType: typeof ELEMENT_NODE | typeof TEXT_NODE | typeof COMMENT_NODE | typeof DOCUMENT_FRAGMENT_NODE;
}
export interface IAttr extends Partial<INode> {
  readonly name: string;
  value: string;
}

export interface IElement extends INode {
  readonly content?: IDocumentFragment;
}

export interface IStyleDeclaration {
  cssText: string;
  setProperty(propertyName: string, value: string, priority?: string): void;
  removeProperty(propertyName: string): void;
}
export interface IHTMLElement extends IElement {
  readonly style: IStyleDeclaration;
  setAttributeNS(namespace: string, qualifiedName: string, value: string): void;
  getAttributeNS(namespace: string, qualifiedName: string): string;
}

export interface IInputElement extends IElement {
  // tslint:disable-next-line:no-reserved-keywords
  readonly type: string;
  value: string;
  checked: boolean;
}

export interface IText extends INode {
  readonly nodeName: '#text';
  readonly nodeType: typeof TEXT_NODE;
}

export interface IComment extends INode {
  readonly nodeName: '#comment';
  readonly nodeType: typeof COMMENT_NODE;
}

export interface IDocumentFragment extends INode {
  readonly nodeName: '#document-fragment';
  readonly nodeType: typeof DOCUMENT_FRAGMENT_NODE;
}

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation extends ICustomElementHost { }

export interface ICustomElementHost extends INode {
  $customElement?: ICustomElement;
}

/**
 * Represents a DocumentFragment
 */
export interface INodeSequence extends INodeLike {
  /**
   * The nodes of this sequence.
   */
  childNodes: ReadonlyArray<INode>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ArrayLike<INode> | ReadonlyArray<INode>;

  /**
   * Insert this sequence as a sibling before refNode
   */
  insertBefore(refNode: INode): void;

  /**
   * Append this sequence as a child to parent
   */
  appendTo(parent: INode): void;

  /**
   * Remove this sequence from its parent.
   */
  remove(): void;
}

export interface INodeObserver {
  disconnect(): void;
}

// tslint:disable:align
// tslint:disable:no-any
/*@internal*/export function createTemplate(): IElement {
  return document.createElement('template');
}

/*@internal*/export function createDocumentFragment(): IDocumentFragment {
  return document.createDocumentFragment();
}

/*@internal*/export function addClass(node: INode, className: string): void {
  (<any>node).classList.add(className);
}

/*@internal*/export function addEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void {
  ((<any>publisher) || document).addEventListener(eventName, subscriber, options);
}

/*@internal*/export function appendChild(parent: INode, child: INode): void {
  (<any>parent).appendChild(child);
}

/*@internal*/export function attachShadow(host: IElement, options: ShadowRootInit): IDocumentFragment {
  return (<any>host).attachShadow(options);
}

/*@internal*/export function cloneNode<T extends INode = INode>(node: T, deep?: boolean): T {
  return (<any>node).cloneNode(deep !== false); // use true unless the caller explicitly passes in false
}

/*@internal*/export function convertToRenderLocation(node: INode): IRenderLocation {
  if (node.parentNode === null) {
    throw Reporter.error(52);
  }
  const location = document.createComment('au-loc');
  (<any>node).parentNode.replaceChild(location, node);
  return location;
}

/*@internal*/export function createComment(text: string): IComment {
  return document.createComment(text);
}

/*@internal*/
export function createElement(name: string): IElement {
  return document.createElement(name);
}

/*@internal*/export function createNodeObserver(target: INode, callback: MutationCallback, options: MutationObserverInit): MutationObserver {
  const observer = new MutationObserver(callback);
  observer.observe(<any>target, options);
  return observer;
}

/*@internal*/export function createNodeSequenceFactory(markupOrNode: string | IElement): () => INodeSequence {
  let fragment: IDocumentFragment;
  if (isNodeInstance(markupOrNode)) {
    if (markupOrNode.content !== undefined) {
      fragment = markupOrNode.content;
    } else {
      fragment = createDocumentFragment();
      appendChild(fragment, markupOrNode);
    }
  } else {
    const template = createTemplate();
    (<any>template).innerHTML = markupOrNode;
    fragment = template.content;
  }
  const childNodes = fragment.childNodes;
  if (childNodes.length === 2) {
    const target = childNodes[0];
    if (target.nodeName === 'AU-MARKER') {
      const text = childNodes[1];
      if (text.nodeType === TEXT_NODE && text.textContent === ' ') {
        // tslint:disable-next-line:typedef
        return (function() {
          return new TextNodeSequence((<any>text).cloneNode(false));
        }).bind(undefined);
      }
    }
  }
  // tslint:disable-next-line:typedef
  return (function() {
    return new FragmentNodeSequence((<any>fragment).cloneNode(true));
  }).bind(undefined);
}

/*@internal*/export function createTextNode(text: string): IText {
  return document.createTextNode(text);
}

/*@internal*/export function getAttribute(node: INode, name: string): any {
  return (<any>node).getAttribute(name);
}

/*@internal*/export function hasClass(node: INode, className: string): boolean {
  return (<any>node).classList.contains(className);
}

/*@internal*/export function insertBefore(nodeToInsert: INode, referenceNode: INode): void {
  (<any>referenceNode).parentNode.insertBefore(nodeToInsert, referenceNode);
}

/*@internal*/export function isAllWhitespace(node: INode): boolean {
  if ((<any>node).auInterpolationTarget === true) {
    return false;
  }
  const text = node.textContent;
  const len = text.length;
  let i = 0;
  // for perf benchmark of this compared to the regex method: http://jsben.ch/p70q2 (also a general case against using regex)
  while (i < len) {
    // charCodes 0-0x20(32) can all be considered whitespace (non-whitespace chars in this range don't have a visual representation anyway)
    if (text.charCodeAt(i) > 0x20) {
      return false;
    }
    i++;
  }
  return true;
}

/*@internal*/export function isCommentNodeType(node: INode): node is IComment {
  return node.nodeType === ELEMENT_NODE;
}

/*@internal*/export function isDocumentFragmentType(node: INode): node is IDocumentFragment {
  return node.nodeType === ELEMENT_NODE;
}

/*@internal*/export function isElementNodeType(node: INode): node is IElement {
  return node.nodeType === ELEMENT_NODE;
}

/*@internal*/export function isNodeInstance(potentialNode: any): potentialNode is INode {
  return potentialNode.nodeType > 0;
}

/*@internal*/export function isTextNodeType(node: INode): node is IText {
  return node.nodeType === TEXT_NODE;
}

/*@internal*/export function migrateChildNodes(currentParent: INode, newParent: INode): void {
  while (currentParent.firstChild) {
    appendChild(newParent, currentParent.firstChild);
  }
}

/*@internal*/export function registerElementResolver(container: IContainer, resolver: IResolver): void {
  container.registerResolver(INode, resolver);
  container.registerResolver(Element, resolver);
  container.registerResolver(HTMLElement, resolver);
  container.registerResolver(SVGElement, resolver);
}

/*@internal*/export function remove(node: INodeLike): void {
  if ((<any>node).remove) {
    (<any>node).remove();
  } else {
    (<any>node).parentNode.removeChild(node);
  }
}

/*@internal*/export function removeAttribute(node: INode, name: string): void {
  (<any>node).removeAttribute(name);
}

/*@internal*/export function removeClass(node: INode, className: string): void {
  (<any>node).classList.remove(className);
}

/*@internal*/export function removeEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void {
  ((<any>publisher) || document).removeEventListener(eventName, subscriber, options);
}

/*@internal*/export function replaceNode(newChild: INode, oldChild: INode): void {
  if (oldChild.parentNode) {
    (<any>oldChild).parentNode.replaceChild(newChild, oldChild);
  }
}

/*@internal*/export function setAttribute(node: INode, name: string, value: any): void {
  (<any>node).setAttribute(name, value);
}

/*@internal*/export function treatAsNonWhitespace(node: INode): void {
  // see isAllWhitespace above
  (<any>node).auInterpolationTarget = true;
}
// tslint:enable:align
// tslint:enable:no-any

export const DOM = {
  /*@internal*/createDocumentFragment,
  /*@internal*/createTemplate,
  addClass,
  addEventListener,
  appendChild,
  attachShadow,
  cloneNode,
  convertToRenderLocation,
  createComment,
  createElement,
  createNodeObserver,
  createNodeSequenceFactory,
  createTextNode,
  getAttribute,
  hasClass,
  insertBefore,
  isAllWhitespace,
  isElementNodeType,
  isNodeInstance,
  isTextNodeType,
  migrateChildNodes,
  registerElementResolver,
  remove,
  removeAttribute,
  removeClass,
  removeEventListener,
  replaceNode,
  setAttribute,
  treatAsNonWhitespace
};

// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: INodeSequence = {
  firstChild: null,
  lastChild: null,
  childNodes: PLATFORM.emptyArray,
  findTargets(): ReturnType<INodeSequence['findTargets']> { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): ReturnType<INodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: INode): ReturnType<INodeSequence['appendTo']> { /*do nothing*/ },
  remove(): ReturnType<INodeSequence['remove']> { /*do nothing*/ }
};

export const NodeSequence = {
  empty: emptySequence
};

/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-marker` node
 * - text is the actual text node
 */
export class TextNodeSequence implements INodeSequence {
  public firstChild: IText;
  public lastChild: IText;
  public childNodes: IText[];

  private targets: [INode];

  constructor(text: IText) {
    this.firstChild = text;
    this.lastChild = text;
    this.childNodes = [text];
    this.targets = [new AuMarker(text)];
  }

  public findTargets(): ArrayLike<INode> {
    return this.targets;
  }

  public insertBefore(refNode: INode): void {
    // tslint:disable-next-line:no-any
    (<any>refNode).parentNode.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: INode): void {
    // tslint:disable-next-line:no-any
    (<any>parent).appendChild(this.firstChild);
  }

  public remove(): void {
    // tslint:disable-next-line:no-any
    (<any>this.firstChild).remove();
  }
}

// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/*@internal*/
export class FragmentNodeSequence implements INodeSequence {
  public firstChild: INode;
  public lastChild: INode;
  public childNodes: INode[];

  private fragment: IDocumentFragment;

  constructor(fragment: IDocumentFragment) {
    this.fragment = fragment;
    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;
    this.childNodes = PLATFORM.toArray(fragment.childNodes);
  }

  public findTargets(): ArrayLike<INode> {
    // tslint:disable-next-line:no-any
    return (<any>this.fragment).querySelectorAll('.au');
  }

  public insertBefore(refNode: INode): void {
    // tslint:disable-next-line:no-any
    (<any>refNode).parentNode.insertBefore(this.fragment, refNode);
  }

  public appendTo(parent: INode): void {
    // tslint:disable-next-line:no-any
    (<any>parent).appendChild(this.fragment);
  }

  public remove(): void {
    const fragment = this.fragment;
    let current = this.firstChild;

    if (current.parentNode !== fragment) {
      const end = this.lastChild;
      let next: INode;

      while (current !== null) {
        next = current.nextSibling;
        // tslint:disable-next-line:no-any
        (<any>fragment).appendChild(current);

        if (current === end) {
          break;
        }

        current = next;
      }
    }
  }
}

/*@internal*/
export class AuMarker implements INode {
  public get parentNode(): INode {
    return this.nextSibling.parentNode;
  }
  public readonly nextSibling: INode;
  public readonly previousSibling: INode;
  public readonly content?: INode;
  public readonly firstChild: INode;
  public readonly lastChild: INode;
  public readonly childNodes: ArrayLike<INode>;
  public readonly nodeName: 'AU-MARKER';
  public readonly nodeType: typeof ELEMENT_NODE;
  public textContent: string = '';

  constructor(next: INode) {
    this.nextSibling = next;
  }
  public remove(): void { /* do nothing */ }
}
(<Writable<AuMarker>>AuMarker.prototype).previousSibling = null;
(<Writable<AuMarker>>AuMarker.prototype).firstChild = null;
(<Writable<AuMarker>>AuMarker.prototype).lastChild = null;
(<Writable<AuMarker>>AuMarker.prototype).childNodes = PLATFORM.emptyArray;
(<Writable<AuMarker>>AuMarker.prototype).nodeName = 'AU-MARKER';
(<Writable<AuMarker>>AuMarker.prototype).nodeType = ELEMENT_NODE;
