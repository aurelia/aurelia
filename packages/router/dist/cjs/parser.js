"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQuery = void 0;
/**
 * @internal - Shouldn't be used directly
 */
function parseQuery(query) {
    if (!query || !query.length) {
        return {};
    }
    const parameters = {};
    // TODO: Deal with complex parameters such as lists and objects
    const params = query.replace('+', ' ').split('&');
    for (const param of params) {
        const [key, value] = param.split('=');
        parameters[decodeURIComponent(key)] = decodeURIComponent(value !== void 0 ? value : key);
    }
    return parameters;
}
exports.parseQuery = parseQuery;
//# sourceMappingURL=parser.js.map