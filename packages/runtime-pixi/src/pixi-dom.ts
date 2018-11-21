/// <reference path="./pixi-dom.d.ts" />
import { PLATFORM, Constructable, DI, Writable } from '@aurelia/kernel';

function isRenderLocation(node: IPixiNode): node is IPixiRenderLocation {
  return node.textContent === 'au-end';
}

const PixiDomMap: Record<string, () => PIXI.DisplayObject> = {};
export const PixiDOM = new class {

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
    return PixiDOM.createTemplate(<string>markupOrNode).content;
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
    const locationEnd = PixiDOM.createComment('au-end') as IPixiRenderLocation;
    const locationStart = PixiDOM.createComment('au-start') as IPixiRenderLocation;
    PixiDOM.replaceNode(locationEnd, node);
    PixiDOM.insertBefore(locationStart, locationEnd);
    locationEnd.$start = locationStart;
    // locationStart.$nodes = null;
    return locationEnd
  }

  /**
   * Create basic node of a PIXI DOM
   */
  createComment(text: string): IPixiNode {
    const dObj = new PIXI.DisplayObject() as IPixiNode;
    dObj.nodeName = '#comment';
    dObj.textContent = text;
    return dObj;
  }

  createElement(tagName: 'container'): PIXI.Container;
  createElement(tagName: 'div'): PIXI.Container;
  createElement(tagName: 'b'): PIXI.Text;
  createElement(tagName: 'au-marker'): PIXI.Text;
  createElement(tagName: 'au-m'): PIXI.Text;
  createElement(tagName: 'button'): PIXI.Sprite;
  createElement(tagName: string): PIXI.DisplayObject;
  createElement(tagName: string): PIXI.DisplayObject {
    return PixiDomMap[tagName]();
  }

  remove<T extends PIXI.DisplayObject = PIXI.DisplayObject>(node: T): T | null {
    if (node.parent) {
      node.parent.removeChild(node);
      return node;
    }
    return null;
  }

  replaceNode(newNode: IPixiNode, refNode: IPixiNode) {
    refNode.parent.insertBefore(newNode, refNode);
    refNode.parent.removeChild(refNode);
    return newNode;
  }

  insertBefore(newNode: IPixiNode, refNode: IPixiNode) {
    refNode.parent.insertBefore(newNode, refNode);
    return newNode;
  }

  map(tagName: string, ctor: (() => PIXI.DisplayObject)): void {
    if (tagName in PixiDomMap) {
      throw new Error(`Pixi element with the same name "${tagName}" already exists`);
    }
    PixiDomMap[tagName] = ctor;
  }

  nodesToPixiElements = nodesToPixiElements;
  
  treatAsNonWhitespace(node: IPixiNode): void {
    // see isAllWhitespace above
    (<any>node).auInterpolationTarget = true;
  }
};

// Pre map common tag names to PIXI element
(map => {
  map('container', () => new PIXI.Container());
  map('div', () => new PIXI.Container);
  map('b', () => {
    const text = new PIXI.Text();
    text.style.fontWeight = 'bold';
    return text;
  });
  map('au-marker', () => new PIXI.Text());
  map('text', () => new PIXI.Text());
  map('button', () => {
    return new PIXI.Sprite();
  });
})(PixiDOM.map);

export interface IPixiNode extends PIXI.DisplayObject {

}


export const IPixiRenderLocation = DI.createInterface<IPixiRenderLocation>().noDefault();
export interface IPixiRenderLocation extends IPixiNode {
  $start: IPixiRenderLocation;
  $nodes: IPixiNodeSequence;
}


/**
 * Represents a DocumentFragment
 */
export interface IPixiNodeSequence {
  firstChild: PIXI.DisplayObject;
  lastChild: PIXI.DisplayObject;
  /**
   * The nodes of this sequence.
   */
  children: ReadonlyArray<IPixiNode>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ReadonlyArray<IPixiNode>;

  /**
   * Insert this sequence as a sibling before refNode
   */
  insertBefore(refNode: IPixiNode): void;

  /**
   * Append this sequence as a child to parent
   */
  appendTo(parent: PIXI.Container): void;

  /**
   * Remove this sequence from its parent.
   */
  remove(): void;
}


// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: IPixiNodeSequence = {
  firstChild: null,
  lastChild: null,
  children: PLATFORM.emptyArray,
  findTargets(): ReturnType<IPixiNodeSequence['findTargets']> { return PLATFORM.emptyArray; },
  insertBefore(refNode: IPixiNode): ReturnType<IPixiNodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: PIXI.Container): ReturnType<IPixiNodeSequence['appendTo']> { /*do nothing*/ },
  remove(): ReturnType<IPixiNodeSequence['remove']> { /*do nothing*/ }
};

export const PixiNodeSequence = {
  empty: emptySequence
};

