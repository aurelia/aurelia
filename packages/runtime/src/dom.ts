import {
  DI,
  IContainer,
  IResolver,
  PLATFORM,
  Reporter,
} from '@aurelia/kernel';
import {
  IController
} from './lifecycle';
import { IScheduler } from './scheduler';

export interface INode extends Object {
  $au?: Record<string, IController<this>>;
}

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
  appendTo(parent: T): void;

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
  createElement(name: string): T;
  createCustomEvent(eventType: string, options?: unknown): unknown;
  dispatchEvent(evt: unknown): void;
  createNodeObserver?(node: T, cb: (...args: unknown[]) => void, init: unknown): unknown;
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
  setAttribute(node: T, name: string, value: unknown): void;
}

const ni = function(...args: unknown[]): unknown {
  throw Reporter.error(1000); // TODO: create error code (not implemented exception)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any; // this function doesn't need typing because it is never directly called

const niDOM: IDOM = {
  addEventListener: ni,
  appendChild: ni,
  cloneNode: ni,
  convertToRenderLocation: ni,
  createDocumentFragment: ni,
  createElement: ni,
  createCustomEvent: ni,
  dispatchEvent: ni,
  createNodeObserver: ni,
  createTemplate: ni,
  createTextNode: ni,
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
      throw Reporter.error(1001); // TODO: create error code (already initialized, check isInitialized property and call destroy() if you want to assign a different dom)
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
      throw Reporter.error(1002); // TODO: create error code (already destroyed)
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

// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: INodeSequence = {
  isMounted: false,
  isLinked: false,
  next: void 0,
  childNodes: PLATFORM.emptyArray,
  firstChild: null!,
  lastChild: null!,
  findTargets(): ArrayLike<INode> { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): void { /* do nothing */ },
  appendTo(parent: INode): void { /* do nothing */ },
  remove(): void { /* do nothing */ },
  addToLinked(): void { /* do nothing */ },
  unlink(): void { /* do nothing */ },
  link(next: INodeSequence | IRenderLocation | undefined): void { /* do nothing */ },
};

export const NodeSequence = {
  empty: emptySequence
};

export interface INodeSequenceFactory<T extends INode = INode> {
  createNodeSequence(): INodeSequence<T>;
}
