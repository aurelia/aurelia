import { Constructable, DI, IContainer, IResolver, PLATFORM, Reporter, Writable } from '@aurelia/kernel';

export const ELEMENT_NODE = 1;
export const ATTRIBUTE_NODE = 2;
export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;
export const DOCUMENT_FRAGMENT_NODE = 11;

function isRenderLocation(node: INode): node is IRenderLocation {
  return node.textContent === 'au-loc';
}

export interface INodeLike {
  readonly firstChild: INode | null;
  readonly lastChild: INode | null;
  readonly childNodes: ArrayLike<INode>;
}
export const INode = DI.createInterface<INode>().noDefault();
export interface INode extends INodeLike {
  textContent: string;
  readonly parentNode: INode | null;
  readonly nextSibling: INode | null;
  readonly previousSibling: INode | null;
  readonly nodeName: string;
  readonly nodeType: number;
}

export interface IAttr extends Partial<INode> {
  readonly name: string;
  value: string;
}

export interface IElement extends INode {
  readonly content?: IDocumentFragment;
}

export interface IStyleDeclaration {
  cssText: string;
  setProperty(propertyName: string, value: string, priority?: string): void;
  removeProperty(propertyName: string): void;
}
export interface IHTMLElement extends IElement {
  readonly style: IStyleDeclaration;
  setAttributeNS(namespace: string, qualifiedName: string, value: string): void;
  getAttributeNS(namespace: string, qualifiedName: string): string;
}

export interface IInputElement extends IElement {
  // tslint:disable-next-line:no-reserved-keywords
  readonly type: string;
  value: string;
  checked: boolean;
}

export interface IText extends INode {
  readonly nodeName: '#text';
  readonly nodeType: typeof TEXT_NODE;
}

export interface IComment extends INode {
  readonly nodeName: '#comment';
  readonly nodeType: typeof COMMENT_NODE;
}

export interface IDocumentFragment extends INode {
  readonly nodeName: '#document-fragment';
  readonly nodeType: typeof DOCUMENT_FRAGMENT_NODE;
}

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation extends INode { }

/**
 * Represents a DocumentFragment
 */
export interface INodeSequence extends INodeLike {
  /**
   * The nodes of this sequence.
   */
  childNodes: ReadonlyArray<INode>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ArrayLike<INode> | ReadonlyArray<INode>;

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

export interface INodeObserver {
  disconnect(): void;
}

// tslint:disable:no-any
export const DOM = {
  createDocumentFragment(markupOrNode?: string | IElement): IDocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return <IDocumentFragment>document.createDocumentFragment();
    }
    if ((<IElement>markupOrNode).nodeType > 0) {
      if ((<IElement>markupOrNode).content !== undefined) {
        return (<IElement>markupOrNode).content;
      }
      const fragment = document.createDocumentFragment();
      fragment.appendChild(<any>markupOrNode);
      return <IDocumentFragment>fragment;
    }
    return DOM.createTemplate(<string>markupOrNode).content;
  },
  createTemplate(markup?: string): IElement {
    if (markup === undefined) {
      return <IElement>document.createElement('template');
    }
    const template = document.createElement('template');
    template.innerHTML = markup;
    return <IElement>template;
  },
  addClass(node: INode, className: string): void {
    (<any>node).classList.add(className);
  },
  addEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void {
    ((<any>publisher) || document).addEventListener(eventName, subscriber, options);
  },
  appendChild(parent: INode, child: INode): void {
    (<any>parent).appendChild(child);
  },
  attachShadow(host: IElement, options: ShadowRootInit): IDocumentFragment {
    return (<any>host).attachShadow(options);
  },
  cloneNode<T extends INode = INode>(node: T, deep?: boolean): T {
    return (<any>node).cloneNode(deep !== false); // use true unless the caller explicitly passes in false
  },
  convertToRenderLocation(node: INode): IRenderLocation {
    if (isRenderLocation(node)) {
      return node; // it's already a RenderLocation (converted by FragmentNodeSequence)
    }
    if ((<any>node).parentNode === null) {
      throw Reporter.error(52);
    }
    const location = <IRenderLocation>document.createComment('au-loc');
    DOM.replaceNode(location, node);
    return location;
  },
  createComment(text: string): IComment {
    return <IComment>document.createComment(text);
  },
  createElement(name: string): IElement {
    return document.createElement(name);
  },
  createNodeObserver(target: INode, callback: MutationCallback, options: MutationObserverInit): MutationObserver {
    const observer = new MutationObserver(callback);
    observer.observe(<any>target, options);
    return observer;
  },
  createTextNode(text: string): IText {
    return <IText>document.createTextNode(text);
  },
  getAttribute(node: INode, name: string): any {
    return (<any>node).getAttribute(name);
  },
  hasClass(node: INode, className: string): boolean {
    return (<any>node).classList.contains(className);
  },
  insertBefore(nodeToInsert: INode, referenceNode: INode): void {
    (<any>referenceNode).parentNode.insertBefore(nodeToInsert, referenceNode);
  },
  isAllWhitespace(node: INode): boolean {
    if ((<any>node).auInterpolationTarget === true) {
      return false;
    }
    const text = node.textContent;
    const len = text.length;
    let i = 0;
    // for perf benchmark of this compared to the regex method: http://jsben.ch/p70q2 (also a general case against using regex)
    while (i < len) {
      // charCodes 0-0x20(32) can all be considered whitespace (non-whitespace chars in this range don't have a visual representation anyway)
      if (text.charCodeAt(i) > 0x20) {
        return false;
      }
      i++;
    }
    return true;
  },
  isCommentNodeType(node: INode): node is IComment {
    return node.nodeType === COMMENT_NODE;
  },
  isDocumentFragmentType(node: INode): node is IDocumentFragment {
    return node.nodeType === DOCUMENT_FRAGMENT_NODE;
  },
  isElementNodeType(node: INode): node is IElement {
    return node.nodeType === ELEMENT_NODE;
  },
  isNodeInstance(potentialNode: any): potentialNode is INode {
    return potentialNode.nodeType > 0;
  },
  isTextNodeType(node: INode): node is IText {
    return node.nodeType === TEXT_NODE;
  },
  migrateChildNodes(currentParent: INode, newParent: INode): void {
    while (currentParent.firstChild) {
      DOM.appendChild(newParent, currentParent.firstChild);
    }
  },
  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    container.registerResolver(SVGElement, resolver);
  },
  remove(node: INodeLike): void {
    if ((<any>node).remove) {
      (<any>node).remove();
    } else {
      (<any>node).parentNode.removeChild(node);
    }
  },
  removeAttribute(node: INode, name: string): void {
    (<any>node).removeAttribute(name);
  },
  removeClass(node: INode, className: string): void {
    (<any>node).classList.remove(className);
  },
  removeEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any): void {
    ((<any>publisher) || document).removeEventListener(eventName, subscriber, options);
  },
  replaceNode(newChild: INode, oldChild: INode): void {
    if (oldChild.parentNode) {
      (<any>oldChild).parentNode.replaceChild(newChild, oldChild);
    }
  },
  setAttribute(node: INode, name: string, value: any): void {
    (<any>node).setAttribute(name, value);
  },
  treatAsNonWhitespace(node: INode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  }
};

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
 * - the previous element is an `au-marker` node
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
    (<any>refNode).parentNode.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: INode): void {
    (<any>parent).appendChild(this.firstChild);
  }

  public remove(): void {
    (<any>this.firstChild).remove();
  }
}
// tslint:enable:no-any

// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/*@internal*/
export class FragmentNodeSequence implements INodeSequence {
  public firstChild: INode;
  public lastChild: INode;
  public childNodes: INode[];

  private fragment: IDocumentFragment;
  private targets: ArrayLike<INode>;

  constructor(fragment: IDocumentFragment) {
    this.fragment = fragment;
    // tslint:disable-next-line:no-any
    const targetNodeList = (<any>fragment).querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    const targets = this.targets = Array(ii);
    while (i < ii) {
      const target = targetNodeList[i];
      if (target.nodeName === 'AU-MARKER') {
        targets[i] = DOM.convertToRenderLocation(target);
      } else {
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
  }

  public findTargets(): ArrayLike<INode> {
    // tslint:disable-next-line:no-any
    return this.targets;
  }

  public insertBefore(refNode: IRenderLocation): void {
    // tslint:disable-next-line:no-any
    (<any>refNode).parentNode.insertBefore(this.fragment, refNode);

  }

  public appendTo(parent: INode): void {
    // tslint:disable-next-line:no-any
    (<any>parent).appendChild(this.fragment);
  }

  public remove(): void {
    const fragment = this.fragment;
    let current = this.firstChild;

    if (current.parentNode !== fragment) {
      const end = this.lastChild;
      let next: INode;

      while (current !== null) {
        next = current.nextSibling;
        // tslint:disable-next-line:no-any
        (<any>fragment).appendChild(current);

        if (current === end) {
          break;
        }

        current = next;
      }
    }
  }
}

interface ICloneableNode extends INode {
  cloneNode(deep?: boolean): ICloneableNode;
}

export interface INodeSequenceFactory {
  createNodeSequence(): INodeSequence;
}

export class NodeSequenceFactory {
  private readonly deepClone: boolean;
  private readonly node: ICloneableNode;
  private readonly Type: Constructable<INodeSequence>;
  constructor(fragment: IDocumentFragment) {
    const childNodes = fragment.childNodes;
    if (childNodes.length === 2) {
      const target = childNodes[0];
      if (target.nodeName === 'AU-MARKER' || target.nodeName === '#comment') {
        const text = childNodes[1];
        if (text.nodeType === TEXT_NODE && text.textContent === ' ') {
          this.deepClone = false;
          this.node = <ICloneableNode>text;
          this.Type = TextNodeSequence;
          return;
        }
      }
    }
    this.deepClone = true;
    this.node = <ICloneableNode>fragment;
    this.Type = FragmentNodeSequence;
  }

  public static createFor(markupOrNode: string | INode): NodeSequenceFactory {
    const fragment = DOM.createDocumentFragment(markupOrNode);
    return new NodeSequenceFactory(fragment);
  }

  public createNodeSequence(): INodeSequence {
    return new this.Type(this.node.cloneNode(this.deepClone));
  }
}

/*@internal*/
export class AuMarker implements INode {
  public get parentNode(): INode {
    return this.nextSibling.parentNode;
  }
  public readonly nextSibling: INode;
  public readonly previousSibling: INode;
  public readonly content?: INode;
  public readonly firstChild: INode;
  public readonly lastChild: INode;
  public readonly childNodes: ArrayLike<INode>;
  public readonly nodeName: 'AU-MARKER';
  public readonly nodeType: typeof ELEMENT_NODE;
  public textContent: string = '';

  constructor(next: INode) {
    this.nextSibling = next;
  }
  public remove(): void { /* do nothing */ }
}
(proto => {
  proto.previousSibling = null;
  proto.firstChild = null;
  proto.lastChild = null;
  proto.childNodes = PLATFORM.emptyArray;
  proto.nodeName = 'AU-MARKER';
  proto.nodeType = ELEMENT_NODE;
})(<Writable<AuMarker>>AuMarker.prototype);
