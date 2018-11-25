import { View, ViewBase } from 'tns-core-modules/ui/core/view';
import { ContentView } from 'tns-core-modules/ui/page/page';
import { LayoutBase } from 'tns-core-modules/ui/layouts/layout-base';
import { TextBase } from 'tns-core-modules/ui/text-base/text-base';
import { Button } from 'tns-core-modules/ui/button/button';
import { Frame } from 'tns-core-modules/ui/frame/frame';
import { Node, Element, DocumentFragment, Document, HTMLElement, HTMLTemplateElement, Text } from '../../basichtml';
import { PLATFORM, DI, Constructable, Writable, IContainer, IResolver } from '@aurelia/kernel';
import { document, INode } from './dom';

// const { Document, DocumentFragment } = BasicHtml;

function isRenderLocation(node: INsNode): node is INsRenderLocation {
  return node.constructor === ContentView;
}

export function isView(view: ViewBase): view is View {
  return view instanceof View;
}

export function isLayout(view: ViewBase): view is LayoutBase {
  return view instanceof LayoutBase;
}

export function isContentView(view: ViewBase): view is ContentView {
  return view instanceof ContentView;
}

export function isFrame(view: ViewBase): view is Frame {
  return view instanceof Frame;
}

const NsDomMap: Record<string, () => INsNode> = {};
export const NsDOM = new class {

  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INsNode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    // container.registerResolver(SVGElement, resolver);
  }

  createDocumentFragment(markupOrNode?: any): DocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return document.createDocumentFragment();
    }
    if (markupOrNode.nodeType > 0) {
      if (markupOrNode.content !== undefined) {
        return markupOrNode.content;
      }
      const fragment = document.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }
    return NsDOM.createTemplate(<string>markupOrNode).content;
  }

  createTemplate(markup?: string): HTMLTemplateElement {
    if (markup === undefined) {
      return document.createElement('template');
    }
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template;
  }

  convertToRenderLocation(node: any) {
    if (isRenderLocation(node)) {
      // it's already a RenderLocation (converted by FragmentNodeSequence)
      return node;
    }
    if (!node.parent) {
      throw new Error('No parent???');
    }
    const locationEnd = NsDOM.createComment('au-end') as INsRenderLocation;
    const locationStart = NsDOM.createComment('au-start') as INsRenderLocation;
    NsDOM.replaceNode(locationEnd, node);
    NsDOM.insertBefore(locationStart, locationEnd);
    locationEnd.$start = locationStart;
    // locationStart.$nodes = null;
    return locationEnd
  }

  /**
   * Create basic node of a PIXI DOM
   */
  createComment(text: string): INsNode {
    const dObj = new ContentView();
    // dObj.nodeName = '#comment';
    // dObj.textContent = text;
    return dObj;
  }

  createTextNode(text: string): TextBase {
    const textNode = new TextBase();
    textNode.text = text;
    return textNode;
  }

  createElement(tagName: 'Text'): TextBase;
  createElement(tagName: 'Button'): Button;
  createElement(tagName: 'Frame'): Frame;
  createElement(tagName: string): INsNode;
  createElement(tagName: string): INsNode {
    if (!(tagName in NsDomMap)) {
      console.log(Object.keys(NsDomMap));
      throw new Error('There is no element with ' + tagName + ' registered');
    }
    return NsDomMap[tagName]();
  }

  remove<T extends INsNode = INsNode>(childView: T, parentView?: INsNode): T | null {
    // if (node.parent) {
    //   node.parent.removeChild(node);
    //   return node;
    // }
    // return null;
    parentView = parentView || childView.parent as INsNode;
    if (!parentView) {
      return null;
    }

    // if (parentNode.meta && typeof parentNode.meta.removeChild === 'function') {
    //   return parentNode.meta.removeChild(parentNode, childNode)
    // }
  
    // if (childNode.meta.skipAddToDom) {
    //   return
    // }
  
    // const parentView = parentNode.nativeView
    // const childView = childNode.nativeView
  
    if (isLayout(parentView)) {
      parentView.removeChild(childView)
    } else if (isContentView(parentView)) {
      if (parentView.content === childView) {
        parentView.content = null
      }
  
      if (childView.nodeType === 8 || childView.nodeName === '#comment') {
        parentView._removeView(childView);
      }
    } else if (isView(parentView)) {
      parentView._removeView(childView);
    } else {
      // throw new Error("Unknown parent type: " + parent);
    }
  }

  replaceNode(newNode: INsNode, refNode: INsNode) {
    NsDOM.insertBefore(newNode, refNode);
    NsDOM.remove(refNode);
    // refNode.parent.insertBefore(newNode, refNode);
    // refNode.parent.removeChild(refNode);
    return newNode;
  }

  insertBefore<T extends INsNode = View>(newView: T, refView: INsNode): T {
    const parentView = refView.parent;
    if (!parentView) {
      throw new Error('No parent');
    }
    // if (parentNode.meta && typeof parentNode.meta.insertChild === 'function') {
    //   return parentNode.meta.insertChild(parentNode, childNode, atIndex)
    // }
  
    // if (childNode.meta.skipAddToDom) {
    //   return
    // }
    
    // const parentView = parentNode.nativeView
    // const childView = childNode.nativeView
    if (isLayout(parentView)) {
      let atIndex = parentView.getChildIndex(refView);
      if (newView.parent === parentView) {
        let index = parentView.getChildIndex(newView);
        if (index !== -1) {
          parentView.removeChild(newView);
        }
      }
      if (atIndex !== -1) {
        parentView.insertChild(newView, atIndex);
      } else {
        parentView.addChild(newView);
      }
    } else if (isContentView(parentView)) {
      parentView.content = newView;
      // if (newView.nodeType === /** COMMENT */8) {
      //   parentView._addView(childView, atIndex)
      // } else {
      //   parentView.content = childView
      // }
    }
    // else if (parentView && parentView._addChildFromBuilder) {
    //   parentView._addChildFromBuilder(
    //     childNode._nativeView.constructor.name,
    //     childView
    //   )
    // } else {
    //   // throw new Error("Parent can"t contain children: " + parent.nodeName + ", " + parent);
    // }
    return newView;
  }

  appendChild<T extends INsNode = INsNode>(view: T, parentView: INsNode): T {
    if (isLayout(parentView)) {
      let atIndex = parentView.getChildIndex(view);
      if (view.parent === parentView) {
        let index = parentView.getChildIndex(view);
        if (index !== -1) {
          parentView.removeChild(view);
        }
      }
      if (atIndex !== -1) {
        parentView.insertChild(view, atIndex);
      } else {
        parentView.addChild(view);
      }
      return view;
    } else if (isContentView(parentView)) {
      if (view.nodeName === '#comment') {
        parentView._addView(view);
      } else {
        parentView.content = view;
      }
      return view;
    } else if (isFrame(parentView)) {
      parentView._addView(view);
      return view;
    }
    throw new Error(`Invalid add operation. Cannot add "${view.typeName}" to "${parentView.typeName}"`);
  }

  isNodeInstance(node: any): node is INsNode {
    return node instanceof View;
  }

  map(tagName: string, ctor: (() => INsNode)): void {
    if (tagName in NsDomMap) {
      throw new Error(`Element with the same name "${tagName}" already exists`);
    }
    NsDomMap[tagName] = ctor;
  }

  nodesToNsViews = nodesToNsViews;
  
  treatAsNonWhitespace(node: INsNode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  }
};

