import { DI, IContainer, IResolver, PLATFORM } from '@aurelia/kernel';

export interface INode extends Object {}

export const INode = DI.createInterface<INode>().noDefault();

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation<T extends INode = INode> extends INode {
  $start?: IRenderLocation<T>;
  $nodes?: INodeSequence<T> | Readonly<{}>;
}

/**
 * Represents a DocumentFragment
 */
export interface INodeSequence<T extends INode = INode> extends INode {
  /**
   * The nodes of this sequence.
   */
  childNodes: ArrayLike<T>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ArrayLike<T>;

  /**
   * Insert this sequence as a sibling before refNode
   */
  insertBefore(refNode: T): void;

  /**
   * Append this sequence as a child to parent
   */
  appendTo(parent: T): void;

  /**
   * Remove this sequence from its parent.
   */
  remove(): void;
}

export const IDOM = DI.createInterface<IDOM>().noDefault();

export interface IDOM<T extends INode = INode> {
  addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
  appendChild(parent: T, child: T): void;
  cloneNode<TClone extends T>(node: TClone, deep?: boolean): TClone;
  convertToRenderLocation(node: T): IRenderLocation<T>;
  createDocumentFragment(markupOrNode?: string | T): T;
  createElement(name: string): T;
  createTemplate(markup?: string): T;
  createTextNode(text: string): T;
  insertBefore(nodeToInsert: T, referenceNode: T): void;
  isMarker(node: unknown): node is T;
  isNodeInstance(potentialNode: unknown): potentialNode is T;
  isRenderLocation(node: unknown): node is IRenderLocation<T>;
  makeTarget(node: T): void;
  registerElementResolver(container: IContainer, resolver: IResolver): void;
  remove(node: T): void;
  removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
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

export interface INodeSequenceFactory<T extends INode = INode> {
  createNodeSequence(): INodeSequence<T>;
}
