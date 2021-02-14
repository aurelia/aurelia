const IsDataAttribute = createLookup();
export function isDataAttribute(obj, key, svgAnalyzer) {
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
export function createLookup() {
    return Object.create(null);
}
//# sourceMappingURL=utilities-html.js.map