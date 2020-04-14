(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./configuration", "./validate-binding-behavior", "./validation-controller", "./subscribers/validation-container-custom-element", "./subscribers/validation-errors-custom-attribute", "./subscribers/validation-result-presenter-service"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./configuration"), exports);
    tslib_1.__exportStar(require("./validate-binding-behavior"), exports);
    tslib_1.__exportStar(require("./validation-controller"), exports);
    tslib_1.__exportStar(require("./subscribers/validation-container-custom-element"), exports);
    tslib_1.__exportStar(require("./subscribers/validation-errors-custom-attribute"), exports);
    tslib_1.__exportStar(require("./subscribers/validation-result-presenter-service"), exports);
});
//# sourceMappingURL=index.js.map