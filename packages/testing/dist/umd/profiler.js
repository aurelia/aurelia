(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./string-manipulation"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const string_manipulation_1 = require("./string-manipulation");
    function writeProfilerReport(testName) {
        let msg = '\n';
        kernel_1.Profiler.report(function (name, duration, topLevel, total) {
            msg += `[Profiler:${testName}] ${string_manipulation_1.padRight(name, 25)}: ${string_manipulation_1.padLeft(Math.round(duration * 10) / 10, 7)}ms; ${string_manipulation_1.padLeft(topLevel, 7)} measures; ${string_manipulation_1.padLeft(total, 7)} calls; ~${Math.round(duration / total * 100) / 100}ms/call\n`;
        });
        console.log(msg);
    }
    exports.writeProfilerReport = writeProfilerReport;
});
//# sourceMappingURL=profiler.js.map