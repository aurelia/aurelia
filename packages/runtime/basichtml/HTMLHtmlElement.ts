import { XmlParser, ParserEventType } from './xml/xml-parser';
import * as utils from './utils';
import { Element } from './Element';
import { HTMLElement } from './HTMLElement';
import { Document } from './Document';
import { Node } from './Node';

const parseInto = (node: Node, html: string): void => {
  const document = node.ownerDocument;
  new XmlParser(event => {
    switch (event.eventType) {
      case ParserEventType.StartElement:
        let el: Element;
        const name = event.elementName;
        switch (name) {
          case 'html': break;
          // can only have 1 body / head
          case 'head':
          case 'body':
            el = document.createElement(name);
            for (let attr in event.attributes) {
              el.setAttribute(attr, event.attributes[attr]);
            }
            node.replaceChild(el, document[name]);
            node = document[name];
            break;
          // can have other element
          default:
            el = document.createElement(name);
            for (let attr in event.attributes) {
              el.setAttribute(attr, event.attributes[attr]);
            }
            node = node.appendChild(el);
            break;
        }
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
}

// interface HTMLHtmlElement // https://html.spec.whatwg.org/multipage/semantics.html#htmlhtmlelement
export class HTMLHtmlElement extends HTMLElement {

  constructor(ownerDocument: Document, name: string) {
    super(ownerDocument, name);
    this.isCustomElement = false;
  }

  get innerHTML(): string {
    const document = this.ownerDocument;
    return document.head.outerHTML + document.body.outerHTML;
  }

  set innerHTML(html: string) {
    this.textContent = '';
    parseInto(this, html);
  }

};
