import { IContainer, IResolver, DI } from '@aurelia/kernel';
import { ICustomElement } from './templating/custom-element';

export interface INodeLike {
  readonly firstChild: INode | null;
  readonly lastChild: INode | null;
  readonly childNodes: ArrayLike<INode>;
}

export interface INode extends INodeLike {
  readonly parentNode: INode | null;
  readonly nextSibling: INode | null;
  readonly previousSibling: INode | null;
}

export const INode = DI.createInterface<INode>();

/**
 * Represents a DocumentFragment
 */
export interface IView extends INodeLike {
  /**
   * The child nodes of this view
   */
  childNodes: ReadonlyArray<INode>;

  /**
   * Find all au-targets underneath this view
   */
  findTargets(): ArrayLike<INode> | ReadonlyArray<INode>;

  /**
   * Append child to this view
   */
  appendChild(child: INode): void;

  /**
   * Insert this view as a sibling before refNode
   */
  insertBefore(refNode: INode): void;

  /**
   * Append this view as a child to parent
   */
  appendTo(parent: INode): void;
  remove(): void;
}

export interface IChildObserver {
  childNodes: ArrayLike<INode>;
  disconnect(): void;
}

function createView(fragment: DocumentFragment): IView {
  return new TemplateView(<DocumentFragment>fragment.cloneNode(true));
}

// don't create a new options object for each call to createChildObserver
const childObserverOptions = { childList: true };

// pre-declare certain functions whose behavior depends on a once-checked global condition for better performance
function returnTrue(): true {
  return true;
}
function returnFalse(): false {
  return false;
}
function createElementViewHostWithShadowDOM(node: Element, options?: ShadowRootInit): INode {
  if (options) {
    return node.attachShadow(options);
  }

  (<any>node).$usingSlotEmulation = true;
  return node;
}
function createElementViewHostWithNoShadowDOM(node: Element): INode {
  (<any>node).$usingSlotEmulation = true;
  return node;
}
function removeNormal(node: Element): void {
  node.remove();
}
function removePolyfilled(node: Element): void {
  // not sure if we still actually need this, this used to be an IE9/10 thing
  node.parentNode.removeChild(node);
}

