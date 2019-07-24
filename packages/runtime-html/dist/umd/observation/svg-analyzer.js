(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    exports.ISVGAnalyzer = kernel_1.DI.createInterface('ISVGAnalyzer').withDefault(x => x.singleton(class {
        isStandardSvgAttribute(node, attributeName) {
            return false;
        }
    }));
});
//# sourceMappingURL=svg-analyzer.js.map