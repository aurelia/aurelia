import * as utils from './utils';
import { CustomElementRegistry } from './CustomElementRegistry';
import { Document, DocumentType } from './Document';
import { HTMLElement } from './HTMLElement';
import { HTMLUnknownElement } from './HTMLUnknownElement';

export { Attr } from './Attr';
export { CharacterData } from './CharacterData';
export { Comment } from './Comment';
export { CustomEvent } from './CustomEvent';
export { Document };
export { DocumentFragment } from './DocumentFragment';
export { DOMStringMap } from './DOMStringMap';
export { DOMTokenList } from './DOMTokenList';
export { Element } from './Element';
export { Event, EventInitDict } from './Event';
export { EventTarget } from './EventTarget';
export { HTMLElement } from './HTMLElement';
export { HTMLTemplateElement } from './HTMLTemplateElement';
export { HTMLUnknownElement } from './HTMLUnknownElement';
export { HTMLHtmlElement } from './HTMLHtmlElement';
export { Node } from './Node';
export { Text } from './Text';

export interface IWindow {
  window: this;
  document: Document;
  customElements: CustomElementRegistry;
  HTMLUnknownElement: typeof HTMLUnknownElement;
  HTMLElement: typeof HTMLElement;
}

export interface IBasicHTMLInitOptions {
  window?: IWindow;
  customElements?: CustomElementRegistry;
}

export function init(options: IBasicHTMLInitOptions = {}) {
  const window: IWindow = options.window ||
    (typeof self === 'undefined' ? global : self) as any;
  window.customElements = options.customElements ||
    new CustomElementRegistry();
  window.document = new Document(window.customElements);
  window.window = window;
  window.HTMLElement = HTMLElement;
  window.HTMLUnknownElement = HTMLUnknownElement;
  // if (options.selector) {
  //   const $ = options.selector.$;
  //   const selector = options.selector.module ?
  //     options.selector.module(window) :
  //     require(options.selector.name);
  //   utils.querySelectorAll = function querySelectorAll(css) {
  //     return $(selector, this, css);
  //   };
  // }
  return window;
}
