import { IResolver, InstanceProvider, emptyArray, type IContainer } from '@aurelia/kernel';
import { IAppRoot } from './app-root';
import { IPlatform } from './platform';
import { findElementControllerFor } from './resources/custom-element';
import { MountTarget } from './templating/controller';
import { createInterface, registerResolver } from './utilities-di';
import { INode } from './dom.node';

export type IEventTarget<T extends EventTarget = EventTarget> = T;
export const IEventTarget = /*@__PURE__*/createInterface<IEventTarget>('IEventTarget', x => x.cachedCallback(handler => {
  if (handler.has(IAppRoot, true)) {
    return handler.get(IAppRoot).host;
  }
  return handler.get(IPlatform).document;
}));

/**
 * An interface describing a marker.
 * Components can use this to anchor where their content should be rendered in place of a host element.
 */
export const IRenderLocation = /*@__PURE__*/createInterface<IRenderLocation>('IRenderLocation');
export type IRenderLocation<T extends ChildNode = ChildNode> = T & {
  $start?: IRenderLocation<T>;
  /** Target index for SSR hydration manifest lookup */
  $targetIndex?: number;
};

/** @internal */
export const ICssClassMapping = /*@__PURE__*/createInterface<Record<string, string>>('ICssClassMapping');
/** @internal */
export const cssMappings: IResolver<Record<string, string>[]> = {
  $isResolver: true,
  resolve(_, requestor) {
    if (requestor.has(ICssClassMapping, false)) {
      return requestor.getAll(ICssClassMapping);
    }
    return emptyArray;
  }
};

/**
 * Represents a DocumentFragment with a memory of what it has.
 * This is known as many names, a live fragment for example.
 *
 * Relevant discussion at https://github.com/whatwg/dom/issues/736
 */
export interface INodeSequence<T extends INode = INode> {
  readonly platform: IPlatform;

  readonly next?: INodeSequence<T>;

  /**
   * The nodes of this sequence.
   */
  readonly childNodes: ArrayLike<T>;

  readonly firstChild: T | null;

