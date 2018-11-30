import { escaper } from './html-escaper';
import { XmlParser, ParserEventType } from './xml/xml-parser';
import { Document } from './Document';
import { notifyAttributeChanged } from './utils';
import { ParentNode } from './ParentNode';
import { Node } from './Node';
import { DOMTokenList } from './DOMTokenList';
import * as utils from './utils';
import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import { Attr } from './Attr';

const { ELEMENT_NODE, ATTRIBUTE_NODE, TEXT_NODE, COMMENT_NODE } = Node;

const CSS_SPLITTER = /\s*,\s*/;

const findName = (Class, registry) => {
  for (let key in registry)
    if (registry[key] === Class)
      return key;
};
const parseInto = (node: Node, html: string) => {
  const document = node.ownerDocument;
  new XmlParser(event => {
    switch (event.eventType) {
      case ParserEventType.StartElement:
        let el = document.createElement(event.elementName);
        for (let attr in event.attributes) {
          el.setAttribute(attr, event.attributes[attr]);
        }
        node = node.appendChild(el);
        break;
      case ParserEventType.Text:
        node.appendChild(document.createTextNode(event.data));
        break;
      case ParserEventType.EndElement:
        if (node.nodeName === event.elementName) {
          node = node.parentNode;
        }
        break;
    }
  }).parse(html);
};

function matchesBySelector(css: string) {
  switch (css[0]) {
    case '#': return this.id === css.slice(1);
    case '.': return this.classList.contains(css.slice(1));
    default: return css === this.nodeName;
  }
}

const specialAttribute = (owner: Element, attr: Attr) => {
  switch (attr.name) {
    case 'class':
      owner.classList.value = attr.value;
      return true;
  }
  return false;
};

const stringifiedNode = (el: Node) => {
  switch (el.nodeType) {
    case ELEMENT_NODE:
      return ('<' + el.nodeName).concat(
        (el as Element).attributes.map(stringifiedNode).join(''),
        Element.VOID_ELEMENT.test(el.nodeName) ?
          ' />' :
          ('>' + el.childNodes.map(stringifiedNode).join('') + '</' + el.nodeName + '>')
      );
    case ATTRIBUTE_NODE:
      return el.name === 'style' && !el.value ? '' : (
        typeof el.value === 'boolean' || el.value == null ?
          (el.value ? (' ' + el.name) : '') :
          (' ' + el.name + '="' + escaper.escape(el.value) + '"')
      );
    case TEXT_NODE:
      return escaper.escape(el.data);
    case COMMENT_NODE:
      return '<!--' + el.data + '-->';
  }
};

// interface Element // https://dom.spec.whatwg.org/#interface-element
export class Element extends ParentNode {

  static VOID_ELEMENT = /^area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr$/i;

  attributes: Attr[];

  classList: DOMTokenList;

  shadowRoot: Node;

  constructor(ownerDocument: Document, name: string) {
    super(ownerDocument);
    this.attributes = [];
    this.nodeType = ELEMENT_NODE;
    this.nodeName = name || findName(
      this.constructor,
      this.ownerDocument.customElements._registry
    );
    this.classList = new DOMTokenList(this);
  }

  // it doesn't actually really work as expected
  // it simply provides shadowRoot as the element itself
  attachShadow(init) {
    switch (init.mode) {
      case 'open': return (this.shadowRoot = this);
      case 'closed': return this;
    }
    throw new Error('element.attachShadow({mode: "open" | "closed"})');
  }

  getAttribute(name) {
    const attr = this.getAttributeNode(name);
    return attr && attr.value;
  }

  getAttributeNames() {
    return this.attributes.map(attr => attr.name);
  }

  getAttributeNode(name) {
    return this.attributes.find(attr => attr.name === name) || null;
  }

  getElementsByClassName(name) {
    const list = [];
    for (let i = 0; i < this.children.length; i++) {
      let el = this.children[i];
      if (el.classList.contains(name)) list.push(el);
      list.push(...el.getElementsByClassName(name));
    }
    return list;
  }

  getElementsByTagName(name) {
    const list = [];
    for (let i = 0; i < this.children.length; i++) {
      let el = this.children[i];
      if (name === '*' || el.nodeName === name) list.push(el);
      list.push(...el.getElementsByTagName(name));
    }
    return list;
  }

  hasAttribute(name) {
    return this.attributes.some(attr => attr.name === name);
  }

  hasAttributes() {
    return 0 < this.attributes.length;
  }

  closest(css: string) {
    let el: Element = this;
    do {
      if (el.matches(css)) return el;
    } while ((el = el.parentNode as Element) && el.nodeType === ELEMENT_NODE);
    return null;
  }

  matches(css: string): boolean {
    return css.split(CSS_SPLITTER).some(matchesBySelector, this);
  }

  removeAttribute(name: string) {
    const attr = this.getAttributeNode(name);
    if (attr) {
      this.removeAttributeNode(attr);
    }
  }

  setAttribute(name: string, value: string) {
    const attr = this.getAttributeNode(name);
    if (attr) {
      attr.value = value;
    } else {
      const attr = this.ownerDocument.createAttribute(name);
      attr.ownerElement = this;
      this.attributes.push(attr);
      this.attributes[name] = attr;
      attr.value = value;
    }
  }

  removeAttributeNode(attr: Attr) {
    const i = this.attributes.indexOf(attr);
    if (i < 0) throw new Error('unable to remove ' + attr);
    this.attributes.splice(i, 1);
    attr.value = null;
    delete this.attributes[attr.name];
    specialAttribute(this, attr);
  }

  setAttributeNode(attr) {
    const name = attr.name;
    const old = this.getAttributeNode(name);
    if (old === attr) return attr;
    else {
      if (attr.ownerElement) {
        if (attr.ownerElement !== this) {
          throw new Error('The attribute is already used in other nodes.');
        }
      }
      else attr.ownerElement = this;
      this.attributes[name] = attr;
      if (old) {
        this.attributes.splice(this.attributes.indexOf(old), 1, attr);
        if (!specialAttribute(this, attr))
          notifyAttributeChanged(this, name, old.value, attr.value);
        return old;
      } else {
        this.attributes.push(attr);
        if (!specialAttribute(this, attr))
          notifyAttributeChanged(this, name, null, attr.value);
        return null;
      }
    }
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(value) {
    this.setAttribute('id', value);
  }

  get className() {
    return this.classList.value;
  }

  set className(value) {
    this.classList.value = value;
  }

  get innerHTML() {
    return this.childNodes.map(stringifiedNode).join('');
  }

  set innerHTML(html) {
    this.textContent = '';
    parseInto(this, html);
  }

  get nextElementSibling() {
    const children = (this.parentNode as Element).children;
    let i = children.indexOf(this);
    return ++i < children.length ? children[i] : null;
  }

  get previousElementSibling() {
    const children = (this.parentNode as Element).children;
    let i = children.indexOf(this);
    return --i < 0 ? null : children[i];
  }

  get outerHTML(): string {
    return stringifiedNode(this);
  }

  get tagName() {
    return this.nodeName
  }

};
