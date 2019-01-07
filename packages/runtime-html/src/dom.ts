import {
  Constructable,
  DI,
  IContainer,
  IResolver,
  PLATFORM,
  Registration,
  Reporter,
  Writable
} from '@aurelia/kernel';
import {
  CompiledTemplate,
  IDOM,
  INode,
  INodeSequence,
  IRenderContext,
  IRenderLocation,
  ITemplate,
  ITemplateFactory,
  NodeSequence,
  TemplateDefinition
} from '@aurelia/runtime';

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

function isRenderLocation(node: Node): node is Node & IRenderLocation {
  return node.textContent === 'au-end';
}

export class HTMLDOM implements IDOM {
  public readonly Node: typeof Node;
  public readonly Element: typeof Element;
  public readonly HTMLElement: typeof HTMLElement;
  private readonly wnd: Window;
  private readonly doc: Document;

  constructor(
    wnd: Window,
    doc: Document,
    TNode: typeof Node,
    TElement: typeof Element,
    THTMLElement: typeof HTMLElement
  ) {
    this.wnd = wnd;
    this.doc = doc;
    this.Node = TNode;
    this.Element = TElement;
    this.HTMLElement = THTMLElement;
  }

  public addEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | AddEventListenerOptions): void {
    (publisher || this.wnd).addEventListener(eventName, subscriber, options);
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
    if (node.parentNode === null) {
      throw Reporter.error(52);
    }
    const locationEnd = this.doc.createComment('au-end');
    const locationStart = this.doc.createComment('au-start');
    node.parentNode.replaceChild(locationEnd, node);
    locationEnd.parentNode.insertBefore(locationStart, locationEnd);
    (locationEnd as IRenderLocation).$start = locationStart as IRenderLocation;
    (locationStart as IRenderLocation).$nodes = null;
    return locationEnd as IRenderLocation;
  }
  public createDocumentFragment(markupOrNode?: string | Node): DocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return this.doc.createDocumentFragment();
    }
    if (this.isNodeInstance(markupOrNode)) {
      if ((markupOrNode as HTMLTemplateElement).content !== undefined) {
        return (markupOrNode as HTMLTemplateElement).content;
      }
      const fragment = this.doc.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }
    return this.createTemplate(markupOrNode).content;
  }
  public createElement(name: string): HTMLElement {
    return this.doc.createElement(name);
  }
  public createNodeObserver(node: Node, cb: MutationCallback, init: MutationObserverInit): MutationObserver {
    if (typeof MutationObserver === 'undefined') {
      // TODO: find a proper response for this scenario
      return {
        disconnect(): void { /*empty*/ },
        observe(): void { /*empty*/ },
        takeRecords(): MutationRecord[] { return PLATFORM.emptyArray as MutationRecord[]; }
      };
    }
    const observer = new MutationObserver(cb);
    observer.observe(node, init);
    return observer;
  }
  public createTemplate(markup?: unknown): HTMLTemplateElement {
    if (markup === undefined || markup === null) {
      return this.doc.createElement('template');
    }
    const template = this.doc.createElement('template');
    template.innerHTML = (markup as string | object).toString();
    return template;
  }
  public createTextNode(text: string): Text {
    return this.doc.createTextNode(text);
  }
  public insertBefore(nodeToInsert: Node, referenceNode: Node): void {
    referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
  }
  public isMarker(node: unknown): node is HTMLElement {
    return (node as AuMarker).nodeName === 'AU-M';
  }
  public isNodeInstance(potentialNode: unknown): potentialNode is Node {
    return potentialNode !== null && potentialNode !== undefined && (potentialNode as Node).nodeType > 0;
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
      node.parentNode.removeChild(node);
    }
  }
  public removeEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | EventListenerOptions): void {
    (publisher || this.doc).removeEventListener(eventName, subscriber, options);
  }
  public setAttribute(node: Element, name: string, value: unknown): void {
    node.setAttribute(name, value as string);
  }
}

/**
 * A specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-m` node
 * - text is the actual text node
 */
/** @internal */
export class TextNodeSequence implements INodeSequence {
  public dom: HTMLDOM;
  public firstChild: Text;
  public lastChild: Text;
  public childNodes: Text[];

  private targets: [Node];

  constructor(dom: HTMLDOM, text: Text) {
    this.dom = dom;
    this.firstChild = text;
    this.lastChild = text;
    this.childNodes = [text];
    this.targets = [new AuMarker(text) as unknown as Node];
  }

  public findTargets(): ArrayLike<Node> {
    return this.targets;
  }

  public insertBefore(refNode: Node): void {
    refNode.parentNode.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: Node): void {
    parent.appendChild(this.firstChild);
  }

  public remove(): void {
    this.firstChild.remove();
  }
}
// tslint:enable:no-any

// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/** @internal */
export class FragmentNodeSequence implements INodeSequence {
  public dom: IDOM;
  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  private end: IRenderLocation & Comment;
  private fragment: DocumentFragment;
  private start: IRenderLocation & Comment;
  private targets: ArrayLike<Node>;

