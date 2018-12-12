/// <reference path="./fabric-types.d.ts" />
import { PLATFORM, DI, Constructable, Writable, IContainer, IResolver } from '../kernel';
import { INode } from './dom';
import { IFabricVNode } from './fabric-vnode';
import { VNode } from 'dom/node';


function isRenderLocation(node: IFabricVNode): node is IFabricRenderLocation {
  return node instanceof VNode && node.nodeName === '#comment' && node.text === 'au-end';
}

const FabricDomMap: Record<string, (node?: Element) => IFabricVNode> = {};
export const FabricDOM = new class {
  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(IFabricNode, resolver);
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
    return FabricDOM.createTemplate(<string>markupOrNode).content;
  }
  createTemplate(markup?: string): HTMLTemplateElement {
    if (markup === undefined) {
      return document.createElement('template');
    }
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template;
  }
  convertToRenderLocation(node: IFabricVNode) {
    if (isRenderLocation(node)) {
      // it's already a RenderLocation (converted by FragmentNodeSequence)
      return node;
    }
    if (!node.parentNode) {
      throw new Error('No parent???');
    }
    const locationEnd = FabricDOM.createComment('au-end') as IFabricRenderLocation;
    const locationStart = FabricDOM.createComment('au-start') as IFabricRenderLocation;
    node.replaceWith(locationEnd);
    locationEnd.parentNode.insertBefore(locationStart, locationEnd);
    // FabricDOM.replaceNode(locationEnd, node);
    // FabricDOM.insertBefore(locationStart, locationEnd);
    locationEnd.$start = locationStart;
    // locationStart.$nodes = null;
    return locationEnd;
  }
  /**
  * Create basic node of a PIXI DOM
  */
  createComment(text: string): IFabricVNode {
    const dObj: IFabricVNode = new VNode('#comment', false);
    dObj.text = text;
    return dObj;
  }
  createTextNode(text: string): IFabricVNode {
    const textNode: IFabricVNode = new VNode('#text', false);
    textNode.text = text;
    return textNode;
  }
  // createElement(tagName: 'Text'): TextBase;
  // createElement(tagName: 'Button'): Button;
  // createElement(tagName: 'Frame'): Frame;
  createElement(tagName: string, node?: Element): IFabricVNode;
  createElement(tagName: string, node?: Element): IFabricVNode {
    if (!(tagName in FabricDomMap)) {
      console.log(Object.keys(FabricDomMap));
      throw new Error('There is no element with ' + tagName + ' registered');
    }
    let fabricNode: IFabricVNode = FabricDomMap[tagName](node);
    fabricNode.nodeName = tagName;
    return fabricNode;
  }
  remove<T extends IFabricNode = IFabricNode>(childView: T, parentView?: IFabricNode): T | null {
    // // if (node.parent) {
    // //   node.parent.removeChild(node);
    // //   return node;
    // // }
    // // return null;
    // parentView = parentView || childView.parent as ILibUiNode;
    // if (!parentView) {
    //   return null;
    // }
    // // if (parentNode.meta && typeof parentNode.meta.removeChild === 'function') {
    // //   return parentNode.meta.removeChild(parentNode, childNode)
    // // }

    // // if (childNode.meta.skipAddToDom) {
    // //   return
    // // }

    // // const parentView = parentNode.nativeView
    // // const childView = childNode.nativeView

    // if (isLayout(parentView)) {
    //   parentView.removeChild(childView)
    // } else if (isContentView(parentView)) {
    //   if (parentView.content === childView) {
    //     parentView.content = null
    //   }

    //   if (childView.nodeType === 8 || childView.nodeName === '#comment') {
    //     parentView._removeView(childView);
    //   }
    // } else if (isView(parentView)) {
    //   parentView._removeView(childView);
    // } else {
    //   // throw new Error("Unknown parent type: " + parent);
    // }
    throw new Error('Not easy to remove');
  }
  replaceNode(newNode: IFabricVNode, refNode: IFabricVNode) {
    FabricDOM.insertBefore(newNode, refNode);
    refNode.remove();
    // refNode.parent.insertBefore(newNode, refNode);
    // refNode.parent.removeChild(refNode);
    return newNode;
  }
  insertBefore<T extends IFabricVNode = IFabricVNode>(newNode: T, refNode: IFabricVNode): T {
    const parentNode = refNode.parentNode;
    if (!parentNode) {
      throw new Error('No parent');
    }
    parentNode.insertBefore(newNode, refNode);
    return newNode;
  }
  appendChild<T extends IFabricNode = IFabricNode>(node: T, parentNode: IFabricNode): T {
    if (FabricDOM.isCollection(parentNode)) {
      parentNode.add(node);
    } else {
      throw new Error(`Cannot add ${node.nodeName} node to ${parentNode.nodeName} node`);
    }
    return node;
  }
  isNodeInstance(node: any): node is IFabricVNode {
    return node instanceof fabric.Object;
  }
  map(tagName: string, ctor: ((node?: Element) => IFabricVNode)): void {
    if (tagName in FabricDomMap) {
      throw new Error(`Element with the same name "${tagName}" already exists`);
    }
    FabricDomMap[tagName] = ctor;
  }
  isCollection<T extends IFabricNode>(node: any): node is fabric.ICollection<T> {
    return node instanceof fabric.StaticCanvas || node instanceof fabric.Group;
  }

  treatAsNonWhitespace(node: IFabricNode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  }
};

