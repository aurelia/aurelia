import {
  IContainer,
  IResolver,
  PLATFORM,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import {
  DOM,
  IDOM,
  INode,
  INodeSequence,
  IRenderLocation,
  CustomElement
} from '@aurelia/runtime';
import { ShadowDOMProjector } from './projectors';

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
 * IDOM implementation for Html.
 */
export class HTMLDOM implements IDOM {
  public readonly Node: typeof Node;
  public readonly Element: typeof Element;
  public readonly HTMLElement: typeof HTMLElement;
  public readonly CustomEvent: typeof CustomEvent;
  public readonly CSSStyleSheet: typeof CSSStyleSheet;
  public readonly ShadowRoot: typeof ShadowRoot;

  private readonly emptyNodes: FragmentNodeSequence;

  public constructor(
    public readonly window: Window,
    public readonly document: Document,
    TNode: typeof Node,
    TElement: typeof Element,
    THTMLElement: typeof HTMLElement,
    TCustomEvent: typeof CustomEvent,
    TCSSStyleSheet: typeof CSSStyleSheet,
    TShadowRoot: typeof ShadowRoot
  ) {
    this.Node = TNode;
    this.Element = TElement;
    this.HTMLElement = THTMLElement;
    this.CustomEvent = TCustomEvent;
    this.CSSStyleSheet = TCSSStyleSheet;
    this.ShadowRoot = TShadowRoot;
    if (DOM.isInitialized) {
      Reporter.write(1001); // TODO: create reporters code // DOM already initialized (just info)
      DOM.destroy();
    }
    DOM.initialize(this);

    this.emptyNodes = new FragmentNodeSequence(this, document.createDocumentFragment());
  }

  public static register(container: IContainer): IResolver<IDOM> {
    return Registration.aliasTo(IDOM, this).register(container);
  }

  public addEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | AddEventListenerOptions): void {
    (publisher || this.document).addEventListener(eventName, subscriber, options);
  }

  public appendChild(parent: Node, child: Node): void {
    parent.appendChild(child);
  }

  public cloneNode<T>(node: T, deep?: boolean): T {
    return (node as unknown as Node).cloneNode(deep !== false) as unknown as T;
  }

  public convertToRenderLocation(node: Node): IRenderLocation {
    if (this.isRenderLocation(node)) {
      return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
    }

    if (node.parentNode == null) {
      throw Reporter.error(52);
    }

    const locationEnd = this.document.createComment('au-end');
    const locationStart = this.document.createComment('au-start');

    node.parentNode.replaceChild(locationEnd, node);

    locationEnd.parentNode!.insertBefore(locationStart, locationEnd);

    (locationEnd as IRenderLocation).$start = locationStart as IRenderLocation;
    (locationStart as IRenderLocation).$nodes = null!;

    return locationEnd as IRenderLocation;
  }

  public createDocumentFragment(markupOrNode?: string | Node): DocumentFragment {
    if (markupOrNode == null) {
      return this.document.createDocumentFragment();
    }

    if (this.isNodeInstance(markupOrNode)) {
      if ((markupOrNode as HTMLTemplateElement).content !== undefined) {
        return (markupOrNode as HTMLTemplateElement).content;
      }

      const fragment = this.document.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }

    return this.createTemplate(markupOrNode).content;
  }

  public createNodeSequence(fragment: DocumentFragment | null): FragmentNodeSequence {
    if (fragment === null) {
      return this.emptyNodes;
    }
    return new FragmentNodeSequence(this, fragment.cloneNode(true) as DocumentFragment);
  }

  public createElement(name: string): HTMLElement {
    return this.document.createElement(name);
  }

  public fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return this.window.fetch(input, init);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createCustomEvent<T = any>(eventType: string, options?: CustomEventInit<T>): CustomEvent<T> { // this is how the DOM is typed
    return new this.CustomEvent(eventType, options);
  }

  public dispatchEvent(evt: Event): void {
    this.document.dispatchEvent(evt);
  }

  public createNodeObserver(node: Node, cb: MutationCallback, init: MutationObserverInit): MutationObserver {
    if (typeof MutationObserver === 'undefined') {
      // TODO: find a proper response for this scenario
      return {
        disconnect(): void { /* empty */ },
        observe(): void { /* empty */ },
        takeRecords(): MutationRecord[] { return PLATFORM.emptyArray as typeof PLATFORM.emptyArray & MutationRecord[]; }
      };
    }

    const observer = new MutationObserver(cb);
    observer.observe(node, init);
    return observer;
  }

  public createTemplate(markup?: unknown): HTMLTemplateElement {
    if (markup == null) {
      return this.document.createElement('template');
    }

    const template = this.document.createElement('template');
    template.innerHTML = (markup as string | object).toString();

    return template;
  }
  public createTextNode(text: string): Text {
    return this.document.createTextNode(text);
  }

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
  public getEffectiveParentNode(node: Node): Node | null {
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
      const projector = controller.projector!;
      if (projector instanceof ShadowDOMProjector) {
        // Now we can use the original host to traverse further up
        return this.getEffectiveParentNode(projector.host);
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
  public setEffectiveParentNode(nodeSequence: INodeSequence, parentNode: Node): void;
  /**
   * Set the effective parentNode, overriding the DOM-based structure that `getEffectiveParentNode` otherwise defaults to.
   *
   * Used by Aurelia's `portal` template controller to retain the linkage between the portaled nodes (after they are moved to the portal target) and the original `portal` host.
   *
   * @param childNode - The node that, when `getEffectiveParentNode` is called on, returns the supplied `parentNode`.
   * @param parentNode - The node to return when `getEffectiveParentNode` is called on the supplied `childNode`.
   */
  public setEffectiveParentNode(childNode: Node, parentNode: Node): void;
  public setEffectiveParentNode(childNodeOrNodeSequence: Node | INodeSequence, parentNode: Node): void {
    if (this.isNodeInstance(childNodeOrNodeSequence)) {
      effectiveParentNodeOverrides.set(childNodeOrNodeSequence, parentNode);
    } else {
      const nodes = childNodeOrNodeSequence.childNodes;
      for (let i = 0, ii = nodes.length; i < ii; ++i) {
        effectiveParentNodeOverrides.set(nodes[i] as Node, parentNode);
      }
    }
  }

  public insertBefore(nodeToInsert: Node, referenceNode: Node): void {
    referenceNode.parentNode!.insertBefore(nodeToInsert, referenceNode);
  }

  public isMarker(node: unknown): node is HTMLElement {
    return (node as AuMarker).nodeName === 'AU-M';
  }

  public isNodeInstance(potentialNode: unknown): potentialNode is Node {
    return potentialNode != null && (potentialNode as Node).nodeType > 0;
  }

  public isRenderLocation(node: unknown): node is IRenderLocation {
    return (node as Comment).textContent === 'au-end';
  }

  public makeTarget(node: unknown): void {
    (node as Element).className = 'au';
  }

  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(this.Node, resolver);
    container.registerResolver(this.Element, resolver);
    container.registerResolver(this.HTMLElement, resolver);
  }

  public remove(node: Node): void {
    if ((node as ChildNode).remove) {
      (node as ChildNode).remove();
    } else {
      node.parentNode!.removeChild(node);
    }
  }

  public removeEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | EventListenerOptions): void {
    (publisher || this.document).removeEventListener(eventName, subscriber, options);
  }

  public setAttribute(node: Element, name: string, value: unknown): void {
    node.setAttribute(name, value as string);
  }
}

