(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./translation-binding", "./translation-binding-behavior", "./translation-parameters-renderer", "./translation-renderer", "./translation-value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(require("./translation-binding"));
    __export(require("./translation-binding-behavior"));
    __export(require("./translation-parameters-renderer"));
    __export(require("./translation-renderer"));
    __export(require("./translation-value-converter"));
});
//# sourceMappingURL=index.js.map