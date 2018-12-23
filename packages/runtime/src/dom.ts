import {
  Constructable,
  IContainer,
  IResolver,
  PLATFORM,
  Reporter,
  Tracer,
  Writable
} from '@aurelia/kernel';
import {
  IAddEventListenerOptions,
  IChildNode,
  IComment,
  IDocument,
  IDocumentFragment,
  IElement,
  IEventListenerOptions,
  IEventListenerOrEventListenerObject,
  IHTMLElement,
  IHTMLTemplateElement,
  IMutationCallback,
  IMutationObserver,
  IMutationObserverInit,
  INode,
  INodeSequence,
  IParentNode,
  IRenderLocation,
  IShadowRootInit,
  ISVGElement,
  IText,
  NodeType
} from './dom.interfaces';

const slice = Array.prototype.slice;

function isRenderLocation(node: INode): node is IRenderLocation {
  return node.textContent === 'au-end';
}

declare var MutationObserver: Constructable & IMutationObserver;
declare var Element: IElement;
declare var HTMLElement: IHTMLElement;
declare var SVGElement: ISVGElement;

export class DOM {
  private readonly doc: IDocument;

  constructor(doc: IDocument) {
    this.doc = doc;
  }

  public addClass(node: IHTMLElement, className: string): void {
    node.classList.add(className);
  }
  public addEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: INode, options?: boolean | IAddEventListenerOptions): void {
    (publisher || this.doc).addEventListener(eventName, subscriber, options);
  }
  public appendChild(parent: INode, child: INode): void {
    parent.appendChild(child);
  }
  public attachShadow(host: IHTMLElement, options: IShadowRootInit): IDocumentFragment {
    return host.attachShadow(options);
  }
  public cloneNode<T extends INode>(node: T, deep?: boolean): T {
    return node.cloneNode(deep !== false) as T;
  }
  public convertToRenderLocation(node: INode): IRenderLocation {
    if (this.isRenderLocation(node)) {
      return node; // it's already a RenderLocation (converted by FragmentNodeSequence)
    }
    if (node.parentNode === null) {
      throw Reporter.error(52);
    }
    const locationEnd = this.doc.createComment('au-end');
    const locationStart = this.doc.createComment('au-start');
    this.replaceNode(locationEnd, node);
    this.insertBefore(locationStart, locationEnd);
    (locationEnd as IRenderLocation).$start = locationStart as IRenderLocation;
    (locationStart as IRenderLocation).$nodes = null;
    return locationEnd as IRenderLocation;
  }
  public createComment(text: string): IComment {
    return this.doc.createComment(text);
  }
  public createDocumentFragment(markupOrNode?: string | INode): IDocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return this.doc.createDocumentFragment();
    }
    if (this.isNodeInstance(markupOrNode)) {
      if ((markupOrNode as IHTMLTemplateElement).content !== undefined) {
        return (markupOrNode as IHTMLTemplateElement).content;
      }
      const fragment = this.doc.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }
    return this.createTemplate(markupOrNode).content;
  }
  public createElement(name: string): IHTMLElement {
    return this.doc.createElement(name);
  }
  public createNodeObserver(target: INode, callback: IMutationCallback, options: IMutationObserverInit): IMutationObserver {
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    return observer;
  }
  public createTemplate(markup?: unknown): IHTMLTemplateElement {
    if (markup === undefined || markup === null) {
      return this.doc.createElement('template');
    }
    const template = this.doc.createElement('template');
    template.innerHTML = (markup as string | object).toString();
    return template;
  }
  public createTextNode(text: string): IText {
    return this.doc.createTextNode(text);
  }
  public getAttribute(node: IHTMLElement, name: string): string {
    return node.getAttribute(name);
  }
  public getChildNodes(node: INode): ReadonlyArray<INode> {
    if (node.childNodes.length) {
      return PLATFORM.toArray(node.childNodes);
    } else {
      return PLATFORM.emptyArray;
    }
  }
  public getParentNode(node: INode): INode {
    return node.parentNode;
  }
  public hasClass(node: IHTMLElement, className: string): boolean {
    return node.classList.contains(className);
  }
  public hasParent(node: INode): boolean {
    return node.parentNode !== null;
  }
  public insertBefore(nodeToInsert: INode, referenceNode: INode): void {
    referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
  }
  public isCommentNodeType(node: INode): node is IComment {
    return node.nodeType === NodeType.Comment;
  }
  public isDocumentFragmentType(node: INode): node is IDocumentFragment {
    return node.nodeType === NodeType.DocumentFragment;
  }
  public isElementNodeType(node: INode): node is IHTMLElement {
    return node.nodeType === NodeType.Element;
  }
  public isMarker(node: unknown): node is IHTMLElement {
    return (node as AuMarker).nodeName === 'AU-M';
  }
  public isNodeInstance(potentialNode: unknown): potentialNode is INode {
    return (potentialNode as INode).nodeType > 0;
  }
  public isRenderLocation(node: unknown): node is IRenderLocation {
    return (node as IComment).textContent === 'au-end';
  }
  public isTextNodeType(node: INode): node is IText {
    return node.nodeType === NodeType.Text;
  }
  public migrateChildNodes(currentParent: INode, newParent: INode): void {
    while (currentParent.firstChild !== null) {
      newParent.appendChild(currentParent.firstChild);
    }
  }
  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    container.registerResolver(SVGElement, resolver);
  }
  public remove(node: INode): void {
    if ((node as IChildNode).remove) {
      (node as IChildNode).remove();
    } else {
      node.parentNode.removeChild(node);
    }
  }
  public removeAttribute(node: IHTMLElement, name: string): void {
    node.removeAttribute(name);
  }
  public removeClass(node: IHTMLElement, className: string): void {
    node.classList.remove(className);
  }
  public removeEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: INode, options?: boolean | IEventListenerOptions): void {
    (publisher || this.doc).removeEventListener(eventName, subscriber, options);
  }
  public replaceNode(newChild: INode, oldChild: INode): void {
    if (oldChild.parentNode !== null) {
      oldChild.parentNode.replaceChild(newChild, oldChild);
    }
  }
  public setAttribute(node: IHTMLElement, name: string, value: string): void {
    node.setAttribute(name, value);
  }
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

