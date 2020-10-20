import {
  DI,
  IContainer,
  IResolver,
  PLATFORM,
} from '@aurelia/kernel';
import { IScheduler } from '@aurelia/scheduler';

export interface INode extends Object {}

export const INode = DI.createInterface<INode>('INode').noDefault();

export const IRenderLocation = DI.createInterface<IRenderLocation>('IRenderLocation').noDefault();
export interface IRenderLocation<T extends INode = INode> extends INode {
  $start?: IRenderLocation<T>;
  $nodes?: INodeSequence<T> | Readonly<{}>;
}

/**
 * Represents a DocumentFragment
 */
export interface INodeSequence<T extends INode = INode> extends INode {
  readonly isMounted: boolean;
  readonly isLinked: boolean;

  readonly next?: INodeSequence<T>;

  /**
   * The nodes of this sequence.
   */
  readonly childNodes: ArrayLike<T>;

  readonly firstChild: T;

  readonly lastChild: T;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ArrayLike<T>;

  /**
   * Insert this sequence as a sibling before refNode
   */
  insertBefore(refNode: T | IRenderLocation<T>): void;

  /**
   * Append this sequence as a child to parent
   */
  appendTo(parent: T, enhance?: boolean): void;

  /**
   * Remove this sequence from the DOM.
   */
  remove(): void;

  addToLinked(): void;

  unlink(): void;

  link(next: INodeSequence<T> | IRenderLocation<T> | undefined): void;
}

export const IDOM = DI.createInterface<IDOM>('IDOM').noDefault();

export interface IDOM<T extends INode = INode> {
  addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
  appendChild(parent: T, child: T): void;
  cloneNode<TClone extends T>(node: TClone, deep?: boolean): TClone;
  convertToRenderLocation(node: T): IRenderLocation<T>;
  createDocumentFragment(markupOrNode?: string | T): T;
  createNodeSequence(fragment: T | null, cloneNode?: boolean): INodeSequence<T>;
  createElement(name: string): T;
  createCustomEvent(eventType: string, options?: unknown): unknown;
  dispatchEvent(evt: unknown): void;
  createTemplate(markup?: string): T;
  createTextNode(text: string): T;
  /**
   * Returns the effective parentNode according to Aurelia's component hierarchy.
   *
   * Used by Aurelia to find the closest parent controller relative to a node.
   *
   * This method supports 3 additional scenarios that `node.parentNode` does not support:
   * - Containerless elements. The parentNode in this case is a comment precending the element under specific conditions, rather than a node wrapping the element.
   * - ShadowDOM. If a `ShadowRoot` is encountered, this method retrieves the associated controller via the metadata api to locate the original host.
   * - Portals. If the provided node was moved to a different location in the DOM by a `portal` attribute, then the original parent of the node will be returned.
   *
   * @param node - The node to get the parent for.
   * @returns Either the closest parent node, the closest `IRenderLocation` (comment node that is the containerless host), original portal host, or `null` if this is either the absolute document root or a disconnected node.
   */
  getEffectiveParentNode(node: T): T | null;
  /**
   * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
   *
   * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
   *
   * @param nodeSequence - The node sequence whose children that, when `getEffectiveParentNode` is called on, return the supplied `parentNode`.
   * @param parentNode - The node to return when `getEffectiveParentNode` is called on any child of the supplied `nodeSequence`.
   */
  setEffectiveParentNode(nodeSequence: INodeSequence, parentNode: T): void;
  /**
   * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
   *
   * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
   *
   * @param childNode - The node that, when `getEffectiveParentNode` is called on, returns the supplied `parentNode`.
   * @param parentNode - The node to return when `getEffectiveParentNode` is called on the supplied `childNode`.
   */
  setEffectiveParentNode(childNode: T, parentNode: T): void;
  insertBefore(nodeToInsert: T, referenceNode: T): void;
  isMarker(node: unknown): node is T;
  isNodeInstance(potentialNode: unknown): potentialNode is T;
  isRenderLocation(node: unknown): node is IRenderLocation<T>;
  makeTarget(node: T): void;
  registerElementResolver(container: IContainer, resolver: IResolver): void;
  remove(node: T): void;
  removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void;
  setAttribute(node: T, name: string, value: unknown): void;
}

const ni = function (...args: unknown[]): unknown {
  throw new Error(`No DOM implementation is provided.`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any; // this function doesn't need typing because it is never directly called

const niDOM: IDOM = {
  addEventListener: ni,
  appendChild: ni,
  cloneNode: ni,
  convertToRenderLocation: ni,
  createDocumentFragment: ni,
  createNodeSequence: ni,
  createElement: ni,
  createCustomEvent: ni,
  dispatchEvent: ni,
  createTemplate: ni,
  createTextNode: ni,
  getEffectiveParentNode: ni,
  setEffectiveParentNode: ni,
  insertBefore: ni,
  isMarker: ni,
  isNodeInstance: ni,
  isRenderLocation: ni,
  makeTarget: ni,
  registerElementResolver: ni,
  remove: ni,
  removeEventListener: ni,
  setAttribute: ni
};

export const DOM: IDOM & {
  readonly isInitialized: boolean;
  readonly scheduler: IScheduler;
  initialize(dom: IDOM): void;
  destroy(): void;
} = {
  ...niDOM,
  scheduler: (void 0)!,
  get isInitialized(): boolean {
    return Reflect.get(this, '$initialized') === true;
  },
  initialize(dom: IDOM): void {
    if (this.isInitialized) {
      throw new Error(`DOM is already initialized.`);
    }
    const descriptors: PropertyDescriptorMap = {};
    const protos: IDOM[] = [dom];
    let proto = Object.getPrototypeOf(dom);
    while (proto && proto !== Object.prototype) {
      protos.unshift(proto);
      proto = Object.getPrototypeOf(proto);
    }
    for (proto of protos) {
      Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto));
    }
    const keys: string[] = [];
    let key: string;
    let descriptor: PropertyDescriptor;
    for (key in descriptors) {
      descriptor = descriptors[key];
      if (descriptor.configurable && descriptor.writable) {
        Reflect.defineProperty(this, key, descriptor);
        keys.push(key);
      }
    }
    Reflect.set(this, '$domKeys', keys);
    Reflect.set(this, '$initialized', true);
  },
  destroy(): void {
    if (!this.isInitialized) {
      throw new Error(`DOM is already destroyed.`);
    }
    const keys = Reflect.get(this, '$domKeys') as string[];
    keys.forEach(key => {
      Reflect.deleteProperty(this, key);
    });
    Object.assign(this, niDOM);
    Reflect.set(this, '$domKeys', PLATFORM.emptyArray);
    Reflect.set(this, '$initialized', false);
  }
};

export interface INodeSequenceFactory<T extends INode = INode> {
  createNodeSequence(): INodeSequence<T>;
}
