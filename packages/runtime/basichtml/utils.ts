// Used as Node.TYPE
const types = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
};

// shared constants
const connect = (parentNode, child) => {
  if (
    child.isCustomElement && 'connectedCallback' in child &&
    parentNode && parentNode.nodeType !== types.DOCUMENT_FRAGMENT_NODE
  ) {
    child.connectedCallback();
  }
};

const disconnect = (parentNode, child) => {
  if (
    child.isCustomElement && 'disconnectedCallback' in child &&
    parentNode && parentNode.nodeType !== types.DOCUMENT_FRAGMENT_NODE
  ) {
    child.disconnectedCallback();
  }
};

const notifyAttributeChanged = (el, name, oldValue, newValue) => {
  if (
    el.isCustomElement &&
    'attributeChangedCallback' in el &&
    (el.constructor.observedAttributes || []).includes(name)
  ) {
    el.attributeChangedCallback(name, oldValue, newValue);
  }
};

const CSS_SPLITTER = /\s*,\s*/;
function findBySelector(css) {
  switch (css[0]) {
    case '#':
      return this.ownerDocument.getElementById(css.slice(1));
    case '.':
      return this.getElementsByClassName(css.slice(1));
    default:
      return this.getElementsByTagName(css);
  }
}

function querySelectorAll(css) {
  return [].concat(...css.split(CSS_SPLITTER).map(findBySelector, this));
}

export {
  connect,
  disconnect,
  notifyAttributeChanged,
  types,
  querySelectorAll
};