const $DOM = DOM as unknown as HTMLDOM;
export { $DOM as DOM };

/* eslint-enable @typescript-eslint/no-explicit-any */

// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/**
 * This is the most common form of INodeSequence.
 *
 * @internal
 */
export class FragmentNodeSequence implements INodeSequence {
  public isMounted: boolean = false;
  public isLinked: boolean = false;

  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  public next?: INodeSequence<Node> = void 0;

  private refNode?: Node = void 0;

  private readonly targets: ArrayLike<Node>;

  public constructor(
    public readonly dom: IDOM,
    private readonly fragment: DocumentFragment,
  ) {
    const targetNodeList = fragment.querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    const targets = this.targets = Array(ii);

    while (i < ii) {
      // eagerly convert all markers to RenderLocations (otherwise the renderer
      // will do it anyway) and store them in the target list (since the comments
      // can't be queried)
      const target = targetNodeList[i];

      if (target.nodeName === 'AU-M') {
        // note the renderer will still call this method, but it will just return the
        // location if it sees it's already a location
        targets[i] = this.dom.convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }

    const childNodeList = fragment.childNodes;
    i = 0;
    ii = childNodeList.length;
    const childNodes = this.childNodes = Array(ii);
    while (i < ii) {
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
        const end = this.lastChild;
        let next: Node;

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

  public appendTo(parent: Node): void {
    if (this.isMounted) {
      let current = this.firstChild;
      const end = this.lastChild;
      let next: Node;

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
      parent.appendChild(this.fragment);
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
      const end = this.lastChild;
      let next: Node;

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

  public link(next: INodeSequence<Node> | IRenderLocation & Comment | undefined): void {
    this.isLinked = true;
    if (this.dom.isRenderLocation(next)) {
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

export interface AuMarker extends INode { }

/** @internal */
export class AuMarker implements INode {
  public get parentNode(): Node & ParentNode {
    return this.nextSibling.parentNode!;
  }

  public readonly previousSibling!: Node;
  public readonly content?: Node;
  public readonly childNodes!: ArrayLike<ChildNode>;
  public readonly nodeName!: 'AU-M';
  public readonly nodeType!: NodeType.Element;

  public textContent: string = '';

  public constructor(
    public readonly nextSibling: Node,
  ) {}

  public remove(): void { /* do nothing */ }
}

(proto => {
  proto.previousSibling = null!;
  proto.childNodes = PLATFORM.emptyArray;
  proto.nodeName = 'AU-M';
  proto.nodeType = NodeType.Element;
})(AuMarker.prototype as Writable<AuMarker>);
