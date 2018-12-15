import { EventTarget } from "./EventTarget";

const emptyNodesArray = Object.freeze([]) as VNode[];
const emptyObject = Object.freeze({}) as Record<string, any>;
export class VNode<T = any> extends EventTarget {

  static invokeNativeObject: (node: VNode<any>, ...args: any[]) => void;

  static appendChild: (node: VNode<any>, parentNode: VNode<any>) => void;

  nativeObject: T;
  nodeName: string;

  parentNode: VNode<T> | null;
  childNodes: VNode[];
  attributes: Record<string, any>;
  isTarget: boolean;
  text: string;

  private invoked: boolean;

  constructor(name: string, isTarget: boolean = false) {
    super();
    this.nodeName = name;
    this.parentNode = null;
    this.childNodes = emptyNodesArray;
    this.attributes = emptyObject;
    this.isTarget = isTarget;
    this.invoked = false;
  }

  invokeNativeObject(): T {
    if (this.invoked !== true) {
      this.invoked = true;
      VNode.invokeNativeObject(this);
    }
    return this.nativeObject;
  }

  setAttribute(name: string, value: string): void {
    let attributes = this.attributes;
    if (attributes === emptyObject) {
      attributes = this.attributes = {};
    }
    attributes[name] = value;
  }

  getAttribute(name: string): any {
    return this.attributes[name];
  }

  removeAttribute(name: string): void {
    delete this.attributes[name];
  }

  hasAttribute(name: string): boolean {
    return name in this.attributes;
  }

  appendChild(node: VNode<T>): VNode<T> {
    let childNodes = this.childNodes;
    if (childNodes === emptyNodesArray) {
      childNodes = this.childNodes = [];
    }
    childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  insertBefore(node: VNode<T>, refNode: VNode<T>): VNode<T> {
    if (refNode.parentNode !== this) {
      throw new Error('Referenced node is not a child node');
    }
    let childNodes = this.childNodes;
    if (childNodes === emptyNodesArray) {
      childNodes = this.childNodes = [];
    }
    let idx = childNodes.indexOf(refNode);
    childNodes.splice(idx, 0, node);
    node.parentNode = this;
    return node;
  }

  removeChild(node: VNode<T>): VNode<T> {
    let childNodes = this.childNodes;
    let idx = childNodes.indexOf(node);
    if (idx !== -1) {
      childNodes.splice(idx, 1);
    } else {
      throw new Error('Node to remove is not a child node');
    }
    node.parentNode = null;
    return node;
  }

  replaceChild(node: VNode<T>, refNode: VNode<T>): VNode<T> {
    let childNodes = this.childNodes;
    let idx = childNodes.indexOf(refNode);
    if (idx !== -1) {
      childNodes.splice(idx, 1, node);
    } else {
      throw new Error('Referenced node is not a child node');
    }
    return node;
  }

  replaceWith(node: VNode<T>): VNode<T> {
    if (!this.parentNode) {
      throw new Error('This node is not attached to any parent');
    }
    this.parentNode.replaceChild(node, this);
    return node;
  }

  get firstChild(): VNode<T> | null {
    let childNodes = this.childNodes;
    if (childNodes.length > 0) {
      return childNodes[0];
    }
    return null;
  }

  get lastChild(): VNode<T> | null {
    let childNodes = this.childNodes;
    if (childNodes.length > 0) {
      return childNodes[childNodes.length - 1];
    }
    return null;
  }

  get nextSibling(): VNode<T> | null {
    let parent = this.parentNode;
    if (parent !== null) {
      let parentChildNodes = parent.childNodes;
      let idx = parentChildNodes.indexOf(this);
      if (idx !== -1 && idx < parentChildNodes.length - 1) {
        return parentChildNodes[idx + 1];
      }
    }
    return null;
  }

  get previousSibling(): VNode<T> | null {
    let parent = this.parentNode;
    if (parent !== null) {
      let parentChildNodes = parent.childNodes;
      let idx = parentChildNodes.indexOf(this);
      if (idx !== -1 && idx > 0) {
        return parentChildNodes[idx - 1];
      }
    }
    return null;
  }

  cloneNode(deep?: boolean) {
    let node = new VNode(this.nodeName, this.isTarget);
    if (deep) {
      let childNodes = this.childNodes;
      for (let i = 0, ii = childNodes.length; ii > i; ++i) {
        node.appendChild(childNodes[i].cloneNode(deep));
      }
    }
    return node;
  }

  remove() {
    let parent = this.parentNode;
    if (parent !== null) {
      parent.removeChild(this);
    }
  }
}
