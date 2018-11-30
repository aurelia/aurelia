import { escaper } from './html-escaper';

import { Attr } from './Attr';
import { Element } from './Element';
import { Document } from './Document';
// const DOMStringMap = require('./DOMStringMap');
import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import { Node } from './Node';

// interface HTMLElement // https://html.spec.whatwg.org/multipage/dom.html#htmlelement
export class HTMLElement extends Element {

  isCustomElement: boolean;
  style: CSSStyleDeclaration;

  attributes: Attr[] & { style: Attr };

  constructor(ownerDocument: Document, name: string) {
    super(ownerDocument, name);
    // this.dataset = new DOMStringMap(this);
    this.isCustomElement = this.constructor !== HTMLElement;
    this.style = new CSSStyleDeclaration();
    const style = new Attr(this, 'style', this.style);
    this.attributes.push(style);
    this.attributes.style = style;
  }
}

[
  'click',
  'focus',
  'blur'
].forEach(type => {
  Object.defineProperty(HTMLElement.prototype, type, {
    configurable: true,
    value: function () {
      const event = this.ownerDocument.createEvent('Event');
      event.initEvent(type, true, true);
      this.dispatchEvent(event);
    }
  });
});

[
  'title',
  'lang',
  'translate',
  'dir',
  'hidden',
  'tabIndex',
  'accessKey',
  'draggable',
  'spellcheck',
  'contentEditable'
].forEach(name => {
  const lowName = name;
  Object.defineProperty(HTMLElement.prototype, name, {
    configurable: true,
    get() { return this.getAttribute(lowName); },
    set(value) { this.setAttribute(lowName, value); }
  });
});

// HTMLElement implements GlobalEventHandlers;
// HTMLElement implements DocumentAndElementEventHandlers;

[
  'onabort',
  'onblur',
  'oncancel',
  'oncanplay',
  'oncanplaythrough',
  'onchange',
  'onclick',
  'onclose',
  'oncontextmenu',
  'oncuechange',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'ondurationchange',
  'onemptied',
  'onended',
  'onerror',
  'onfocus',
  'oninput',
  'oninvalid',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onload',
  'onloadeddata',
  'onloadedmetadata',
  'onloadstart',
  'onmousedown',
  'onmouseenter',
  'onmouseleave',
  'onmousemove',
  'onmouseout',
  'onmouseover',
  'onmouseup',
  'onmousewheel',
  'onpause',
  'onplay',
  'onplaying',
  'onprogress',
  'onratechange',
  'onreset',
  'onresize',
  'onscroll',
  'onseeked',
  'onseeking',
  'onselect',
  'onshow',
  'onstalled',
  'onsubmit',
  'onsuspend',
  'ontimeupdate',
  'ontoggle',
  'onvolumechange',
  'onwaiting',
  'onauxclick',
  'ongotpointercapture',
  'onlostpointercapture',
  'onpointercancel',
  'onpointerdown',
  'onpointerenter',
  'onpointerleave',
  'onpointermove',
  'onpointerout',
  'onpointerover',
  'onpointerup'
].forEach(ontype => {
  let _value = null;
  const type = ontype.slice(2);
  Object.defineProperty(HTMLElement.prototype, ontype, {
    configurable: true,
    get() {
      return _value;
    },
    set(value) {
      if (!value) {
        if (_value) {
          value = _value;
          _value = null;
          this.removeEventListener(type, value);
        }
        this.removeAttribute(ontype);
      } else {
        _value = value;
        this.addEventListener(type, value);
        this.setAttribute(ontype, 'return (' + escaper.escape(
          JS_SHORTCUT.test(value) && !JS_FUNCTION.test(value) ?
            ('function ' + value) :
            ('' + value)
        ) + ').call(this, event)');
      }
    }
  });
});

// helpers
const JS_SHORTCUT = /^[a-z$_]\S*?\(/;
const JS_FUNCTION = /^function\S*?\(/;