export const IFabricNode = DI.createInterface<IFabricNode>().noDefault();
export interface IFabricNode extends fabric.Object {
  nodeType?: number;
  nodeName?: string;
  textContent?: string;
  firstChild?: IFabricNode | null;
  lastChild?: IFabricNode | null;
  nextSibling?: IFabricNode | null;
  previousSibling?: IFabricNode | null;
}
export const IFabricRenderLocation = DI.createInterface<IFabricRenderLocation>().noDefault();
export interface IFabricRenderLocation extends IFabricVNode {
  $start: IFabricRenderLocation;
  $nodes: IFabricNodeSequence;
}
/**
* Represents a DocumentFragment
*/
export interface IFabricNodeSequence {
  firstChild: IFabricVNode;
  lastChild: IFabricVNode;
  /**
   * The nodes of this sequence.
   */
  children: ReadonlyArray<IFabricVNode>;
  /**
  * Find all instruction targets in this sequence.
  */
  findTargets(): ReadonlyArray<IFabricVNode>;
  /**
  * Insert this sequence as a sibling before refNode
  */
  insertBefore(refNode: IFabricVNode): void;
  /**
  * Append this sequence as a child to parent
  */
  appendTo(parent: IFabricVNode): void;
  /**
  * Remove this sequence from its parent.
  */
  remove(): void;
}
// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: IFabricNodeSequence = {
  firstChild: null,
  lastChild: null,
  children: PLATFORM.emptyArray,
  findTargets(): ReturnType<IFabricNodeSequence['findTargets']> { return PLATFORM.emptyArray; },
  insertBefore(refNode: IFabricVNode): ReturnType<IFabricNodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: IFabricVNode): ReturnType<IFabricNodeSequence['appendTo']> { /*do nothing*/ },
  remove(): ReturnType<IFabricNodeSequence['remove']> { /*do nothing*/ }
};
export const FabricNodeSequence = {
  empty: emptySequence
};
/**
* An specialized INodeSequence with optimizations for text (interpolation) bindings
* The contract of this INodeSequence is:
* - the previous element is an `au-marker` node
* - text is the actual text node
*/
export class FabricTextNodeSequence implements IFabricNodeSequence {
  public firstChild: IFabricVNode;
  public lastChild: IFabricVNode;
  public children: IFabricVNode[];
  private targets: ReadonlyArray<IFabricVNode>;
  constructor(text: IFabricVNode) {
    this.firstChild = text;
    this.lastChild = text;
    this.children = [text];
    this.targets = [];
    // this.targets = [new AuMarker(text)];
  }
  public findTargets(): ReadonlyArray<IFabricVNode> {
    return this.targets;
  }
  public insertBefore(refNode: IFabricVNode): void {
    FabricDOM.insertBefore(this.firstChild, refNode);
    // refNode.parent.insertBefore(this.firstChild, refNode);
  }
  public appendTo(parent: IFabricVNode): void {
    // parent.addChild(this.firstChild);
    FabricDOM
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
export class FabricFragmentNodeSequence implements IFabricNodeSequence {
  public firstChild: IFabricVNode;
  public lastChild: IFabricVNode;
  public children: ReadonlyArray<IFabricVNode>;
  private fragment: DocumentFragment;
  private targets: ReadonlyArray<IFabricVNode>;
  private start: IFabricRenderLocation;
  private end: IFabricRenderLocation;
  private vNodes: IFabricVNode[];
  private inited: boolean;
  constructor(fragment: DocumentFragment) {
    this.inited = false;
    this.fragment = fragment;
  }

  private init(): void {
    if (this.inited) {
      return;
    }
    this.inited = true;
    let fragment = this.fragment;
    let targetNodeList: IFabricVNode[] = [];
    const vNodes = this.vNodes = nodeToFabricVNodes(fragment.childNodes, null, targetNodeList);
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
        targets[i] = FabricDOM.convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }
    vNodes.forEach(node => node.invokeNativeObject());
    // const childNodeList = fragment.childNodes;
    // i = 0;
    // ii = childNodeList.length;
    // const childNodes = this.children = Array(ii);
    // while (i < ii) {
    //   childNodes[i] = childNodeList[i] as Writable<INode>;
    //   ++i;
    // }
    const nodeCount = vNodes.length;
    this.firstChild = nodeCount > 0 ? vNodes[0] : null;
    this.lastChild = nodeCount > 0 ? vNodes[nodeCount - 1] : null;
    this.start = this.end = null;
  }

  public findTargets(): ReadonlyArray<IFabricVNode> {
    this.init();
    // if (!this.targets)
    // tslint:disable-next-line:no-any
    return this.targets;
  }

  public insertBefore(refNode: IFabricVNode): void {
    this.init();
    // tslint:disable-next-line:no-any
    const children = this.vNodes;
    for (let i = 0, ii = children.length; ii > i; ++i) {
      FabricDOM.insertBefore(children[i], refNode);
    }
    // while (children.length > 0) {
    //   FabricDOM.insertBefore(children[0], refNode);
    // }
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

  public appendTo(parent: IFabricVNode): void {
    this.init();
    // tslint:disable-next-line:no-any
    // (<any>parent).appendChild(this.fragment);
    // parent.addChild(...this.children);
    // if (this.children.length === 1 && this.children[0].typeName === 'Page') {

    // }
    this.vNodes.forEach(c => VNode.appendChild(c, parent));
    // this can never be a RenderLocation, and if for whatever reason we moved
    // from a RenderLocation to a host, make sure "start" and "end" are null
    this.start = this.end = null;
  }

  public remove(): void {
    if (!this.inited) {
      return;
    }
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
export interface IFabricNodeSequenceFactory {
  createNodeSequence(): IFabricNodeSequence;
}
export class FabricNodeSequenceFactory {
  private readonly deepClone: boolean;
  private readonly node: DocumentFragment | Text;
  private readonly Type: Constructable;
  constructor(fragment: DocumentFragment) {
    const childNodes = fragment.childNodes;
    switch (childNodes.length) {
      case 0:
        this.createNodeSequence = () => FabricNodeSequence.empty;
        return;
      case 2:
        const target = childNodes[0];
        if (target.nodeName === 'AU-MARKER' || target.nodeName === '#comment') {
          const text = childNodes[1];
          if (text.nodeType === NodeTypes.TEXT && text.textContent === ' ') {
            text.textContent = '';
            this.deepClone = false;
            this.node = text as Text;
            this.Type = FabricTextNodeSequence;
            return;
          }
        }
      // falls through if not returned
      default:
        this.deepClone = true;
        this.node = fragment;
        this.Type = FabricFragmentNodeSequence;
    }
  }
  public static createFor(markupOrNode: string | INode): FabricNodeSequenceFactory {
    const fragment = FabricDOM.createDocumentFragment(markupOrNode);
    return new FabricNodeSequenceFactory(fragment);
  }
  public createNodeSequence(): IFabricNodeSequence {
    return new this.Type(this.node);
  }
}

const enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}

function nodeToFabricVNodes(nodes: Node[] | ArrayLike<Node>, parent: IFabricVNode | null, targets: IFabricVNode[]): IFabricVNode[] {
  // const results: IFabricNode[] = [];
  const vnodes: IFabricVNode[] = [];
  for (let i = 0, ii = nodes.length; ii > i; ++i) {
    const node = nodes[i];
    let fabricVNode: IFabricVNode | null = null;
    if (!node.nodeType) {
      throw new Error('No node type????');
    }
    switch (node.nodeType) {
      case NodeTypes.ELEMENT:
        const nodeName = nodes[i].nodeName;
        const attributes = (node as Element).attributes;
        const isTarget = (node as Element).classList.contains('au');
        fabricVNode = new VNode(nodeName.toLowerCase(), isTarget);
        for (let i = 0, ii = attributes.length; ii > i; ++i) {
          const { value, name }  = attributes[i];
          fabricVNode.setAttribute(name, value);
        }
        if (isTarget) {
          targets.push(fabricVNode);
        }
        break;
      // case NodeTypes.TEXT:
      //   if (node.textContent.trim() !== '') {
      //     fabricVNode = new VNode('#text', false);
      //   }
      //   break;
    }
    if (fabricVNode === null) {
      continue;
    } else {
      vnodes.push(fabricVNode);
    }
    if (parent !== null) {
      parent.appendChild(fabricVNode);
    }
    if (node.childNodes.length > 0) {
      // if (nsView instanceof PIXI.Container) {
      nodeToFabricVNodes(node.childNodes, fabricVNode, targets);
      // } else {
      //   throw new Error(
      //     `Invalid object model. ${node.nodeName.toLowerCase()} is not an instance of PIXI.Container. Cannot have childnodes`
      //   );
      // }
    }
  }
  // return results;
  return vnodes;
}
/*@internal*/
// export class AuMarker extends View implements ILibUiNode {
//   public readonly nodeName: 'au-marker';
//   public readonly nodeType: NodeTypes.ELEMENT;
//   public textContent: string = '';
//   private nextNode: ILibUiNode;
//   constructor(next: ILibUiNode) {
//     super();
//     this.nextNode = next;
//   }
//   public remove(): void { /* do nothing */ }
//   get nextSibling() {
//     return this.nextNode;
//   }
// }
// (proto => {
//   // proto.previousSibling = null;
//   // proto.firstChild = null;
//   // proto.lastChild = null;
//   // proto.children = PLATFORM.emptyArray;
//   proto.nodeName = 'au-marker';
//   proto.nodeType = NodeTypes.ELEMENT;
// })(<Writable<AuMarker>>AuMarker.prototype);