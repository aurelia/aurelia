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
    const defaultNow = kernel_1.PLATFORM.now.bind(kernel_1.PLATFORM);
    exports.Now = kernel_1.DI.createInterface('Now').withDefault(x => x.instance(defaultNow));
});
//# sourceMappingURL=now.js.map