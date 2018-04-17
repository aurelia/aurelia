const global = (function() {
  // Workers don’t have `window`, only `self`
  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  // Not all environments allow eval and Function
  // Use only as a last resort:
  return new Function('return this')();
})();

// https://github.com/angular/angular-cli/issues/8412
// https://github.com/ag-grid/ag-grid-react/issues/24
global.Element = typeof Element === 'undefined' ? () => {} : Element;
global.HTMLElement = typeof HTMLElement === 'undefined' ? () => {} : HTMLElement;
global.SVGElement = typeof SVGElement === 'undefined' ? () => {} : SVGElement;
global.HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? () => {} : HTMLSelectElement;

export const PLATFORM = {
  global: global,
  emptyArray: Object.freeze([]),
  emptyObject: Object.freeze({}),
  location: global.location,
  history: global.history,
  performance: global.performance,
  addEventListener(eventName: string, callback: Function, capture: boolean): void {
    global.addEventListener(eventName, callback, capture);
  },
  removeEventListener(eventName: string, callback: Function, capture: boolean): void {
    global.removeEventListener(eventName, callback, capture);
  },
  requestAnimationFrame(callback: Function): number {
    return global.requestAnimationFrame(callback);
  }
};

export const FEATURE = {
  shadowDOM: !!global.HTMLElement.prototype.attachShadow
};

export const DOM = {
  Element: global.Element,
  SVGElement: global.SVGElement,
  boundary: 'aurelia-dom-boundary',
  addEventListener(eventName: string, callback: EventListenerOrEventListenerObject, capture?: boolean): void {
    document.addEventListener(eventName, callback, capture);
  },
  removeEventListener(eventName: string, callback: EventListenerOrEventListenerObject, capture?: boolean): void {
    document.removeEventListener(eventName, callback, capture);
  },
  adoptNode(node: Node) {
    return document.adoptNode(node);
  },
  createAttribute(name: string): Attr {
    return document.createAttribute(name);
  },
  createElement(tagName: string): Element {
    return document.createElement(tagName);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  },
  createComment(text) {
    return document.createComment(text);
  },
  createDocumentFragment(): DocumentFragment {
    return document.createDocumentFragment();
  },
  createTemplateElement(): HTMLTemplateElement {
    return document.createElement('template');
  },
  createMutationObserver(callback: MutationCallback): MutationObserver {
    return new MutationObserver(callback);
  },
  createCustomEvent(eventType: string, options: CustomEventInit): CustomEvent {
    return new CustomEvent(eventType, options);
  },
  dispatchEvent(evt): void {
    document.dispatchEvent(evt);
  },
  getComputedStyle(element: Element) {
    return global.getComputedStyle(element);
  },
  getElementById(id: string): Element {
    return document.getElementById(id);
  },
  querySelectorAll(query: string) {
    return document.querySelectorAll(query);
  },
  nextElementSibling(element: Node): Element {
    if ('nextElementSibling' in element) {
      return element['nextElementSibling'];
    }

    do {
      element = element.nextSibling;
    } while (element && element.nodeType !== 1);

    return <Element>element;
  },
  createTemplateFromMarkup(markup: string): Element {
    let parser = document.createElement('div');
    parser.innerHTML = markup;

    let temp = parser.firstElementChild;

    if (!temp || temp.nodeName !== 'TEMPLATE') {
      throw new Error('Template markup must be wrapped in a <template> element e.g. <template> <!-- markup here --> </template>');
    }

    return temp;
  },
  appendNode(newNode: Node, parentNode?: Node): void {
    (parentNode || document.body).appendChild(newNode);
  },
  replaceNode(newNode: Node, node: Node, parentNode?: Node): void {
    if (node.parentNode) {
      node.parentNode.replaceChild(newNode, node);
    } else {
      parentNode.replaceChild(newNode, node);
    }
  },
  removeNode(node: Node, parentNode?: Node): void {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    } else if (parentNode) {
      parentNode.removeChild(node);
    }
  },
  //https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace_in_the_DOM
  //We need to ignore whitespace so we don't mess up fallback rendering
  //However, we cannot ignore empty text nodes that contain interpolations.
  isAllWhitespace(node: Node) {
    // Use ECMA-262 Edition 3 String and RegExp features
    return !((<any>node).auInterpolationTarget || (/[^\t\n\r ]/.test(node.textContent)));
  },
  treatNodeAsNonWhitespace(node: Node) {
    //See isWhitespace above for an explanation.
    (<any>node).auInterpolationTarget = true;
  },
  makeElementIntoAnchor(element: Element, proxy = false) {
    let anchor = <any>DOM.createComment('anchor');
  
    if (proxy) {
      anchor._element = element;
  
      anchor.hasAttribute = hasAttribute;
      anchor.getAttribute = getAttribute;
      anchor.setAttribute = setAttribute;
    }
  
    DOM.replaceNode(anchor, element);
  
    return anchor;
  },
  injectStyles(styles: string, destination?: Element, prepend?: boolean, id?: string): Node {
    if (id) {
      let oldStyle = document.getElementById(id);
      if (oldStyle) {
        let isStyleTag = oldStyle.tagName.toLowerCase() === 'style';

        if (isStyleTag) {
          oldStyle.innerHTML = styles;
          return;
        }

        throw new Error('The provided id does not indicate a style tag.');
      }
    }

    let node = document.createElement('style');
    node.innerHTML = styles;
    node.type = 'text/css';

    if (id) {
      node.id = id;
    }

    destination = destination || document.head;

    if (prepend && destination.childNodes.length > 0) {
      destination.insertBefore(node, destination.childNodes[0]);
    } else {
      destination.appendChild(node);
    }

    return node;
  }
};

function hasAttribute(name) {
  return this._element.hasAttribute(name);
}

function getAttribute(name) {
  return this._element.getAttribute(name);
}

function setAttribute(name, value) {
  this._element.setAttribute(name, value);
}