export const DOM = {
  createFactoryFromMarkup(markup: string): () => IView {
    const template = <HTMLTemplateElement>DOM.createTemplate();
    template.innerHTML = markup;
    // bind performs a bit better and gives a cleaner closure than an arrow function
    return createView.bind(null, template.content);
  },

  createElement(name: string): INode {
    return document.createElement(name);
  },
  createAnchor(): INode {
    return document.createComment('anchor');
  },
  /*@internal*/createTemplate(): INode {
    return document.createElement('template');
  },

  createChildObserver(parent: INode, onChildrenChanged: MutationCallback, options?: MutationObserverInit): IChildObserver {
    if ((<any>parent).$usingSlotEmulation) {
      return (<any>parent).$component.$contentView.attachChildObserver(onChildrenChanged);
    } else {
      const observer = new MutationObserver(onChildrenChanged);
      (<any>observer).childNodes = parent.childNodes;
      observer.observe(<Node>parent, options || childObserverOptions);
      return <any>observer;
    }
  },

  platformSupportsShadowDOM(): boolean {
    if (HTMLElement.prototype.attachShadow === undefined) {
      return (DOM.platformSupportsShadowDOM = returnFalse)();
    } else {
      return (DOM.platformSupportsShadowDOM = returnTrue)();
    }
  },

  createElementViewHost(node: INode, options?: ShadowRootInit): INode {
    // only check shadowDOM availability once and then set a short-circuited function directly to save a few cycles
    if (DOM.platformSupportsShadowDOM()) {
      return (DOM.createElementViewHost = createElementViewHostWithShadowDOM)(<Element>node, options);
    } else {
      return (DOM.createElementViewHost = createElementViewHostWithNoShadowDOM)(<Element>node);
    }
  },

  cloneNode(node: INode, deep?: boolean): INode {
    return (<Node>node).cloneNode(deep !== false); // use true unless the caller explicitly passes in false
  },

  getCustomElementForNode(node: INode): ICustomElement | null {
    return (<any>node).$component || null; //Set during component $hydrate
  },

  isUsingSlotEmulation(node: INode): boolean {
    return (<any>node).$usingSlotEmulation === true;
  },

  isNodeInstance(potentialNode: any): potentialNode is INode {
    return potentialNode instanceof Node;
  },

  isElementNodeType(node: INode): boolean {
    return (<Node>node).nodeType === 1;
  },

  isTextNodeType(node: INode): boolean {
    return (<Node>node).nodeType === 3;
  },

  normalizedTagName(node: INode): string {
    const name = (<Element>node).tagName;
    return name ? name.toLowerCase() : null;
  },

  remove(node: INodeLike): void {
    // only check the prototype once and then permanently set a polyfilled or non-polyfilled call to save a few cycles
    if (Element.prototype.remove === undefined) {
      (DOM.remove = removePolyfilled)(<Element>node);
    } else {
      (DOM.remove = removeNormal)(<Element>node);
    }
  },

  replaceNode(newChild: INode, oldChild: INode): void {
    if (oldChild.parentNode) {
      (<Node>oldChild.parentNode).replaceChild(<Node>newChild, <Node>oldChild);
    }
  },

  appendChild(parent: INode, child: INode): void {
    (<Node>parent).appendChild(<Node>child);
  },

  insertBefore(nodeToInsert: INode, referenceNode: INode): void {
    (<Node>referenceNode.parentNode).insertBefore(<Node>nodeToInsert, <Node>referenceNode);
  },

  getAttribute(node: INode, name: string): any {
    return (<Element>node).getAttribute(name);
  },

  setAttribute(node: INode, name: string, value: any): void {
    (<Element>node).setAttribute(name, value);
  },

  removeAttribute(node: INode, name: string): void {
    (<Element>node).removeAttribute(name);
  },

  hasClass(node: INode, className: string): boolean {
    return (<Element>node).classList.contains(className);
  },
  
  addClass(node: INode, className: string): void {
    (<Element>node).classList.add(className);
  },

  removeClass(node: INode, className: string): void {
    (<Element>node).classList.remove(className);
  },

  addEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any) {
    (<Node>publisher || document).addEventListener(eventName, subscriber, options);
  },

  removeEventListener(eventName: string, subscriber: any, publisher?: INode, options?: any) {
    (<Node>publisher || document).removeEventListener(eventName, subscriber, options);
  },

  isAllWhitespace(node: INode): boolean {
    if ((<any>node).auInterpolationTarget === true) {
      return false;
    }
    const text = (<any>node).textContent;
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

  treatAsNonWhitespace(node: INode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  },

  convertToAnchor(node: INode, proxy?: boolean): INode {
    const anchor = <CommentProxy>DOM.createAnchor();
    if (proxy) {
      anchor.$proxyTarget = <Element>node;
      // binding explicitly to the anchor instead of implicitly to ensure the correct 'this' assignment
      anchor.hasAttribute = hasAttribute.bind(anchor);
      anchor.getAttribute = getAttribute.bind(anchor);
      anchor.setAttribute = setAttribute.bind(anchor);
    }

    // let this throw if node does not have a parent
    (<Node>node.parentNode).replaceChild(anchor, <any>node);
  
    return anchor;
  },

  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    container.registerResolver(SVGElement, resolver);
  }
}

interface CommentProxy extends Comment {
  $proxyTarget: Element;
  hasAttribute: typeof Element.prototype.hasAttribute;
  getAttribute: typeof Element.prototype.getAttribute;
  setAttribute: typeof Element.prototype.setAttribute;
}

function hasAttribute(this: CommentProxy, qualifiedName: string): boolean {
  return this.$proxyTarget.hasAttribute(qualifiedName);
}

function getAttribute(this: CommentProxy, qualifiedName: string): string {
  return this.$proxyTarget.getAttribute(qualifiedName);
}

function setAttribute(this: CommentProxy, qualifiedName: string, value: string): void {
  this.$proxyTarget.setAttribute(qualifiedName, value);
}

// This is the most common form of IView.
// Every custom element or template controller whose view is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a view from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of TemplateViews.
/*@internal*/
export class TemplateView implements IView {
  private fragment: DocumentFragment;

  firstChild: Node;
  lastChild: Node;
  childNodes: Node[];

  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;

    const childNodes = fragment.childNodes;
    // pre-allocated array with a manual while loop is 3-10x faster than Array.from()
    const len = childNodes.length;
    const childNodesArr = new Array(len);
    let i = 0;
    while (i < len) {
      childNodesArr[i] = childNodes.item(i);
      i++;
    }
    this.childNodes = childNodesArr;
  }

  appendChild(child: Node) {
    this.fragment.appendChild(child);
  }

  findTargets(): ArrayLike<Node> {
    return this.fragment.querySelectorAll('.au');
  }

  insertBefore(refNode: Node): void {
    refNode.parentNode.insertBefore(this.fragment, refNode);
  }

  appendTo(parent: Node): void {
    parent.appendChild(this.fragment);
  }

  remove(): void {
    const fragment = this.fragment;
    // this bind is a small perf tweak to minimize member accessors
    const append = fragment.appendChild.bind(fragment);
    let current = this.firstChild;
    const end = this.lastChild;
    let next: Node;

    while (current) {
      next = current.nextSibling;
      append(current);

      if (current === end) {
        break;
      }

      current = next;
    }
  }
}
