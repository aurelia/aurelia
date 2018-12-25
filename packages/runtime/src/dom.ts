import { DI, IContainer, IResolver, PLATFORM } from '@aurelia/kernel';

export interface INode extends Object {}

export const INode = DI.createInterface<INode>().noDefault();

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation extends INode {
  $start?: IRenderLocation;
  $nodes?: INodeSequence | Readonly<{}>;
}

/**
 * Represents a DocumentFragment
 */
export interface INodeSequence extends INode {
  /**
   * The nodes of this sequence.
   */
  childNodes: ArrayLike<INode>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ArrayLike<INode>;

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

export const IDOM = DI.createInterface<IDOM>().noDefault();

export interface IDOM {
  addClass(node: unknown, className: string): void;
  addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
  appendChild(parent: unknown, child: unknown): void;
  attachShadow(host: unknown, options: unknown): INode;
  cloneNode<T>(node: T, deep?: boolean): T;
  convertToRenderLocation(node: unknown): IRenderLocation;
  createComment(text: string): INode;
  createDocumentFragment(markupOrNode?: unknown): INode;
  createElement(name: string): INode;
  createNodeObserver(target: unknown, callback: unknown, options: unknown): void;
  createTemplate(markup?: unknown): INode;
  createTextNode(text: string): INode;
  getAttribute(node: unknown, name: string): string;
  hasClass(node: unknown, className: string): boolean;
  hasParent(node: unknown): boolean;
  insertBefore(nodeToInsert: unknown, referenceNode: unknown): void;
  isMarker(node: unknown): node is INode;
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
  childNodes: PLATFORM.emptyArray,
  findTargets(): ArrayLike<INode> { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): void { /*do nothing*/ },
  appendTo(parent: INode): void { /*do nothing*/ },
  remove(): void { /*do nothing*/ }
};

export const NodeSequence = {
  empty: emptySequence
};

export interface INodeSequenceFactory {
  createNodeSequence(): INodeSequence;
}
