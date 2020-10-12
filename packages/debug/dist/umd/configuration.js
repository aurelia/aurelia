(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./binding/unparser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugConfiguration = void 0;
    const unparser_1 = require("./binding/unparser");
    exports.DebugConfiguration = {
        register(container) {
            unparser_1.enableImprovedExpressionDebugging();
        }
    };
});
//# sourceMappingURL=configuration.js.map