/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-marker` node
 * - text is the actual text node
 */
export class PixiTextNodeSequence implements IPixiNodeSequence {
  public firstChild: IPixiNode;
  public lastChild: IPixiNode;
  public children: IPixiNode[];

  private targets: ReadonlyArray<IPixiNode>;

  constructor(text: IPixiNode) {
    this.firstChild = text;
    this.lastChild = text;
    this.children = [text];
    this.targets = [new AuMarker(text)];
  }

  public findTargets(): ReadonlyArray<IPixiNode> {
    return this.targets;
  }

  public insertBefore(refNode: IPixiNode): void {
    refNode.parent.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: PIXI.Container): void {
    parent.addChild(this.firstChild);
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
export class FragmentNodeSequence implements IPixiNodeSequence {
  public firstChild: IPixiNode;
  public lastChild: IPixiNode;
  public children: ReadonlyArray<IPixiNode>;

  private fragment: DocumentFragment;
  private targets: ReadonlyArray<IPixiNode>;

  private start: IPixiRenderLocation;
  private end: IPixiRenderLocation;

  constructor(fragment: DocumentFragment) {
    this.fragment = fragment;
    const targetNodeList: PIXI.DisplayObject[] = [];
    const pixiNodes = this.children = nodesToPixiElements(fragment.childNodes, null, targetNodeList);
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
        targets[i] = PixiDOM.convertToRenderLocation(target);
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

    const nodeCount = pixiNodes.length;
    this.firstChild = nodeCount > 0 ? pixiNodes[0] : null;
    this.lastChild = nodeCount > 0 ? pixiNodes[nodeCount - 1] : null;

    this.start = this.end = null;
  }

  public findTargets(): ReadonlyArray<IPixiNode> {
    // tslint:disable-next-line:no-any
    return this.targets;
  }

  public insertBefore(refNode: IPixiNode): void {
    // tslint:disable-next-line:no-any
    const children = this.children;
    while (children.length > 0) {
      refNode.parent.insertBefore(children[0], refNode);
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

  public appendTo(parent: PIXI.Container): void {
    // tslint:disable-next-line:no-any
    (<any>parent).appendChild(this.fragment);
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

export interface IPixiNodeSequenceFactory {
  createNodeSequence(): IPixiNodeSequence;
}

export class PixiNodeSequenceFactory {
  private readonly deepClone: boolean;
  private readonly node: DocumentFragment | Text;
  private readonly Type: Constructable;
  constructor(fragment: DocumentFragment) {
    const childNodes = fragment.childNodes;
    switch (childNodes.length) {
      case 0:
        this.createNodeSequence = () => PixiNodeSequence.empty;
        return;
      case 2:
        const target = childNodes[0];
        if (target.nodeName === 'AU-MARKER' || target.nodeName === '#comment') {
          const text = childNodes[1];
          if (text.nodeType === NodeTypes.TEXT && text.textContent === ' ') {
            text.textContent = '';
            this.deepClone = false;
            this.node = text as Text;
            this.Type = PixiTextNodeSequence;
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

  public static createFor(markupOrNode: string | Node): PixiNodeSequenceFactory {
    const fragment = PixiDOM.createDocumentFragment(markupOrNode);
    return new PixiNodeSequenceFactory(fragment);
  }

  public createNodeSequence(): IPixiNodeSequence {
    return new this.Type(nodesToPixiElements(this.node));
  }
}

const enum NodeTypes {
  ELEMENT = 1,
  TEXT = 3,
}

function nodesToPixiElements(nodes: Node | Node[] | NodeListOf<Node>, parent: PIXI.Container = null, targets: PIXI.DisplayObject[] = []): PIXI.DisplayObject[] {
  const results = [];
  if (!Array.isArray(nodes) && !(nodes instanceof NodeList)) {
    nodes = [nodes];
  }
  for (let i = 0, ii = nodes.length; ii > i; ++i) {
    const node = nodes[i];
    let pixiElement: PIXI.DisplayObject | null = null;
    switch (node.nodeType) {
      case NodeTypes.ELEMENT:
        const nodeName = nodes[i].nodeName.toLowerCase();
        pixiElement = PixiDOM.createElement(nodeName);
        pixiElement.nodeName = nodeName;
        if ((node as Element).classList.contains('au')) {
          targets.push(pixiElement);
        }
        break;
      case NodeTypes.TEXT:
        pixiElement = new PIXI.Text(node.textContent);
        pixiElement.nodeName = '#text';
        break;
    }
    if (pixiElement === null) {
      continue;
    }
    if (parent !== null) {
      parent.addChild(pixiElement);
    }
    if (node.childNodes.length > 0) {
      if (pixiElement instanceof PIXI.Container) {
        nodesToPixiElements(node.childNodes, pixiElement, targets);
      } else {
        throw new Error(
          `Invalid object model. ${node.nodeName.toLowerCase()} is not an instance of PIXI.Container. Cannot have childnodes`
        );
      }
    }
  }
  return results;
}


/*@internal*/
export class AuMarker extends PIXI.DisplayObject {
  public readonly nodeName: 'au-marker';
  public readonly nodeType: NodeTypes.ELEMENT;
  public textContent: string = '';

  private nextNode: IPixiNode;

  constructor(next: IPixiNode) {
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