export const INsNode = DI.createInterface<INsNode>().noDefault();
export interface INsNode extends View {
  nodeType?: number;
  nodeName?: string;
  textContent?: string;
  firstChild?: INsNode | null;
  lastChild?: INsNode | null;
  nextSibling?: INsNode | null;
  previousSibling?: INsNode | null;
}


export const INsRenderLocation = DI.createInterface<INsRenderLocation>().noDefault();
export interface INsRenderLocation extends INsNode {
  $start: INsRenderLocation;
  $nodes: INsNodeSequence;
}

/**
 * Represents a DocumentFragment
 */
export interface INsNodeSequence {
  firstChild: INsNode;
  lastChild: INsNode;
  /**
   * The nodes of this sequence.
   */
  children: ReadonlyArray<INsNode>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ReadonlyArray<INsNode>;

  /**
   * Insert this sequence as a sibling before refNode
   */
  insertBefore(refNode: INsNode): void;

  /**
   * Append this sequence as a child to parent
   */
  appendTo(parent: INsNode): void;

  /**
   * Remove this sequence from its parent.
   */
  remove(): void;
}


// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: INsNodeSequence = {
  firstChild: null,
  lastChild: null,
  children: PLATFORM.emptyArray,
  findTargets(): ReturnType<INsNodeSequence['findTargets']> { return PLATFORM.emptyArray; },
  insertBefore(refNode: INsNode): ReturnType<INsNodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: INsNode): ReturnType<INsNodeSequence['appendTo']> { /*do nothing*/ },
  remove(): ReturnType<INsNodeSequence['remove']> { /*do nothing*/ }
};

