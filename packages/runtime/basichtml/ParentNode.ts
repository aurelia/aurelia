import { Node } from './Node';
// import { Element } from './Element';
import { querySelectorAll as _querySelectorAll } from './utils';

const childrenType = node => node.nodeType === Node.ELEMENT_NODE;

function asNode(this: Document, node: any) {
  return typeof node === 'object' ?
    node :
    this.createTextNode(node);
}

// export interface ParentNode extends Node {}
// interface ParentNode @ https://dom.spec.whatwg.org/#parentnode
export abstract class ParentNode extends Node {

  get children(): any[] {
    return this.childNodes.filter(childrenType) as any[];
  }

  get firstElementChild() {
    for (let i = 0, length = this.childNodes.length; i < length; i++) {
      let child = this.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) return child;
    }
    return null;
  }

  get lastElementChild() {
    for (let i = this.childNodes.length; i--;) {
      let child = this.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) return child;
    }
    return null;
  }

  get childElementCount() {
    return this.children.length;
  }

  prepend(...nodes: Node[]) {
    const fragment = this.ownerDocument.createDocumentFragment();
    (fragment.childNodes as any).push(...nodes.map(asNode, this.ownerDocument));
    if (this.childNodes.length) {
      this.insertBefore(fragment, this.firstChild);
    } else {
      this.appendChild(fragment as any);
    }
  }

  append(...nodes: Node[]) {
    const fragment = this.ownerDocument.createDocumentFragment();
    (fragment.childNodes as any).push(...nodes.map(asNode, this.ownerDocument));
    this.appendChild(fragment as any);
  }

  querySelector(css: string) {
    return this.querySelectorAll(css)[0] || null;
  }

  querySelectorAll(css: string) {
    return _querySelectorAll.call(this, css);
  }
}
