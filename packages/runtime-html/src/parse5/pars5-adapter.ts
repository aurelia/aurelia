// @ts-nocheck

const DOCUMENT_MODE = {
  NO_QUIRKS: 'no-quirks',
  QUIRKS: 'quirks',
  LIMITED_QUIRKS: 'limited-quirks',
};

//Node construction
export const createDocument = function () {
  return {
    nodeName: '#document',
    mode: DOCUMENT_MODE.NO_QUIRKS,
    childNodes: [],
  };
};

export const createDocumentFragment = function () {
  return {
    nodeName: '#document-fragment',
    childNodes: [],
  };
};

export const createElement = function (tagName, namespaceURI, attrs) {
  return {
    nodeName: tagName,
    tagName: tagName,
    attrs: attrs,
    namespaceURI: namespaceURI,
    childNodes: [],
    parentNode: null,
  };
};

export const createCommentNode = function (data) {
  return {
    nodeName: '#comment',
    data: data,
    parentNode: null,
  };
};

const createTextNode = function (value) {
  return {
    nodeName: '#text',
    value: value,
    parentNode: null,
  };
};

//Tree mutation
export const appendChild = function (parentNode, newNode) {
  parentNode.childNodes.push(newNode);
  newNode.parentNode = parentNode;
};

export const insertBefore = function (parentNode, newNode, referenceNode) {
  const insertionIdx = parentNode.childNodes.indexOf(referenceNode);

  parentNode.childNodes.splice(insertionIdx, 0, newNode);
  newNode.parentNode = parentNode;
};

export const setTemplateContent = function (templateElement, contentElement) {
  templateElement.content = contentElement;
};

export const getTemplateContent = function (templateElement) {
  return templateElement.content;
};

export const setDocumentType = function (document, name, publicId, systemId) {
  let doctypeNode = null;

  for (let i = 0; i < document.childNodes.length; i++) {
    if (document.childNodes[i].nodeName === '#documentType') {
      doctypeNode = document.childNodes[i];
      break;
    }
  }

  if (doctypeNode) {
    doctypeNode.name = name;
    doctypeNode.publicId = publicId;
    doctypeNode.systemId = systemId;
  } else {
    appendChild(document, {
      nodeName: '#documentType',
      name: name,
      publicId: publicId,
      systemId: systemId,
    });
  }
};

export const setDocumentMode = function (document, mode) {
  document.mode = mode;
};

export const getDocumentMode = function (document) {
  return document.mode;
};

export const detachNode = function (node) {
  if (node.parentNode) {
    const idx = node.parentNode.childNodes.indexOf(node);

    node.parentNode.childNodes.splice(idx, 1);
    node.parentNode = null;
  }
};

export const insertText = function (parentNode, text) {
  if (parentNode.childNodes.length) {
    const prevNode = parentNode.childNodes[parentNode.childNodes.length - 1];

    if (prevNode.nodeName === '#text') {
      prevNode.value += text;
      return;
    }
  }

  appendChild(parentNode, createTextNode(text));
};

export const insertTextBefore = function (parentNode, text, referenceNode) {
  const prevNode =
    parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];

  if (prevNode && prevNode.nodeName === '#text') {
    prevNode.value += text;
  } else {
    insertBefore(parentNode, createTextNode(text), referenceNode);
  }
};

export const adoptAttributes = function (recipient, attrs) {
  const recipientAttrsMap = [];

  for (let i = 0; i < recipient.attrs.length; i++) {
    recipientAttrsMap.push(recipient.attrs[i].name);
  }

  for (let j = 0; j < attrs.length; j++) {
    if (recipientAttrsMap.indexOf(attrs[j].name) === -1) {
      recipient.attrs.push(attrs[j]);
    }
  }
};

//Tree traversing
export const getFirstChild = function (node) {
  return node.childNodes[0];
};

export const getChildNodes = function (node) {
  return node.childNodes;
};

export const getParentNode = function (node) {
  return node.parentNode;
};

export const getAttrList = function (element) {
  return element.attrs;
};

//Node data
export const getTagName = function (element) {
  return element.tagName;
};

export const getNamespaceURI = function (element) {
  return element.namespaceURI;
};

export const getTextNodeContent = function (textNode) {
  return textNode.value;
};

export const getCommentNodeContent = function (commentNode) {
  return commentNode.data;
};

export const getDocumentTypeNodeName = function (doctypeNode) {
  return doctypeNode.name;
};

export const getDocumentTypeNodePublicId = function (doctypeNode) {
  return doctypeNode.publicId;
};

export const getDocumentTypeNodeSystemId = function (doctypeNode) {
  return doctypeNode.systemId;
};

//Node types
export const isTextNode = function (node) {
  return node.nodeName === '#text';
};

export const isCommentNode = function (node) {
  return node.nodeName === '#comment';
};

export const isDocumentTypeNode = function (node) {
  return node.nodeName === '#documentType';
};

export const isElementNode = function (node) {
  return !!node.tagName;
};

// Source code location
export const setNodeSourceCodeLocation = function (node, location) {
  node.sourceCodeLocation = location;
};

export const getNodeSourceCodeLocation = function (node) {
  return node.sourceCodeLocation;
};

export const updateNodeSourceCodeLocation = function (node, endLocation) {
  node.sourceCodeLocation = Object.assign(node.sourceCodeLocation, endLocation);
};
