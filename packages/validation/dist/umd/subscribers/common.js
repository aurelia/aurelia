(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
});
//# sourceMappingURL=common.js.map