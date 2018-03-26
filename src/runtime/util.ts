//https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace_in_the_DOM
//We need to ignore whitespace so we don't mess up fallback rendering
//However, we cannot ignore empty text nodes that container interpolations.
export function _isAllWhitespace(node) {
  // Use ECMA-262 Edition 3 String and RegExp features
  return !(node.auInterpolationTarget || (/[^\t\n\r ]/.test(node.textContent)));
}
