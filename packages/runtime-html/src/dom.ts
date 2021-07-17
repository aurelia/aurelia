import { DI, Writable } from '@aurelia/kernel';
import { IAppRoot } from './app-root.js';
import { IPlatform } from './platform.js';
import { CustomElement } from './resources/custom-element.js';
import { MountTarget } from './templating/controller.js';
import type { IHydratedController } from './templating/controller.js';

export class Refs {
  [key: string]: IHydratedController | undefined;
}

export function getRef(node: INode, name: string): IHydratedController | null {
  return node.$au?.[name] ?? null;
}

export function setRef(node: INode, name: string, controller: IHydratedController): void {
  ((node as Writable<INode>).$au ??= new Refs())[name] = controller;
}

export type INode<T extends Node = Node> = T & {
  readonly $au?: Refs;
};
export const INode = DI.createInterface<INode>('INode');

export type IEventTarget<T extends EventTarget = EventTarget> = T;
export const IEventTarget = DI.createInterface<IEventTarget>('IEventTarget', x => x.cachedCallback(handler => {
  if (handler.has(IAppRoot, true)) {
    return handler.get(IAppRoot).host;
  }
  return handler.get(IPlatform).document;
}));

export const IRenderLocation = DI.createInterface<IRenderLocation>('IRenderLocation');
export type IRenderLocation<T extends ChildNode = ChildNode> = T & {
  $start?: IRenderLocation<T>;
};

/**
 * Represents a DocumentFragment
 */
export interface INodeSequence<T extends INode = INode> {
  readonly platform: IPlatform;
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
  insertBefore(refNode: T | IRenderLocation): void;

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

  link(next: INodeSequence<T> | IRenderLocation | undefined): void;
}

export const enum NodeType {
  Element = 1,
  Attr = 2,
  Text = 3,
  CDATASection = 4,
  EntityReference = 5,
  Entity = 6,
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12
}

const effectiveParentNodeOverrides = new WeakMap<Node, Node>();

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
export function getEffectiveParentNode(node: Node): Node | null {
  // TODO: this method needs more tests!
  // First look for any overrides
  if (effectiveParentNodeOverrides.has(node)) {
    return effectiveParentNodeOverrides.get(node)!;
  }

  // Then try to get the nearest au-start render location, which would be the containerless parent,
  // again looking for any overrides along the way.
  // otherwise return the normal parent node
  let containerlessOffset = 0;
  let next = node.nextSibling;
  while (next !== null) {
    if (next.nodeType === NodeType.Comment) {
      switch (next.textContent) {
        case 'au-start':
          // If we see an au-start before we see au-end, it will precede the host of a sibling containerless element rather than a parent.
          // So we use the offset to ignore the next au-end
          ++containerlessOffset;
          break;
        case 'au-end':
          if (containerlessOffset-- === 0) {
            return next;
          }
      }
    }
    next = next.nextSibling;
  }

  if (node.parentNode === null && node.nodeType === NodeType.DocumentFragment) {
    // Could be a shadow root; see if there's a controller and if so, get the original host via the projector
    const controller = CustomElement.for(node);
    if (controller === void 0) {
      // Not a shadow root (or at least, not one created by Aurelia)
      // Nothing more we can try, just return null
      return null;
    }
    if (controller.mountTarget === MountTarget.shadowRoot) {
      return getEffectiveParentNode(controller.host);
    }
  }

  return node.parentNode;
}

/**
 * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
 *
 * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
 *
 * @param nodeSequence - The node sequence whose children that, when `getEffectiveParentNode` is called on, return the supplied `parentNode`.
 * @param parentNode - The node to return when `getEffectiveParentNode` is called on any child of the supplied `nodeSequence`.
 */
export function setEffectiveParentNode(nodeSequence: INodeSequence, parentNode: Node): void;
/**
 * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
 *
 * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
 *
 * @param childNode - The node that, when `getEffectiveParentNode` is called on, returns the supplied `parentNode`.
 * @param parentNode - The node to return when `getEffectiveParentNode` is called on the supplied `childNode`.
 */
export function setEffectiveParentNode(childNode: Node, parentNode: Node): void;
export function setEffectiveParentNode(childNodeOrNodeSequence: Node | INodeSequence, parentNode: Node): void {
  if ((childNodeOrNodeSequence as INodeSequence).platform !== void 0 && !(childNodeOrNodeSequence instanceof (childNodeOrNodeSequence as INodeSequence).platform.Node)) {
    const nodes = childNodeOrNodeSequence.childNodes;
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
      effectiveParentNodeOverrides.set(nodes[i] as Node, parentNode);
    }
  } else {
    effectiveParentNodeOverrides.set(childNodeOrNodeSequence as Node, parentNode);
  }
}

