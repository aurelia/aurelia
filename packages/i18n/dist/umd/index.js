(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./configuration", "./i18n", "./i18n-configuration-options", "./t/index", "./df/index", "./nf/index", "./rt/index", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(require("./configuration"));
    __export(require("./i18n"));
    __export(require("./i18n-configuration-options"));
    __export(require("./t/index"));
    __export(require("./df/index"));
    __export(require("./nf/index"));
    __export(require("./rt/index"));
    var utils_1 = require("./utils");
    exports.Signals = utils_1.Signals;
});
//# sourceMappingURL=index.js.map