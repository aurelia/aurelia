import { CustomElementRegistry } from './CustomElementRegistry';
import { Event } from './Event';
import { Node } from './Node';
// DOMStringMap: require('./src/DOMStringMap'),
import { Element } from './Element';
import { Attr } from './Attr';
import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import { Comment } from './Comment';
import { DocumentFragment } from './DocumentFragment';
import { HTMLElement } from './HTMLElement';
import { HTMLHtmlElement } from './HTMLHtmlElement';
import { HTMLTemplateElement } from './HTMLTemplateElement';
import { Range } from './Range';
import { Text } from './Text';

// interface DocumentType // https://dom.spec.whatwg.org/#documenttype
export class DocumentType extends Node {
  constructor(ownerDocument: Document) {
    super(ownerDocument);
    this.nodeType = Node.DOCUMENT_TYPE_NODE;
    this.name = 'html';
  }

  toString(): string {
    return '<!DOCTYPE ' + this.name + '>';
  }
}


const headTag = (el: Node) => el.nodeName === 'head';
const bodyTag = (el: Node) => el.nodeName === 'body';

const getFoundOrNull = (result: boolean) => {
  if (result) {
    const el = findById.found;
    findById.found = null;
    return el;
  } else {
    return null;
  }
};

function findById(this: string, child: Element): boolean {
  'use strict';
  return child.id === this ?
    !!(findById.found = child) :
    child.children.some(findById, this);
}
findById.found = null as Element;

// interface Document // https://dom.spec.whatwg.org/#document
export class Document extends Node {

  customElements: CustomElementRegistry;

  documentElement: HTMLHtmlElement;

  constructor(customElements = new CustomElementRegistry()) {
    super(null);
    this.nodeType = Node.DOCUMENT_NODE;
    this.nodeName = '#document';
    this.appendChild(new DocumentType(this));
    this.documentElement = new HTMLHtmlElement(this, 'html');
    this.appendChild(this.documentElement);
    this.customElements = customElements;
    Object.freeze(this.childNodes);
  }

  createAttribute(name: string) {
    const attr = new Attr(
      { ownerDocument: this } as any,
      name,
      name === 'style' ?
        new CSSStyleDeclaration() :
        null
    );
    attr.ownerElement = null;
    return attr;
  }

  createComment(comment: string) {
    return new Comment(this, comment);
  }

  createDocumentFragment() {
    return new DocumentFragment(this);
  }

  createElement(name: 'template'): HTMLTemplateElement;
  createElement(name: string): Element;
  createElement(name: string): Element {
    switch (name) {
      case 'template':
        return new HTMLTemplateElement(this, name);
      default:
        const CE = this.customElements.get(name);
        return CE ? new CE(this, name) : new HTMLElement(this, name);
    }
  }

  createElementNS(ns, name) {
    return new HTMLElement(this, name + ':' + ns);
  }

  createEvent(name: string) {
    if (name !== 'Event') throw new Error(name + ' not implemented');
    return new Event();
  }

  createRange() {
    return new Range;
  }

  createTextNode(text: string) {
    return new Text(this, text);
  }

  getElementsByTagName(name: string) {
    const html = this.documentElement;
    return /html/i.test(name) ?
      [html] :
      (name === '*' ? [html] : []).concat(html.getElementsByTagName(name));
  }

  getElementsByClassName(name: string) {
    const html = this.documentElement;
    return (html.classList.contains(name) ? [html] : [])
      .concat(html.getElementsByClassName(name));
  }

  toString() {
    return this.childNodes[0] + this.documentElement.outerHTML;
  }

  get defaultView() {
    return global;
  }

  get head(): Element {
    const html = this.documentElement;
    return this.documentElement.childNodes.find(headTag) ||
      html.insertBefore(this.createElement('head'), this.body);
  }

  get body(): Element {
    const html = this.documentElement;
    return (html.childNodes.find(bodyTag) as Element) ||
      html.appendChild(this.createElement('body'));
  }

  // interface NonElementParentNode // https://dom.spec.whatwg.org/#nonelementparentnode
  getElementById(id) {
    const html = this.documentElement;
    return html.id === id ? html : getFoundOrNull(html.children.some(findById, id));
  }

  // interface ParentNode @ https://dom.spec.whatwg.org/#parentnode
  get children() {
    return [this.documentElement];
  }

  get firstElementChild() {
    return this.documentElement;
  }

  get lastElementChild() {
    return this.documentElement;
  }

  get childElementCount() {
    return 1;
  }

  prepend() { throw new Error('Only one element on document allowed.'); }
  append() { this.prepend(); }

  querySelector(css) {
    return this.documentElement.querySelector(css);
  }

  querySelectorAll(css) {
    return this.documentElement.querySelectorAll(css);
  }

}
