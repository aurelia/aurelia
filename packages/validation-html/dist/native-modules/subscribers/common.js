/**
 * Normalizes https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition into values usable for Array.prototype.sort.
 */
export function compareDocumentPositionFlat(a, b) {
    switch (a.compareDocumentPosition(b) & 2 /* DOCUMENT_POSITION_PRECEDING */) {
        case 0: return 0; // same element
        case 2: return 1; // preceding element
        default: return -1; // assume following element otherwise
    }
}
//# sourceMappingURL=common.js.map