/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-m` node
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
    refNode.parentNode.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: INode): void {
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
  public firstChild: INode;
  public lastChild: INode;
  public childNodes: INode[];

  private readonly dom: DOM;
  private end: IRenderLocation;
  private fragment: IDocumentFragment;
  private start: IRenderLocation;
  private targets: ArrayLike<INode>;

  constructor(dom: DOM, fragment: IDocumentFragment) {
    this.dom = dom;
    this.fragment = fragment;
    // tslint:disable-next-line:no-any
    const targetNodeList = fragment.querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    const targets = this.targets = Array(ii);
    while (i < ii) {
      // eagerly convert all markers to IRenderLocations (otherwise the renderer
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
      childNodes[i] = childNodeList[i] as Writable<INode>;
      ++i;
    }

    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;

    this.start = this.end = null;
  }

  public findTargets(): ArrayLike<INode> {
    return this.targets;
  }

  public insertBefore(refNode: IRenderLocation): void {
    // tslint:disable-next-line:no-any
    refNode.parentNode.insertBefore(this.fragment, refNode);
    // internally we could generally assume that this is an IRenderLocation,
    // but since this is also public API we still need to double check
    // (or horrible things might happen)
    if (isRenderLocation(refNode)) {
      this.end = refNode;
      const start = this.start = refNode.$start;
      if (start.$nodes === null) {
        start.$nodes = this;
      } else {
        // if more than one NodeSequence uses the same RenderLocation, it's an child
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

  public appendTo(parent: INode): void {
    // tslint:disable-next-line:no-any
    parent.appendChild(this.fragment);
    // this can never be a RenderLocation, and if for whatever reason we moved
    // from a RenderLocation to a host, make sure "start" and "end" are null
    this.start = this.end = null;
  }

  public remove(): void {
    const fragment = this.fragment;
    if (this.start !== null && this.start.$nodes === this) {
      // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
      // repeater with a single item) then simply remove everything in-between (but not
      // the comments themselves as they belong to the parent)
      const end = this.end;
      let next: INode;
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
        let next: INode;

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

export interface INodeSequenceFactory {
  createNodeSequence(): INodeSequence;
}

export class NodeSequenceFactory implements INodeSequenceFactory {
  private readonly dom: DOM;
  private readonly deepClone: boolean;
  private readonly node: INode;
  private readonly Type: Constructable;

  constructor(dom: DOM, markupOrNode: string | INode) {
    this.dom = dom;
    const fragment = dom.createDocumentFragment(markupOrNode);
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
    return new this.Type(this.node.cloneNode(this.deepClone));
  }
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
