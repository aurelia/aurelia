(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel = require("@aurelia/kernel");
    exports.kernel = kernel;
    const runtime = require("@aurelia/runtime");
    exports.runtime = runtime;
    const jit = require("./index");
    exports.jit = jit;
});
//# sourceMappingURL=index.full.js.map