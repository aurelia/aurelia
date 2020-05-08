(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./configuration", "./validate-binding-behavior", "./validation-controller", "./subscribers/validation-container-custom-element", "./subscribers/validation-errors-custom-attribute", "./subscribers/validation-result-presenter-service"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(require("./configuration"));
    __export(require("./validate-binding-behavior"));
    __export(require("./validation-controller"));
    __export(require("./subscribers/validation-container-custom-element"));
    __export(require("./subscribers/validation-errors-custom-attribute"));
    __export(require("./subscribers/validation-result-presenter-service"));
});
//# sourceMappingURL=index.js.map