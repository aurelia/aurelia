(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./configuration", "./rule-provider", "./rules", "./validator", "./rule-interfaces", "./serialization", "./ast-serialization"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./configuration"), exports);
    tslib_1.__exportStar(require("./rule-provider"), exports);
    tslib_1.__exportStar(require("./rules"), exports);
    tslib_1.__exportStar(require("./validator"), exports);
    tslib_1.__exportStar(require("./rule-interfaces"), exports);
    tslib_1.__exportStar(require("./serialization"), exports);
    tslib_1.__exportStar(require("./ast-serialization"), exports);
});
//# sourceMappingURL=index.js.map