  readonly lastChild: T | null;

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

_START_CONST_ENUM();
const enum NodeType {
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
_END_CONST_ENUM();

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
    const controller = findElementControllerFor(node, { optional: true });
    if (controller == null) {
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

  const locationEnd = node.ownerDocument!.createComment('au-end') as IRenderLocation;
  const locationStart = locationEnd.$start = node.ownerDocument!.createComment('au-start') as IRenderLocation;
  const parentNode = node.parentNode;

  if (parentNode !== null) {
    parentNode.replaceChild(locationEnd, node);
    parentNode.insertBefore(locationStart, locationEnd);
  }

  return locationEnd;
}

export function isRenderLocation(node: INode | INodeSequence): node is IRenderLocation {
  return (node as Comment).textContent === 'au-end';
}

/**
 * Find the matching au-end comment for an au-start marker.
 * Handles nested au-start/au-end pairs correctly.
 *
 * @param startMarker - The au-start comment to find the match for
 * @returns The matching au-end comment, or null if not found
 */
export function findMatchingEndMarker(startMarker: Node): Comment | null {
  let depth = 1;
  let current: Node | null = startMarker.nextSibling;
  while (current !== null) {
    if (current.nodeType === 8 /* Comment */) {
      const text = (current as Comment).textContent;
      if (text === 'au-start') {
        depth++;
      } else if (text === 'au-end') {
        if (--depth === 0) {
          return current as Comment;
        }
      }
    }
    current = current.nextSibling;
  }
  return null;
}

/**
 * Partition sibling nodes between au-start and au-end markers for SSR hydration.
 *
 * Template controllers render their views as sibling nodes between markers.
 * This function partitions those nodes according to the manifest's nodeCount
 * for each view, allowing TCs to adopt the correct DOM nodes for each view.
 *
 * @param location - The render location (au-end marker with $start reference)
 * @param nodeCounts - Array of node counts, one per view to create
 * @returns Array of node arrays, one partition per view
 */
export function partitionSiblingNodes(
  location: IRenderLocation,
  nodeCounts: number[]
): Node[][] {
  const endMarker = location as Comment;
  const startMarker = (location as IRenderLocation<Comment>).$start as Comment | undefined;

  if (startMarker == null) {
    return [];
  }

  const partitions: Node[][] = [];
  let current: Node | null = startMarker.nextSibling;

  for (let i = 0, ii = nodeCounts.length; ii > i; ++i) {
    const count = nodeCounts[i];
    const nodes: Node[] = [];

    for (let n = 0; n < count && current != null && current !== endMarker; ++n) {
      nodes.push(current);
      current = current.nextSibling;
    }

    partitions.push(nodes);
  }

  return partitions;
}

export class FragmentNodeSequence implements INodeSequence {
  /** @internal */
  private _firstChild: Node | null;
  public get firstChild(): Node | null {
    return this._firstChild;
  }

  /** @internal */
  private _lastChild: Node | null;
  public get lastChild(): Node | null {
    return this._lastChild;
  }

  public childNodes: Node[];

  public next?: INodeSequence = void 0;

  /** @internal */
  private _isMounted: boolean = false;

  /** @internal */
  private _isLinked: boolean = false;

  /** @internal */
  private ref?: Node | null = null;

  /** @internal */
  private t: ArrayLike<Node>;

  /** @internal */
  private f: DocumentFragment;

  public constructor(
    public readonly platform: IPlatform,
    fragment: DocumentFragment,
    /**
     * When true, preserves `au-hid` attributes and `<!--au:N-->` markers in the DOM.
     * Used during SSR rendering to keep markers for client hydration.
     * @internal
     */
    preserveMarkers?: boolean,
  ) {
    this.f = fragment;
    this.t = this._collectTargets(fragment, preserveMarkers);

    const childNodeList = fragment.childNodes;
    const ii = childNodeList.length;
    const childNodes = this.childNodes = Array(ii) as Node[];
    for (let i = 0; ii > i; ++i) {
      childNodes[i] = childNodeList[i];
    }

    this._firstChild = fragment.firstChild;
    this._lastChild = fragment.lastChild;
  }

  /**
   * Adopt existing DOM children for SSR hydration.
   *
   * Unlike regular construction which clones from a template,
   * this wraps existing DOM nodes that are already in place.
   * The nodes are NOT moved - they stay where they are in the DOM.
   *
   * @param platform - The platform instance
   * @param host - The element whose children should be adopted
   * @returns A FragmentNodeSequence wrapping the existing children
   */
  public static adoptChildren(platform: IPlatform, host: Element): FragmentNodeSequence {
    // Create an empty fragment (won't be used for DOM operations)
    const fragment = platform.document.createDocumentFragment();
    const seq = new FragmentNodeSequence(platform, fragment);

    // Capture existing children (they stay in the DOM)
    const children = host.childNodes;
    const childArray: Node[] = Array(children.length);
    for (let i = 0, ii = children.length; ii > i; ++i) {
      childArray[i] = children[i];
    }

    seq.childNodes = childArray;
    seq._firstChild = childArray[0] ?? null;
    seq._lastChild = childArray[childArray.length - 1] ?? null;

    // Mark as already mounted - nodes are already in the DOM
    seq._isMounted = true;

    // Collect targets from the live DOM (preserving markers for nested components)
    seq.t = seq._collectTargetsFromHost(host);

    return seq;
  }

  /**
   * Adopt a range of sibling nodes for SSR hydration of template controller views.
   *
   * Template controllers (repeat, if, etc.) render their views as sibling nodes
   * between <!--au-start--> and <!--au-end--> markers. During hydration, we need
   * to "adopt" these existing nodes rather than cloning from a template.
   *
   * @param platform - The platform instance
   * @param nodes - Array of sibling nodes to adopt (already collected from DOM)
   * @returns A FragmentNodeSequence wrapping the existing siblings
   */
  public static adoptSiblings(platform: IPlatform, nodes: Node[]): FragmentNodeSequence {
    // Create an empty fragment (won't be used for DOM operations)
    const fragment = platform.document.createDocumentFragment();
    const seq = new FragmentNodeSequence(platform, fragment);

    seq.childNodes = nodes;
    seq._firstChild = nodes[0] ?? null;
    seq._lastChild = nodes[nodes.length - 1] ?? null;

    // Mark as already mounted - nodes are already in the DOM
    seq._isMounted = true;

    // Collect targets from these sibling nodes
    seq.t = seq._collectTargetsFromSiblings(nodes);

    return seq;
  }

  /**
   * Collect targets from a flat array of sibling nodes.
   *
   * Used for TC view hydration where nodes are siblings between markers,
   * not children of a single host element.
   *
   * @internal
   */
  private _collectTargetsFromSiblings(nodes: Node[]): Node[] {
    const targets: Node[] = [];
    const markerComments: Comment[] = [];

    const collectFromNode = (node: Node, isRoot: boolean): void => {
      if (node.nodeType === 1 /* Element */) {
        const el = node as Element;
        const hasAuHid = el.hasAttribute('au-hid');

        // Collect au-hid element target
        if (hasAuHid) {
          const targetId = parseInt(el.getAttribute('au-hid')!, 10);
          targets[targetId] = el;
        }

        // Custom elements (tag names with dashes) have their own templates.
        // Their children belong to their own controller, not this view.
        // Never recurse into custom elements.
        const isCustomElement = el.tagName.includes('-');
        if (isCustomElement) {
          // Don't recurse - custom element's children are its own template
          return;
        }

        // For ROOT nodes (the ones directly passed to adoptSiblings), ALWAYS recurse
        // into their children - those children are part of this view.
        // For NESTED elements with au-hid that are NOT custom elements, they're
        // regular HTML elements with bindings - recurse to find nested targets.
        const shouldRecurse = isRoot || !hasAuHid;
        if (shouldRecurse) {
          const children = el.childNodes;
          for (let i = 0, ii = children.length; ii > i; ++i) {
            collectFromNode(children[i], false);
          }
        }

      } else if (node.nodeType === 8 /* Comment */) {
        const text = (node as Comment).nodeValue;
        if (text?.startsWith('au:')) {
          markerComments.push(node as Comment);
        }
      }
    };

    // Process each sibling node - root level nodes should always recurse into children
    for (let i = 0, ii = nodes.length; ii > i; ++i) {
      collectFromNode(nodes[i], true);
    }

    // Process marker comments - handle both text interpolation and TC targets
    for (let i = 0, ii = markerComments.length; ii > i; ++i) {
      const comment = markerComments[i];
      const text = comment.nodeValue!;
      const targetId = parseInt(text.slice(3), 10); // Skip 'au:'

      // Check what follows this marker
      const nextSibling = comment.nextSibling;

      // Check if this is a TC target: <!--au:N--><!--au-start-->...<!--au-end-->
      if (nextSibling !== null &&
          nextSibling.nodeType === 8 /* Comment */ &&
          (nextSibling as Comment).nodeValue === 'au-start') {
        // This is a TC target - find the matching au-end and set up render location
        const startMarker = nextSibling as Comment;
        const endMarker = findMatchingEndMarker(startMarker);
        if (endMarker !== null) {
          // Set up the render location - au-end needs $start reference
          (endMarker as IRenderLocation).$start = startMarker as IRenderLocation;
          targets[targetId] = endMarker;
        }
      } else {
        // Text interpolation target - find or create text node
        let target: Node | null = nextSibling;
        if (target === null || target.nodeType !== 3 /* Text */) {
          target = this.platform.document.createTextNode('');
          comment.parentNode?.insertBefore(target, comment.nextSibling);
        }
        targets[targetId] = target!;
      }
    }

    return targets;
  }

  /**
   * Collect instruction targets from a DOM tree using the unified marker system.
   *
   * Unified SSR-compatible marker system:
   * 1. Element targets: [au-hid="N"] attribute - value IS the target index
   * 2. Non-element targets: <!--au:N--> comment - N IS the target index
   *
   * Both marker types encode their index directly, eliminating the need
   * for runtime DOM transformation.
   *
   * @param root - DocumentFragment from template cloning
   * @returns Array of target nodes indexed by their marker values
   *
   * @internal
   */
  private _collectTargets(root: DocumentFragment, preserveMarkers?: boolean): Node[] {
    const targets: Node[] = [];
    const markerComments: Comment[] = [];

    // Tree walk to collect targets
    const collect = (node: Node): void => {
      if (node.nodeType === 1 /* Element */) {
        const el = node as Element;

        // Collect au-hid element target
        if (el.hasAttribute('au-hid')) {
          const targetId = parseInt(el.getAttribute('au-hid')!, 10);
          targets[targetId] = el;
          if (!preserveMarkers) {
            el.removeAttribute('au-hid');
          }
        }

        // Recurse into children
        const children = el.childNodes;
        for (let i = 0, ii = children.length; ii > i; ++i) {
          collect(children[i]);
        }

      } else if (node.nodeType === 8 /* Comment */) {
        const text = (node as Comment).nodeValue;
        if (text?.startsWith('au:')) {
          markerComments.push(node as Comment);
        }
      }
    };

    // Start collection from root's children
    const children = root.childNodes;
    for (let i = 0, ii = children.length; ii > i; ++i) {
      collect(children[i]);
    }

    // Process collected comment markers: <!--au:N--> where N IS the target index
    let marker: Comment;
    let target: Node | IRenderLocation;
    let targetId: number;
    for (let i = 0, ii = markerComments.length; ii > i; ++i) {
      marker = markerComments[i];
      // Parse index from "au:N" format
      targetId = parseInt(marker.nodeValue!.slice(3), 10);
      target = marker.nextSibling!;

      // Only remove markers when not in SSR preservation mode
      if (!preserveMarkers) {
        marker.remove();
      }

      // If target is au-start, find matching au-end (handling nested pairs)
      if (target.nodeType === 8 && (target as Comment).textContent === 'au-start') {
        const startMarker = target as IRenderLocation;
        const endMarker = findMatchingEndMarker(target);
        if (endMarker !== null) {
          target = endMarker as IRenderLocation;
          (target as IRenderLocation).$start = startMarker;
          // Store target index for SSR hydration manifest lookup
          (target as IRenderLocation).$targetIndex = targetId;
        }
      }

      targets[targetId] = target;
    }

    return targets;
  }

  /**
   * Collect targets from existing DOM for SSR adoption.
   *
   * Unlike _collectTargets which removes markers (for cloned templates),
   * this preserves markers because nested components still need them.
   *
   * @param host - The element whose children contain the targets
   * @returns Array of target nodes indexed by their marker values
   *
   * @internal
   */
  private _collectTargetsFromHost(host: Element): Node[] {
    const targets: Node[] = [];
    const markerComments: Comment[] = [];

    // Collect targets from siblings, skipping TC content (au-start to au-end regions)
    const collectSiblings = (nodes: NodeListOf<ChildNode>): void => {
      for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const node = nodes[i];

        // Skip TC content regions (between au-start and au-end)
        if (node.nodeType === 8 /* Comment */ && (node as Comment).nodeValue === 'au-start') {
          const endMarker = findMatchingEndMarker(node);
          if (endMarker !== null) {
            // Skip ahead to the au-end marker
            while (i < ii && nodes[i] !== endMarker) {
              ++i;
            }
          }
          continue;
        }

        if (node.nodeType === 1 /* Element */) {
          const el = node as Element;

          // Collect au-hid element target (but DON'T remove the attribute)
          if (el.hasAttribute('au-hid')) {
            const targetId = parseInt(el.getAttribute('au-hid')!, 10);
            targets[targetId] = el;
            // Keep marker for nested component hydration
          }

          // Recurse into children (also skipping TC content)
          collectSiblings(el.childNodes);

        } else if (node.nodeType === 8 /* Comment */) {
          const text = (node as Comment).nodeValue;
          if (text?.startsWith('au:')) {
            markerComments.push(node as Comment);
          }
        }
      }
    };

    // Start collection from host's children
    collectSiblings(host.childNodes);

    // Process collected comment markers: <!--au:N--> where N IS the target index
    let marker: Comment;
    let target: Node | IRenderLocation;
    let targetId: number;
    for (let i = 0, ii = markerComments.length; ii > i; ++i) {
      marker = markerComments[i];
      // Parse index from "au:N" format
      targetId = parseInt(marker.nodeValue!.slice(3), 10);
      target = marker.nextSibling!;

      // DON'T remove marker - nested components need it

      // If target is au-start, find matching au-end (handling nested pairs)
      if (target.nodeType === 8 && (target as Comment).textContent === 'au-start') {
        const startMarker = target as IRenderLocation;
        const endMarker = findMatchingEndMarker(target);
        if (endMarker !== null) {
          target = endMarker as IRenderLocation;
          (target as IRenderLocation).$start = startMarker;
          // Store target index for SSR hydration manifest lookup
          (target as IRenderLocation).$targetIndex = targetId;
        }
      }

      targets[targetId] = target;
    }

    return targets;
  }

  public findTargets(): ArrayLike<Node> {
    return this.t;
  }

  public insertBefore(refNode: IRenderLocation & Comment): void {
    if (this._isLinked && !!this.ref) {
      this.addToLinked();
    } else {
      const parent = refNode.parentNode!;
      if (this._isMounted) {
        let current = this._firstChild;
        let next: Node;
        const end = this._lastChild;

        while (current != null) {
          next = current.nextSibling!;
          parent.insertBefore(current, refNode);

          if (current === end) {
            break;
          }

          current = next;
        }
      } else {
        this._isMounted = true;
        refNode.parentNode!.insertBefore(this.f, refNode);
      }
    }
  }

  public appendTo(parent: Node, enhance: boolean = false): void {
    if (this._isMounted) {
      let current = this._firstChild;
      let next: Node;
      const end = this._lastChild;

      while (current != null) {
        next = current.nextSibling!;
        parent.appendChild(current);

        if (current === end) {
          break;
        }

        current = next;
      }
    } else {
      this._isMounted = true;
      if (!enhance) {
        parent.appendChild(this.f);
      }
    }
  }

  public remove(): void {
    if (this._isMounted) {
      this._isMounted = false;

      const fragment = this.f;
      const end = this._lastChild;
      let next: Node;

      let current = this._firstChild;
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
    const refNode = this.ref!;
    const parent = refNode.parentNode!;
    if (this._isMounted) {
      let current = this._firstChild;
      let next: Node;
      const end = this._lastChild;

      while (current != null) {
        next = current.nextSibling!;
        parent.insertBefore(current, refNode);

        if (current === end) {
          break;
        }

        current = next;
      }
    } else {
      this._isMounted = true;
      parent.insertBefore(this.f, refNode);
    }
  }

  public unlink(): void {
    this._isLinked = false;
    this.next = void 0;
    this.ref = void 0;
  }

  public link(next: INodeSequence | IRenderLocation & Comment | undefined): void {
    this._isLinked = true;
    if (isRenderLocation(next!)) {
      this.ref = next;
    } else {
      this.next = next;
      this._obtainRefNode();
    }
  }

  /** @internal */
  private _obtainRefNode(): void {
    if (this.next !== void 0) {
      this.ref = this.next.firstChild;
    } else {
      this.ref = void 0;
    }
  }
}

export const IWindow = /*@__PURE__*/createInterface<IWindow>('IWindow', x => x.callback(handler => handler.get(IPlatform).window));
export interface IWindow extends Window { }

export const ILocation = /*@__PURE__*/createInterface<ILocation>('ILocation', x => x.callback(handler => handler.get(IWindow).location));
export interface ILocation extends Location { }

export const IHistory = /*@__PURE__*/createInterface<IHistory>('IHistory', x => x.callback(handler => handler.get(IWindow).history));
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

/**
 * An utility to register a host node with the container with all the commonly used keys.
 */
export const registerHostNode = (container: IContainer, host: INode | null, platform = container.get(IPlatform)) => {
  registerResolver(
    container,
    platform.HTMLElement,
    registerResolver(
      container,
      platform.Element,
      registerResolver(container, INode, new InstanceProvider('ElementResolver', host))
    )
  );
  return container;
};
