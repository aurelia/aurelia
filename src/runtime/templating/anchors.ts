import { DOM } from "../dom";

function hasAttribute(name) {
  return this._element.hasAttribute(name);
}

function getAttribute(name) {
  return this._element.getAttribute(name);
}

function setAttribute(name, value) {
  this._element.setAttribute(name, value);
}

export function makeElementIntoAnchor(element: Element, proxy = false) {
  let anchor = <any>DOM.createComment('anchor');

  if (proxy) {
    anchor._element = element;

    anchor.hasAttribute = hasAttribute;
    anchor.getAttribute = getAttribute;
    anchor.setAttribute = setAttribute;
  }

  DOM.replaceNode(anchor, element);

  return anchor;
}
