import { Node } from './Node';
import { ParentNode } from './ParentNode';
import { Document } from './Document';

// interface DocumentFragment // https://dom.spec.whatwg.org/#documentfragment
export class DocumentFragment extends ParentNode {

  constructor(ownerDocument: Document) {
    super(ownerDocument);
    this.nodeType = Node.DOCUMENT_FRAGMENT_NODE;
    this.nodeName = '#document-fragment';
  }

};
