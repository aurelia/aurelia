(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./configuration", "./i18n", "./i18n-configuration-options", "./t/index", "./df/index", "./nf/index", "./rt/index", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./configuration"), exports);
    tslib_1.__exportStar(require("./i18n"), exports);
    tslib_1.__exportStar(require("./i18n-configuration-options"), exports);
    tslib_1.__exportStar(require("./t/index"), exports);
    tslib_1.__exportStar(require("./df/index"), exports);
    tslib_1.__exportStar(require("./nf/index"), exports);
    tslib_1.__exportStar(require("./rt/index"), exports);
    var utils_1 = require("./utils");
    exports.Signals = utils_1.Signals;
});
//# sourceMappingURL=index.js.map