export const NsNodeSequence = {
  empty: emptySequence
};

/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-marker` node
 * - text is the actual text node
 */
export class NsTextNodeSequence implements INsNodeSequence {
  public firstChild: INsNode;
  public lastChild: INsNode;
  public children: INsNode[];

  private targets: ReadonlyArray<INsNode>;

  constructor(text: INsNode) {
    this.firstChild = text;
    this.lastChild = text;
    this.children = [text];
    this.targets = [new AuMarker(text)];
  }

  public findTargets(): ReadonlyArray<INsNode> {
    return this.targets;
  }

  public insertBefore(refNode: INsNode): void {
    NsDOM.insertBefore(this.firstChild, refNode);
    // refNode.parent.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: INsNode): void {
    // parent.addChild(this.firstChild);
    NsDOM
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
export class NsFragmentNodeSequence implements INsNodeSequence {
  public firstChild: INsNode;
  public lastChild: INsNode;
  public children: ReadonlyArray<INsNode>;

  private fragment: DocumentFragment;
  private targets: ReadonlyArray<INsNode>;

  private start: INsRenderLocation;
  private end: INsRenderLocation;

  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    const targetNodeList: INsNode[] = [];
    const nsNodes = this.children = nodesToNsViews(fragment.childNodes, null, targetNodeList);
    console.log('=============================\nNS Node count:', nsNodes.length);
    console.log(nsNodes[0].typeName);
    // tslint:disable-next-line:no-any
    // const targetNodeList = fragment.querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    const targets = this.targets = Array(ii);
    while (i < ii) {
      // eagerly convert all markers to IRenderLocations (otherwise the renderer
      // will do it anyway) and store them in the target list (since the comments
      // can't be queried)
      const target = targetNodeList[i];
      if (target.nodeName === 'au-marker') {
        // note the renderer will still call this method, but it will just return the
        // location if it sees it's already a location
        targets[i] = NsDOM.convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }
    // const childNodeList = fragment.childNodes;
    // i = 0;
    // ii = childNodeList.length;
    // const childNodes = this.children = Array(ii);
    // while (i < ii) {
    //   childNodes[i] = childNodeList[i] as Writable<INode>;
    //   ++i;
    // }

    const nodeCount = nsNodes.length;
    this.firstChild = nodeCount > 0 ? nsNodes[0] : null;
    this.lastChild = nodeCount > 0 ? nsNodes[nodeCount - 1] : null;

    this.start = this.end = null;
  }

  public findTargets(): ReadonlyArray<INsNode> {
    // tslint:disable-next-line:no-any
    return this.targets;
  }

  public insertBefore(refNode: INsNode): void {
    // tslint:disable-next-line:no-any
    const children = this.children;
    while (children.length > 0) {
      NsDOM.insertBefore(children[0], refNode);
    }
    // internally we could generally assume that this is an IRenderLocation,
    // but since this is also public API we still need to double check
    // (or horrible things might happen)
    if (isRenderLocation(refNode)) {
      this.end = refNode;
      const start = this.start = refNode.$start;
      // if (start.$nodes === null) {
      //   start.$nodes = this;
      // } else {
      //   // if more than one NodeSequence uses the same RenderLocation, it's an child
      //   // of a repeater (or something similar) and we shouldn't remove all nodes between
      //   // start - end since that would always remove all items from a repeater, even
      //   // when only one is removed
      //   // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
      //   // occupied and 2) prevent start.$nodes === this from ever evaluating to true
      //   // during remove()
      //   start.$nodes = PLATFORM.emptyObject;
      // }
    }
  }

  public appendTo(parent: INsNode): void {
    // tslint:disable-next-line:no-any
    // (<any>parent).appendChild(this.fragment);
    // parent.addChild(...this.children);
    // if (this.children.length === 1 && this.children[0].typeName === 'Page') {
      
    // }
    this.children.forEach(c => NsDOM.appendChild(c, parent));
    // this can never be a RenderLocation, and if for whatever reason we moved
    // from a RenderLocation to a host, make sure "start" and "end" are null
    this.start = this.end = null;
  }

  public remove(): void {
    // const fragment = this.fragment;
    // if (this.start !== null && this.start.$nodes === this) {
    //   // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
    //   // repeater with a single item) then simply remove everything in-between (but not
    //   // the comments themselves as they belong to the parent)
    //   const end = this.end;
    //   let next: IPixiNode;
    //   let current = this.start.nextSibling;
    //   while (current !== end) {
    //     next = current.nextSibling;
    //     // tslint:disable-next-line:no-any
    //     (<any>fragment).appendChild(current);
    //     current = next;
    //   }
    //   this.start.$nodes = null;
    //   this.start = this.end = null;
    // } else {
    //   // otherwise just remove from first to last child in the regular way
    //   let current = this.firstChild;

    //   if (current.parentNode !== fragment) {
    //     const end = this.lastChild;
    //     let next: INode;

    //     while (current !== null) {
    //       next = current.nextSibling;
    //       // tslint:disable-next-line:no-any
    //       (<any>fragment).appendChild(current);

    //       if (current === end) {
    //         break;
    //       }

    //       current = next;
    //     }
    //   }
    // }
  }
}

export interface INsNodeSequenceFactory {
  createNodeSequence(): INsNodeSequence;
}

export class NsNodeSequenceFactory {
  private readonly deepClone: boolean;
  private readonly node: DocumentFragment | Text;
  private readonly Type: Constructable;
  constructor(fragment: DocumentFragment) {
    const childNodes = fragment.childNodes;
    switch (childNodes.length) {
      case 0:
        this.createNodeSequence = () => NsNodeSequence.empty;
        return;
      case 2:
        const target = childNodes[0];
        if (target.nodeName === 'AU-MARKER' || target.nodeName === '#comment') {
          const text = childNodes[1];
          if (text.nodeType === NodeTypes.TEXT && text.textContent === ' ') {
            text.textContent = '';
            this.deepClone = false;
            this.node = text as Text;
            this.Type = NsTextNodeSequence;
            return;
          }
        }
      // falls through if not returned
      default:
        this.deepClone = true;
        this.node = fragment;
        this.Type = NsFragmentNodeSequence;
    }
  }

  public static createFor(markupOrNode: string | INode): NsNodeSequenceFactory {
    const fragment = NsDOM.createDocumentFragment(markupOrNode);
    return new NsNodeSequenceFactory(fragment);
  }

  public createNodeSequence(): INsNodeSequence {
    return new this.Type(this.node);
  }
}

const enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}

function nodesToNsViews(nodes: Node | Node[], parent: INsNode = null, targets: INsNode[] = []): INsNode[] {
  const results = [];
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }
  for (let i = 0, ii = nodes.length; ii > i; ++i) {
    const node = nodes[i];
    let nsView: INsNode | null = null;
    console.log(node.nodeType);
    if (!node.nodeType) {
      throw new Error('No node type????');
    }
    switch (node.nodeType) {
      case NodeTypes.ELEMENT:
        const nodeName = nodes[i].nodeName;
        nsView = NsDOM.createElement(nodeName);
        nsView.nodeName = nodeName;
        if ((node as Element).classList.contains('au')) {
          targets.push(nsView);
        }
        break;
      // case NodeTypes.TEXT:
      //   nsView = NsDOM.createTextNode(node.textContent);
      //   nsView.nodeName = '#text';
      //   break;
    }
    if (nsView === null) {
      continue;
    } else {
      results.push(nsView);
    }
    if (parent !== null) {
      NsDOM.appendChild(nsView, parent);
      // parent.addChild(pixiElement);
    }
    if (node.childNodes.length > 0) {
      // if (nsView instanceof PIXI.Container) {
      nodesToNsViews(node.childNodes, nsView, targets);
      // } else {
      //   throw new Error(
      //     `Invalid object model. ${node.nodeName.toLowerCase()} is not an instance of PIXI.Container. Cannot have childnodes`
      //   );
      // }
    }
  }
  return results;
}


/*@internal*/
export class AuMarker extends View implements INsNode {
  public readonly nodeName: 'au-marker';
  public readonly nodeType: NodeTypes.ELEMENT;
  public textContent: string = '';

  private nextNode: INsNode;

  constructor(next: INsNode) {
    super();
    this.nextNode = next;
  }
  public remove(): void { /* do nothing */ }

  get nextSibling() {
    return this.nextNode;
  }
}
(proto => {
  // proto.previousSibling = null;
  // proto.firstChild = null;
  // proto.lastChild = null;
  // proto.children = PLATFORM.emptyArray;
  proto.nodeName = 'au-marker';
  proto.nodeType = NodeTypes.ELEMENT;
})(<Writable<AuMarker>>AuMarker.prototype);


