export const DOM = {
  Element: Element,
  SVGElement: SVGElement,
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
    return window.getComputedStyle(element);
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
