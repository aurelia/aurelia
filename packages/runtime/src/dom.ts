import {
  DI,
  IContainer,
  IResolver,
  PLATFORM,
  Writable
} from '@aurelia/kernel';
import {
  IChildNode,
  IComment,
  IDocumentFragment,
  IHTMLElement,
  IHTMLTemplateElement,
  IMutationObserver,
  INode,
  INodeSequence,
  IParentNode,
  IRenderLocation,
  IText,
  NodeType
} from './dom.interfaces';

export const IDOM = DI.createInterface<IDOM>().noDefault();

export interface IDOM {
  addClass(node: unknown, className: string): void;
  addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
  appendChild(parent: unknown, child: unknown): void;
  attachShadow(host: unknown, options: unknown): IDocumentFragment;
  cloneNode<T>(node: T, deep?: boolean): T;
  convertToRenderLocation(node: unknown): IRenderLocation;
  createComment(text: string): IComment;
  createDocumentFragment(markupOrNode?: unknown): IDocumentFragment;
  createElement(name: string): IHTMLElement;
  createNodeObserver(target: unknown, callback: unknown, options: unknown): IMutationObserver;
  createTemplate(markup?: unknown): IHTMLTemplateElement;
  createTextNode(text: string): IText;
  getAttribute(node: unknown, name: string): string;
  hasClass(node: unknown, className: string): boolean;
  hasParent(node: unknown): boolean;
  insertBefore(nodeToInsert: unknown, referenceNode: unknown): void;
  isMarker(node: unknown): node is IHTMLElement;
  isNodeInstance(potentialNode: unknown): potentialNode is INode;
  isRenderLocation(node: unknown): node is IRenderLocation;
  registerElementResolver(container: IContainer, resolver: IResolver): void;
  remove(node: unknown): void;
  removeAttribute(node: unknown, name: string): void;
  removeClass(node: unknown, className: string): void;
  removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
  replaceNode(newChild: unknown, oldChild: unknown): void;
  setAttribute(node: unknown, name: string, value: string): void;
}

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

export interface INodeSequenceFactory {
  createNodeSequence(): INodeSequence;
}

export interface AuMarker extends INode { }

/** @internal */
export class AuMarker implements INode {
  public get parentNode(): INode & IParentNode {
    return this.nextSibling.parentNode;
  }
  public readonly nextSibling: INode;
  public readonly previousSibling: INode;
  public readonly content?: INode;
  public readonly firstChild: IChildNode;
  public readonly lastChild: IChildNode;
  public readonly childNodes: ArrayLike<IChildNode>;
  public readonly nodeName: 'AU-M';
  public readonly nodeType: NodeType.Element;

  public textContent: string;

  constructor(next: INode) {
    this.nextSibling = next;
    this.textContent = '';
  }
  public remove(): void { /* do nothing */ }
}

(proto => {
  proto.previousSibling = null;
  proto.firstChild = null;
  proto.lastChild = null;
  proto.childNodes = PLATFORM.emptyArray;
  proto.nodeName = 'AU-M';
  proto.nodeType = NodeType.Element;
})(AuMarker.prototype as Writable<AuMarker>);