export function convertToRenderLocation(node: Node): IRenderLocation {
  if (isRenderLocation(node)) {
    return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
  }

  const locationEnd = node.ownerDocument!.createComment('au-end');
  const locationStart = node.ownerDocument!.createComment('au-start');

  if (node.parentNode !== null) {
    node.parentNode.replaceChild(locationEnd, node);
    locationEnd.parentNode!.insertBefore(locationStart, locationEnd);
  }

  (locationEnd as IRenderLocation).$start = locationStart as IRenderLocation;

  return locationEnd as IRenderLocation;
}

export function isRenderLocation(node: INode | INodeSequence): node is IRenderLocation {
  return (node as Comment).textContent === 'au-end';
}

export class FragmentNodeSequence implements INodeSequence {
  public isMounted: boolean = false;
  public isLinked: boolean = false;

  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  public next?: INodeSequence = void 0;

  private refNode?: Node = void 0;

  private readonly targets: ArrayLike<Node>;

  public constructor(
    public readonly platform: IPlatform,
    private readonly fragment: DocumentFragment,
  ) {
    const targetNodeList = fragment.querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    let target: Element;
    // eslint-disable-next-line
    let targets = this.targets = Array(ii);

    while (ii > i) {
      // eagerly convert all markers to RenderLocations (otherwise the renderer
      // will do it anyway) and store them in the target list (since the comments
      // can't be queried)
      target = targetNodeList[i];

      if (target.nodeName === 'AU-M') {
        // note the renderer will still call this method, but it will just return the
        // location if it sees it's already a location
        targets[i] = convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }

    const childNodeList = fragment.childNodes;
    const childNodes = this.childNodes = Array(ii = childNodeList.length);
    i = 0;
    while (ii > i) {
      childNodes[i] = childNodeList[i] as Writable<Node>;
      ++i;
    }

    this.firstChild = fragment.firstChild!;
    this.lastChild = fragment.lastChild!;
  }

  public findTargets(): ArrayLike<Node> {
    return this.targets;
  }

  public insertBefore(refNode: IRenderLocation & Comment): void {
    if (this.isLinked && !!this.refNode) {
      this.addToLinked();
    } else {
      const parent = refNode.parentNode!;
      if (this.isMounted) {
        let current = this.firstChild;
        let next: Node;
        const end = this.lastChild;

        while (current != null) {
          next = current.nextSibling!;
          parent.insertBefore(current, refNode);

          if (current === end) {
            break;
          }

          current = next;
        }
      } else {
        this.isMounted = true;
        refNode.parentNode!.insertBefore(this.fragment, refNode);
      }
    }
  }

  public appendTo(parent: Node, enhance: boolean = false): void {
    if (this.isMounted) {
      let current = this.firstChild;
      let next: Node;
      const end = this.lastChild;

      while (current != null) {
        next = current.nextSibling!;
        parent.appendChild(current);

        if (current === end) {
          break;
        }

        current = next;
      }
    } else {
      this.isMounted = true;
      if (!enhance) {
        parent.appendChild(this.fragment);
      }
    }
  }

  public remove(): void {
    if (this.isMounted) {
      this.isMounted = false;

      const fragment = this.fragment;
      const end = this.lastChild;
      let next: Node;

      let current = this.firstChild;
      while (current !== null) {
        next = current.nextSibling!;
        fragment.appendChild(current);

        if (current === end) {
          break;
        }

        current = next;
      }
    }
  }

  public addToLinked(): void {
    const refNode = this.refNode!;
    const parent = refNode.parentNode!;
    if (this.isMounted) {
      let current = this.firstChild;
      let next: Node;
      const end = this.lastChild;

      while (current != null) {
        next = current.nextSibling!;
        parent.insertBefore(current, refNode);

        if (current === end) {
          break;
        }

        current = next;
      }
    } else {
      this.isMounted = true;
      parent.insertBefore(this.fragment, refNode);
    }
  }

  public unlink(): void {
    this.isLinked = false;
    this.next = void 0;
    this.refNode = void 0;
  }

  public link(next: INodeSequence | IRenderLocation & Comment | undefined): void {
    this.isLinked = true;
    if (isRenderLocation(next!)) {
      this.refNode = next;
    } else {
      this.next = next;
      this.obtainRefNode();
    }
  }

  private obtainRefNode(): void {
    if (this.next !== void 0) {
      this.refNode = this.next.firstChild;
    } else {
      this.refNode = void 0;
    }
  }
}

export const IWindow = DI.createInterface<IWindow>('IWindow', x => x.callback(handler => handler.get(IPlatform).window));
export interface IWindow extends Window { }

export const ILocation = DI.createInterface<ILocation>('ILocation', x => x.callback(handler => handler.get(IWindow).location));
export interface ILocation extends Location { }

export const IHistory = DI.createInterface<IHistory>('IHistory', x => x.callback(handler => handler.get(IWindow).history));
// NOTE: `IHistory` is documented
/**
 * https://developer.mozilla.org/en-US/docs/Web/API/History
 *
 * A convenience interface that (unless explicitly overridden in DI) resolves directly to the native browser `history` object.
 *
 * Allows manipulation of the browser session history, that is the pages visited in the tab or frame that the current page is loaded in.
 */
export interface IHistory extends History {
  /**
   * Returns an integer representing the number of elements in the session history, including the currently loaded page.
   * For example, for a page loaded in a new tab this property returns 1.
   */
  readonly length: number;
  /**
   * Allows web applications to explicitly set default scroll restoration behavior on history navigation.
   *
   * - `auto` The location on the page to which the user has scrolled will be restored.
   * - `manual` The location on the page is not restored. The user will have to scroll to the location manually.
   */
  scrollRestoration: ScrollRestoration;
  /**
   * Returns a value representing the state at the top of the history stack.
   * This is a way to look at the state without having to wait for a popstate event
   */
  readonly state: unknown;
  /**
   * Causes the browser to move back one page in the session history.
   * It has the same effect as calling history.go(-1).
   * If there is no previous page, this method call does nothing.
   *
   * This method is asynchronous.
   * Add a listener for the `popstate` event in order to determine when the navigation has completed.
   */
  back(): void;
  /**
   * Causes the browser to move forward one page in the session history.
   * It has the same effect as calling `history.go(1)`.
   *
   * This method is asynchronous.
   * Add a listener for the `popstate` event in order to determine when the navigation has completed.
   */
  forward(): void;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/History/go
   *
   * Loads a specific page from the session history.
   * You can use it to move forwards and backwards through the history depending on the value of a parameter.
   *
   * This method is asynchronous.
   * Add a listener for the `popstate` event in order to determine when the navigation has completed.
   *
   * @param delta - The position in the history to which you want to move, relative to the current page.
   * A negative value moves backwards, a positive value moves forwards.
   * So, for example, `history.go(2)` moves forward two pages and `history.go(-2)` moves back two pages.
   * If no value is passed or if `delta` equals 0, it has the same result as calling `location.reload()`.
   */
  go(delta?: number): void;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
   *
   * Adds a state to the browser's session history stack.
   *
   * @param state - An object which is associated with the new history entry created by `pushState`.
   * Whenever the user navigates to the new state, a `popstate` event is fired, and the state property of the event contains a copy of the history entry's state object.
   * The state object can be anything that can be serialized.
   * @param title - Most browsers currently ignores this parameter, although they may use it in the future.
   * Passing the empty string here should be safe against future changes to the method.
   * Alternatively, you could pass a short title for the state.
   * @param url - The new history entry's URL is given by this parameter.
   * Note that the browser won't attempt to load this URL after a call to pushState(), but it might attempt to load the URL later, for instance after the user restarts the browser.
   * The new URL does not need to be absolute; if it's relative, it's resolved relative to the current URL.
   * The new URL must be of the same origin as the current URL; otherwise, pushState() will throw an exception.
   * If this parameter isn't specified, it's set to the document's current URL.
   */
  pushState(state: {} | null, title: string, url?: string | null): void;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
   *
   * Modifies the current history entry, replacing it with the stateObj, title, and URL passed in the method parameters.
   *
   * This method is particularly useful when you want to update the state object or URL of the current history entry in response to some user action.
   *
   * @param state - An object which is associated with the history entry passed to the `replaceState` method.
   * @param title - Most browsers currently ignores this parameter, although they may use it in the future.
   * Passing the empty string here should be safe against future changes to the method.
   * Alternatively, you could pass a short title for the state.
   * @param url - The URL of the history entry.
   * The new URL must be of the same origin as the current URL; otherwise `replaceState` throws an exception.
   */
  replaceState(state: {} | null, title: string, url?: string | null): void;
}
