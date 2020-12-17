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
    exports.IValidationExpressionHydrator = void 0;
    const kernel_1 = require("@aurelia/kernel");
    exports.IValidationExpressionHydrator = kernel_1.DI.createInterface('IValidationExpressionHydrator');
});
//# sourceMappingURL=rule-interfaces.js.map