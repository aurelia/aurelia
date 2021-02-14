"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLookup = exports.isDataAttribute = void 0;
const IsDataAttribute = createLookup();
function isDataAttribute(obj, key, svgAnalyzer) {
    if (IsDataAttribute[key] === true) {
        return true;
    }
    if (typeof key !== 'string') {
        return false;
    }
    const prefix = key.slice(0, 5);
    // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
    // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
    return IsDataAttribute[key] =
        prefix === 'aria-' ||
            prefix === 'data-' ||
            svgAnalyzer.isStandardSvgAttribute(obj, key);
}
exports.isDataAttribute = isDataAttribute;
function createLookup() {
    return Object.create(null);
}
exports.createLookup = createLookup;
//# sourceMappingURL=utilities-html.js.map