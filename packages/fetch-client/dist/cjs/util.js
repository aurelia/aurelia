"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = void 0;
/**
 * Serialize an object to JSON. Useful for easily creating JSON fetch request bodies.
 *
 * @param body - The object to be serialized to JSON.
 * @param replacer - The JSON.stringify replacer used when serializing.
 * @returns A JSON string.
 */
function json(body, replacer) {
    return JSON.stringify((body !== undefined ? body : {}), replacer);
}
exports.json = json;
//# sourceMappingURL=util.js.map