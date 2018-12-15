/// <reference path="./fabric-types.d.ts" />
import { PLATFORM, DI, Constructable, Writable, IContainer, IResolver } from '../kernel';
import { INode, DOM } from './dom';
import { I3VNode, ThreeObject } from './three-vnode';
import { VNode } from 'dom/node';
import * as Threejs from 'three';

function isRenderLocation(node: I3VNode): node is IFabricRenderLocation {
  return node instanceof VNode && node.nodeName === '#comment' && node.text === 'au-end';
}

const FabricDomMap: Record<string, (node?: Element) => I3VNode> = {};
export const ThreejsDOM = new class {
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
    return ThreejsDOM.createTemplate(<string>markupOrNode).content;
  }
  createTemplate(markup?: string): HTMLTemplateElement {
    if (markup === undefined) {
      return document.createElement('template');
    }
    const template = document.createElement('template');
    template.innerHTML = markup;
    return template;
  }
  convertToRenderLocation(node: I3VNode) {
    if (isRenderLocation(node)) {
      // it's already a RenderLocation (converted by FragmentNodeSequence)
      return node;
    }
    if (!node.parentNode) {
      throw new Error('No parent???');
    }
    const locationEnd = ThreejsDOM.createComment('au-end') as IFabricRenderLocation;
    const locationStart = ThreejsDOM.createComment('au-start') as IFabricRenderLocation;
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
  createComment(text: string): I3VNode {
    const dObj: I3VNode = new VNode('#comment', false);
    dObj.text = text;
    return dObj;
  }
  createTextNode(text: string): I3VNode {
    const textNode: I3VNode = new VNode('#text', false);
    textNode.text = text;
    return textNode;
  }
  // createElement(tagName: 'Text'): TextBase;
  // createElement(tagName: 'Button'): Button;
  // createElement(tagName: 'Frame'): Frame;
  createElement(tagName: string, node?: Element): I3VNode;
  createElement(tagName: string, node?: Element): I3VNode {
    if (!(tagName in FabricDomMap)) {
      console.log(Object.keys(FabricDomMap));
      throw new Error('There is no element with ' + tagName + ' registered');
    }
    let fabricNode: I3VNode = FabricDomMap[tagName](node);
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
  replaceNode(newNode: I3VNode, refNode: I3VNode) {
    ThreejsDOM.insertBefore(newNode, refNode);
    refNode.remove();
    // refNode.parent.insertBefore(newNode, refNode);
    // refNode.parent.removeChild(refNode);
    return newNode;
  }
  insertBefore<T extends I3VNode = I3VNode>(newNode: T, refNode: I3VNode): T {
    const parentNode = refNode.parentNode;
    if (!parentNode) {
      throw new Error('No parent');
    }
    parentNode.insertBefore(newNode, refNode);
    return newNode;
  }
  // appendChild<T extends IFabricNode = IFabricNode>(node: T, parentNode: IFabricNode): T {
  //   if (FabricDOM.isCollection(parentNode)) {
  //     parentNode.add(node);
  //   } else {
  //     throw new Error(`Cannot add ${node.nodeName} node to ${parentNode.nodeName} node`);
  //   }
  //   return node;
  // }
  // isNodeInstance(node: any): node is IFabricVNode {
  //   return node instanceof fabric.Object;
  // }
  isObject3D(node: ThreeObject): node is THREE.Object3D {
    return (node as THREE.Object3D).isObject3D === true;
  }
  map(tagName: string, ctor: ((node?: Element) => I3VNode)): void {
    if (tagName in FabricDomMap) {
      throw new Error(`Element with the same name "${tagName}" already exists`);
    }
    FabricDomMap[tagName] = ctor;
  }

  treatAsNonWhitespace(node: IFabricNode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  }
};

export const IFabricNode = DI.createInterface<IFabricNode>().noDefault();
export interface IFabricNode {
  nodeType?: number;
  nodeName?: string;
  textContent?: string;
  firstChild?: IFabricNode | null;
  lastChild?: IFabricNode | null;
  nextSibling?: IFabricNode | null;
  previousSibling?: IFabricNode | null;
}
export const IFabricRenderLocation = DI.createInterface<IFabricRenderLocation>().noDefault();
export interface IFabricRenderLocation extends I3VNode {
  $start: IFabricRenderLocation;
  $nodes: IFabricNodeSequence;
}
/**
* Represents a DocumentFragment
*/
export interface IFabricNodeSequence {
  firstChild: I3VNode;
  lastChild: I3VNode;
  /**
   * The nodes of this sequence.
   */
  children: ReadonlyArray<Node | I3VNode>;
  /**
  * Find all instruction targets in this sequence.
  */
  findTargets(): ReadonlyArray<I3VNode>;
  /**
  * Insert this sequence as a sibling before refNode
  */
  insertBefore(refNode: I3VNode): void;
  /**
  * Append this sequence as a child to parent
  */
  appendTo(parent: I3VNode): void;
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
  insertBefore(refNode: I3VNode): ReturnType<IFabricNodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: I3VNode): ReturnType<IFabricNodeSequence['appendTo']> { /*do nothing*/ },
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
  public firstChild: I3VNode;
  public lastChild: I3VNode;
  public children: I3VNode[];
  private targets: ReadonlyArray<I3VNode>;
  constructor(text: I3VNode) {
    this.firstChild = text;
    this.lastChild = text;
    this.children = [text];
    this.targets = [];
    // this.targets = [new AuMarker(text)];
  }
  public findTargets(): ReadonlyArray<I3VNode> {
    return this.targets;
  }
  public insertBefore(refNode: I3VNode): void {
    ThreejsDOM.insertBefore(this.firstChild, refNode);
    // refNode.parent.insertBefore(this.firstChild, refNode);
  }
  public appendTo(parent: I3VNode): void {
    // parent.addChild(this.firstChild);
    ThreejsDOM
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
export class ThreeFragmentNodeSequence implements IFabricNodeSequence {
  public firstChild: I3VNode;
  public lastChild: I3VNode;
  public children: ReadonlyArray<Node>;
  private fragment: DocumentFragment;
  private targets: ReadonlyArray<I3VNode>;
  private start: IFabricRenderLocation;
  private end: IFabricRenderLocation;
  private vNodes: I3VNode[];
  private inited: boolean;
  private rendererRoots: string[];

  constructor(fragment: DocumentFragment, rendererRoots: string[]) {
    this.inited = false;
    this.fragment = fragment.cloneNode(true) as DocumentFragment;
    this.rendererRoots = rendererRoots;
  }

  private init(): void {
    if (this.inited) {
      return;
    }
    this.inited = true;
    let fragment = this.fragment;
    let targetNodes: I3VNode[] = [];
    let rootVNodes: I3VNode[] = [];
    nodeTo3VNodes(fragment, fragment.childNodes, null, targetNodes, this.rendererRoots, rootVNodes);
    this.vNodes = rootVNodes;
    let i = 0;
    let ii = targetNodes.length;
    const targets = this.targets = Array(ii);
    while (i < ii) {
      // eagerly convert all markers to IRenderLocations (otherwise the renderer
      // will do it anyway) and store them in the target list (since the comments
      // can't be queried)
      const target = targetNodes[i];
      if (target.nodeName === 'au-marker') {
        // note the renderer will still call this method, but it will just return the
        // location if it sees it's already a location
        targets[i] = ThreejsDOM.convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }
    rootVNodes.forEach(node => node.invokeNativeObject());
    
    const childNodeList = fragment.childNodes;
    i = 0;
    ii = childNodeList.length;
    const childNodes = this.children = Array(ii);
    while (i < ii) {
      childNodes[i] = childNodeList[i] as Writable<INode>;
      ++i;
    }

    const nodeCount = rootVNodes.length;
    this.firstChild = nodeCount > 0 ? rootVNodes[0] : null;
    this.lastChild = nodeCount > 0 ? rootVNodes[nodeCount - 1] : null;
    this.start = this.end = null;
  }

  public findTargets(): ReadonlyArray<I3VNode> {
    this.init();
    // if (!this.targets)
    // tslint:disable-next-line:no-any
    return this.targets;
  }

  public insertBefore(refNode: I3VNode): void {
    this.init();
    // tslint:disable-next-line:no-any
    const children = this.vNodes;
    for (let i = 0, ii = children.length; ii > i; ++i) {
      ThreejsDOM.insertBefore(children[i], refNode);
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

  public appendTo(parent: Node | I3VNode): void {
    this.init();
    // tslint:disable-next-line:no-any
    // (<any>parent).appendChild(this.fragment);
    if (DOM.isNodeInstance(parent)) {
      for (const child of this.children) {
        parent.appendChild(child);
      }
    }
    // if (this.children.length === 1 && this.children[0].typeName === 'Page') {

    // }

    this.vNodes.forEach(c => {
      if (c.parentNode) {
        VNode.appendChild(c, c.parentNode);
      } else {
        // c doesn not have a parent node means it's a renderer root && direct child of a template
        // then append to means it should append to parent. so wrap it in a vnode and boom
        let parentNodeName = parent.nodeName.toLowerCase();
        let parentVNode = new VNode(parentNodeName, false);
        parentVNode.nativeObject = parent;
        parentVNode.appendChild(c);
        VNode.appendChild(c, parentVNode);
      }
    });
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
export interface IThreeJsNodeSequenceFactory {
  createNodeSequence(): IFabricNodeSequence;
}
export class ThreeJsNodeSequenceFactory {
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
        this.Type = ThreeFragmentNodeSequence;
    }
  }
  public static createFor(markupOrNode: string | INode): ThreeJsNodeSequenceFactory {
    const fragment = ThreejsDOM.createDocumentFragment(markupOrNode);
    return new ThreeJsNodeSequenceFactory(fragment);
  }
  public createNodeSequence(): IFabricNodeSequence {
    return new this.Type(this.node, ['t-webgl', 't-canvas']);
  }
}

const enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}

function nodeTo3VNodes(
  nodesOwner: DocumentFragment,
  nodes: Node[] | ArrayLike<Node>,
  parent: I3VNode | null,
  targets: (I3VNode | Node)[],
  customRendererTargetRootNames: ReadonlyArray<string>,
  customRendererTargetRoots: I3VNode[],
  /**
   * @internal Determine whether it should treat the 1 arguments as special list
   */
  insideVNodeTree?: boolean
): void {
  for (let i = 0, ii = nodes.length; ii > i; ++i) {
    const node = nodes[i];
    if (!node.nodeType) {
      throw new Error('No node type????');
    }
    switch (node.nodeType) {
      case NodeTypes.ELEMENT:
        const nodeName = nodes[i].nodeName;
        const attributes = (node as Element).attributes;
        const isTarget = (node as Element).classList.contains('au');
        if (!insideVNodeTree) {
          if (customRendererTargetRootNames.includes(nodeName.toLowerCase())) {
            // a Root vNode
            let threeVNode: I3VNode = new VNode(nodeName.toLowerCase(), isTarget);
            for (let i = 0, ii = attributes.length; ii > i; ++i) {
              const { value, name }  = attributes[i];
              threeVNode.setAttribute(name, value);
            }
            if (isTarget) {
              targets.push(threeVNode);
            }
            customRendererTargetRoots.push(threeVNode);
            if (parent !== null) {
              throw new Error('Invalid render root. Cannot be nested inside another root');
            }
            if (node.parentNode !== nodesOwner) {
              let parentNodeName = node.nodeName.toLowerCase();
              let fakeParentVNode = new VNode(parentNodeName, false);
              fakeParentVNode.appendChild(threeVNode);
              fakeParentVNode.nativeObject = node;
            }
            if (node.childNodes.length > 0) {
              nodeTo3VNodes(nodesOwner, node.childNodes, threeVNode, targets, customRendererTargetRootNames, customRendererTargetRoots, true);
            }
            i--;
            ii--;
            node.parentNode.removeChild(node);
          } else {
            if (isTarget) {
              targets.push(node);
            }
            nodeTo3VNodes(nodesOwner, node.childNodes, null, targets, customRendererTargetRootNames, customRendererTargetRoots, false);
          }
        } else {
          let threeVNode: I3VNode = new VNode(nodeName.toLowerCase(), isTarget);
          for (let i = 0, ii = attributes.length; ii > i; ++i) {
            const { value, name }  = attributes[i];
            threeVNode.setAttribute(name, value);
          }
          if (parent === null) {
            throw new Error('Invalid operation. Expected a parent when already inside a vnode tree');
          }
          // debugger;
          parent.appendChild(threeVNode);
          // if it's a normal node, then there is nothing to do beside pushing the node to target list
          // if it's a target node
          if (isTarget) {
            targets.push(threeVNode);
          }
          nodeTo3VNodes(nodesOwner, node.childNodes, threeVNode, targets, customRendererTargetRootNames, customRendererTargetRoots, true);
        }
        break;
      // case NodeTypes.TEXT:
      //   if (node.textContent.trim() !== '') {
      //     fabricVNode = new VNode('#text', false);
      //   }
      //   break;
    }
  }
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