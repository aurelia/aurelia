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
    exports.noop = exports.emptyObject = exports.emptyArray = void 0;
    /* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
    exports.emptyArray = Object.freeze([]);
    exports.emptyObject = Object.freeze({});
    /* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function noop() { }
    exports.noop = noop;
});
//# sourceMappingURL=platform.js.map