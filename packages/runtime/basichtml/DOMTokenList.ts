import { Element } from './Element';

const afterChanges = (dtl: DOMTokenList) => {
  const el = dtl._ownerElement;
  const attr = el.getAttributeNode('class');
  if (attr) {
    if (attr.value !== dtl.value) {
      attr.value = dtl.value;
    }
  } else if (dtl.value) {
    el.setAttribute('class', dtl.value);
  }
};

// interface DOMTokenList // https://dom.spec.whatwg.org/#interface-domtokenlist
export class DOMTokenList extends Array<string> {

  _ownerElement: Element;

  constructor(ownerElement: Element) {
    super();
    const arr: DOMTokenList = [] as any;
    Object.setPrototypeOf(arr, DOMTokenList.prototype);
    this._ownerElement = arr._ownerElement = ownerElement;
    return arr;
  }

  item(i: number) {
    return this[i];
  }

  contains(token: string): boolean {
    return this.indexOf(token) !== -1;
  }

  add(...tokens: string[]): void {
    this.splice(0, this.length, ...Array.from(new Set(this.concat(tokens))));
    afterChanges(this);
  }

  remove(...tokens: string[]): void {
    this.push(...this
      .splice(0, this.length)
      .filter(token => tokens.indexOf(token) === -1)
    );
    afterChanges(this);
  }

  replace(token, newToken) {
    const i = this.indexOf(token);
    if (i < 0) this.add(newToken);
    else this[i] = newToken;
    afterChanges(this);
  }

  toggle(token, force) {
    let result = false;
    if (this.contains(token)) {
      if (force) result = true;
      else this.remove(token);
    } else {
      if (arguments.length < 2 || force) {
        result = true;
        this.add(token);
      }
    }
    return result;
  }

  get value() {
    return this.join(' ');
  }

  set value(className) {
    this.splice(0, this.length);
    this.add(...String(className || '').trim().split(/\s+/));
    afterChanges(this);
  }

};
