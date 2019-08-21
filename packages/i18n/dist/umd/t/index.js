(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./translation-binding", "./translation-binding-behavior", "./translation-parameters-renderer", "./translation-renderer", "./translation-value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./translation-binding"), exports);
    tslib_1.__exportStar(require("./translation-binding-behavior"), exports);
    tslib_1.__exportStar(require("./translation-parameters-renderer"), exports);
    tslib_1.__exportStar(require("./translation-renderer"), exports);
    tslib_1.__exportStar(require("./translation-value-converter"), exports);
});
//# sourceMappingURL=index.js.map