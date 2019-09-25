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
    var configuration_1 = require("./configuration");
    exports.DebugConfiguration = configuration_1.DebugConfiguration;
    exports.TraceConfiguration = configuration_1.TraceConfiguration;
    var tracer_1 = require("./tracer");
    exports.DebugTracer = tracer_1.DebugTracer;
    exports.stringifyLifecycleFlags = tracer_1.stringifyLifecycleFlags;
    var unparser_1 = require("./binding/unparser");
    exports.Unparser = unparser_1.Unparser;
    exports.Serializer = unparser_1.Serializer;
});
//# sourceMappingURL=index.js.map