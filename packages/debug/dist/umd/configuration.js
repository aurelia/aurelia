(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./binding/unparser", "./reporter", "./tracer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const unparser_1 = require("./binding/unparser");
    const reporter_1 = require("./reporter");
    const tracer_1 = require("./tracer");
    exports.DebugConfiguration = {
        register(container) {
            reporter_1.Reporter.write(2);
            Object.assign(kernel_1.Reporter, reporter_1.Reporter);
            unparser_1.enableImprovedExpressionDebugging();
        }
    };
    exports.TraceConfiguration = {
        register(container) {
            Object.assign(kernel_1.Tracer, tracer_1.DebugTracer);
        }
    };
});
//# sourceMappingURL=configuration.js.map