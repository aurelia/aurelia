"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareDocumentPositionFlat = void 0;
/**
 * Normalizes https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition into values usable for Array.prototype.sort.
 */
function compareDocumentPositionFlat(a, b) {
    switch (a.compareDocumentPosition(b) & 2 /* DOCUMENT_POSITION_PRECEDING */) {
        case 0: return 0; // same element
        case 2: return 1; // preceding element
        default: return -1; // assume following element otherwise
    }
}
exports.compareDocumentPositionFlat = compareDocumentPositionFlat;
//# sourceMappingURL=common.js.map