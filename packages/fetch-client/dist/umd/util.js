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
});
//# sourceMappingURL=util.js.map