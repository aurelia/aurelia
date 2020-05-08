(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./configuration", "./rule-provider", "./rules", "./validator", "./rule-interfaces", "./serialization", "./ast-serialization"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(require("./configuration"));
    __export(require("./rule-provider"));
    __export(require("./rules"));
    __export(require("./validator"));
    __export(require("./rule-interfaces"));
    __export(require("./serialization"));
    __export(require("./ast-serialization"));
});
//# sourceMappingURL=index.js.map