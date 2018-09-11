import { DI, IContainer, IResolver, PLATFORM } from '@aurelia/kernel';

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

export const INode = DI.createInterface<INode>().noDefault();

export interface IRenderLocation extends INode { }


export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();

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

/*@internal*/
export function createNodeSequenceFromFragment(fragment: DocumentFragment): INodeSequence {
  return new FragmentNodeSequence(<DocumentFragment>fragment.cloneNode(true));
}

// pre-declare certain functions whose behavior depends on a once-checked global condition for better performance
function returnTrue(): true {
  return true;
}

function returnFalse(): false {
  return false;
}

function removeNormal(node: Element): void {
  node.remove();
}

function removePolyfilled(node: Element): void {
  // not sure if we still actually need this, this used to be an IE9/10 thing
  node.parentNode.removeChild(node);
}

export const DOM = {
  createFactoryFromMarkupOrNode(markupOrNode: string | INode): () => INodeSequence {
    let template: HTMLTemplateElement;
    if (markupOrNode instanceof Node) {
      if ((<HTMLTemplateElement>markupOrNode).content) {
        template = markupOrNode as any;
      } else {
        template = DOM.createTemplate() as any;
        template.content.appendChild(<Node>markupOrNode);
      }
    } else {
      template = DOM.createTemplate() as any;
      template.innerHTML = <string>markupOrNode;
    }

    // bind performs a bit better and gives a cleaner closure than an arrow function
    return createNodeSequenceFromFragment.bind(null, template.content);
  },

  createElement(name: string): INode {
    return document.createElement(name);
  },

  createText(text: string): INode {
    return document.createTextNode(text);
  },

  createNodeObserver(target: INode, callback: MutationCallback, options: MutationObserverInit) {
    const observer = new MutationObserver(callback);
    observer.observe(target as Node, options);
    return observer;
  },

  attachShadow(host: INode, options: ShadowRootInit): INode {
    return (host as Element).attachShadow(options);
  },

  /*@internal*/
  createTemplate(): INode {
    return document.createElement('template');
  },

  cloneNode(node: INode, deep?: boolean): INode {
    return (<Node>node).cloneNode(deep !== false); // use true unless the caller explicitly passes in false
  },

  migrateChildNodes(currentParent: INode, newParent: INode): void {
    const append = DOM.appendChild;
    while (currentParent.firstChild) {
      append(newParent, currentParent.firstChild);
    }
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
    const text = (node as Node).textContent;
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

  convertToRenderLocation(node: INode): IRenderLocation {
    const location = document.createComment('au-loc');
    // let this throw if node does not have a parent
    (<Node>node.parentNode).replaceChild(location, <any>node);
    return location;
  },

  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    container.registerResolver(SVGElement, resolver);
  }
}

// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: INodeSequence = {
  firstChild: null,
  lastChild: null,
  childNodes: PLATFORM.emptyArray,
  findTargets() { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): void {},
  appendTo(parent: INode): void {},
  remove(): void {}
};

export const NodeSequence = {
  empty: emptySequence,
  // This creates an instance of INodeSequence based on an existing INode.
  // It's used by the rendering engine to create an instance of IView,
  // based on a single component. The rendering engine's createViewFromComponent
  // method has one consumer: the compose element. The compose element uses this
  // to create an IView based on a dynamically determined component instance.
  // This is required because there's no way to get a "loose" component into the view
  // hierarchy without it being part of an IView.
  // IViews can only be added via an IViewSlot or IRenderLocation.
  // So, this form of node sequence effectively enables a single component to be added into an IViewSlot.
  fromNode(node: INode): INodeSequence {
    return {
      firstChild: node,
      lastChild: node,
      childNodes: [node],
      findTargets(): ReadonlyArray<INode> {
        return PLATFORM.emptyArray;
      },
      insertBefore(refNode: INode): void {
        DOM.insertBefore(node, refNode);
      },
      appendTo(parent: INode): void {
        DOM.appendChild(parent, node);
      },
      remove(): void {
        DOM.remove(node);
      }
    };
  }
};

// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/*@internal*/
export class FragmentNodeSequence implements INodeSequence {
  private fragment: DocumentFragment;

  firstChild: Node;
  lastChild: Node;
  childNodes: Node[];

  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;
    this.childNodes = PLATFORM.toArray(fragment.childNodes);
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
