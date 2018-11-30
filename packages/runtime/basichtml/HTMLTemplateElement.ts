import { HTMLElement } from './HTMLElement';
import { Document } from './Document';
import { DocumentFragment } from './DocumentFragment';

// interface HTMLTemplateElement // https://html.spec.whatwg.org/multipage/scripting.html#htmltemplateelement
export class HTMLTemplateElement extends HTMLElement {

  constructor(ownerDocument: Document, name: string) {
    super(ownerDocument, name);
    this.isCustomElement = false;
  }

  get content(): DocumentFragment {
    const fragment = this.ownerDocument.createDocumentFragment();
    fragment.childNodes = this.childNodes;
    return fragment;
  }

};
