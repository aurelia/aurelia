(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./configuration", "./tracer", "./binding/unparser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Unparser = exports.stringifyLifecycleFlags = exports.DebugConfiguration = void 0;
    var configuration_1 = require("./configuration");
    Object.defineProperty(exports, "DebugConfiguration", { enumerable: true, get: function () { return configuration_1.DebugConfiguration; } });
    var tracer_1 = require("./tracer");
    Object.defineProperty(exports, "stringifyLifecycleFlags", { enumerable: true, get: function () { return tracer_1.stringifyLifecycleFlags; } });
    var unparser_1 = require("./binding/unparser");
    Object.defineProperty(exports, "Unparser", { enumerable: true, get: function () { return unparser_1.Unparser; } });
});
//# sourceMappingURL=index.js.map