  constructor(dom: IDOM, fragment: DocumentFragment) {
    this.dom = dom;
    this.fragment = fragment;
    // tslint:disable-next-line:no-any
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

    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;

    this.start = this.end = null;
  }

  public findTargets(): ArrayLike<Node> {
    return this.targets;
  }

  public insertBefore(refNode: IRenderLocation & Comment): void {
    // tslint:disable-next-line:no-any
    refNode.parentNode.insertBefore(this.fragment, refNode);
    // internally we could generally assume that this is an IRenderLocation,
    // but since this is also public API we still need to double check
    // (or horrible things might happen)
    if (isRenderLocation(refNode)) {
      this.end = refNode;
      const start = this.start = refNode.$start as IRenderLocation & Comment;
      if (start.$nodes === null) {
        start.$nodes = this;
      } else {
        // if more than one INodeSequence uses the same IRenderLocation, it's an child
        // of a repeater (or something similar) and we shouldn't remove all nodes between
        // start - end since that would always remove all items from a repeater, even
        // when only one is removed
        // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
        // occupied and 2) prevent start.$nodes === this from ever evaluating to true
        // during remove()
        start.$nodes = PLATFORM.emptyObject;
      }
    }
  }

  public appendTo(parent: Node): void {
    // tslint:disable-next-line:no-any
    parent.appendChild(this.fragment);
    // this can never be a IRenderLocation, and if for whatever reason we moved
    // from a IRenderLocation to a host, make sure "start" and "end" are null
    this.start = this.end = null;
  }

  public remove(): void {
    const fragment = this.fragment;
    if (this.start !== null && this.start.$nodes === this) {
      // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
      // repeater with a single item) then simply remove everything in-between (but not
      // the comments themselves as they belong to the parent)
      const end = this.end;
      let next: Node;
      let current = this.start.nextSibling;
      while (current !== end) {
        next = current.nextSibling;
        // tslint:disable-next-line:no-any
        fragment.appendChild(current);
        current = next;
      }
      this.start.$nodes = null;
      this.start = this.end = null;
    } else {
      // otherwise just remove from first to last child in the regular way
      let current = this.firstChild;

      if (current.parentNode !== fragment) {
        const end = this.lastChild;
        let next: Node;

        while (current !== null) {
          next = current.nextSibling;
          // tslint:disable-next-line:no-any
          fragment.appendChild(current);

          if (current === end) {
            break;
          }

          current = next;
        }
      }
    }
  }
}

/** @internal */
export interface NodeSequenceFactory {
  createNodeSequence(): INodeSequence;
}

/** @internal */
export class NodeSequenceFactory implements NodeSequenceFactory {
  private readonly dom: IDOM;
  private readonly deepClone: boolean;
  private readonly node: Node;
  private readonly Type: Constructable;

  constructor(dom: IDOM, markupOrNode: string | Node) {
    this.dom = dom;
    const fragment = dom.createDocumentFragment(markupOrNode) as DocumentFragment;
    const childNodes = fragment.childNodes;
    switch (childNodes.length) {
      case 0:
        this.createNodeSequence = () => NodeSequence.empty;
        return;
      case 2:
        const target = childNodes[0];
        if (target.nodeName === 'AU-M' || target.nodeName === '#comment') {
          const text = childNodes[1];
          if (text.nodeType === NodeType.Text && text.textContent.length === 0) {
            this.deepClone = false;
            this.node = text;
            this.Type = TextNodeSequence;
            return;
          }
        }
      // falls through if not returned
      default:
        this.deepClone = true;
        this.node = fragment;
        this.Type = FragmentNodeSequence;
    }
  }

  public createNodeSequence(): INodeSequence {
    return new this.Type(this.dom, this.node.cloneNode(this.deepClone));
  }
}

export interface AuMarker extends INode { }

/** @internal */
export class AuMarker implements INode {
  public get parentNode(): Node & ParentNode {
    return this.nextSibling.parentNode;
  }
  public readonly nextSibling: Node;
  public readonly previousSibling: Node;
  public readonly content?: Node;
  public readonly childNodes: ArrayLike<ChildNode>;
  public readonly nodeName: 'AU-M';
  public readonly nodeType: NodeType.Element;

  public textContent: string;

  constructor(next: Node) {
    this.nextSibling = next;
    this.textContent = '';
  }
  public remove(): void { /* do nothing */ }
}

(proto => {
  proto.previousSibling = null;
  proto.childNodes = PLATFORM.emptyArray;
  proto.nodeName = 'AU-M';
  proto.nodeType = NodeType.Element;
})(AuMarker.prototype as Writable<AuMarker>);

/** @internal */
export class HTMLTemplateFactory implements ITemplateFactory {
  public static inject: unknown[] = [IDOM];

  private readonly dom: IDOM;

  constructor(dom: IDOM) {
    this.dom = dom;
  }

  public static register(container: IContainer): IResolver<ITemplateFactory> {
    return Registration.singleton(ITemplateFactory, this).register(container);
  }

  public create(parentRenderContext: IRenderContext, definition: TemplateDefinition): ITemplate {
    return new CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template as string | Node), parentRenderContext);
  }
}
