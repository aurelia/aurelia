import { Node } from './Node';
import { Element } from './Element';
import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import * as utils from './utils';

// interface Attr // https://dom.spec.whatwg.org/#attr
export class Attr extends Node {

  private _value: string | CSSStyleDeclaration;

  ownerElement: Element;

  constructor(ownerElement: Element, name: string, value: string | CSSStyleDeclaration = null) {
    super(ownerElement.ownerDocument);
    this.ownerElement = ownerElement;
    this.name = name;
    this.nodeType = Node.ATTRIBUTE_NODE;
    this.nodeName = name;
    this._value = value;
  }

  get value() {
    return this.name === 'style' ? (this._value as CSSStyleDeclaration).cssText : this._value as string;
  }

  set value(_value: string) {
    const oldValue = this._value;
    switch (this.name) {
      case 'style':
        (this._value as CSSStyleDeclaration).cssText = _value;
        break;
      case 'class':
        if (this.ownerElement) {
          const cl = this.ownerElement.classList;
          if (_value == null) {
            this._value = _value;
            cl.splice(0, cl.length);
          } else {
            this._value = String(_value);
            if (oldValue !== this._value) {
              cl.value = this._value;
            }
          }
          break;
        }
      default:
        this._value = _value;
        break;
    }
    if (this.ownerElement && oldValue !== this._value) {
      utils.notifyAttributeChanged(
        this.ownerElement,
        this.name, oldValue, this._value
      );
    }
  }

};

