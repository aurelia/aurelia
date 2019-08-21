(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const utils_1 = require("../utils");
    let DateFormatBindingBehavior = class DateFormatBindingBehavior {
        bind(flags, scope, binding) {
            utils_1.createIntlFormatValueConverterExpression("df" /* dateFormatValueConverterName */, binding);
        }
    };
    DateFormatBindingBehavior = tslib_1.__decorate([
        runtime_1.bindingBehavior("df" /* dateFormatValueConverterName */)
    ], DateFormatBindingBehavior);
    exports.DateFormatBindingBehavior = DateFormatBindingBehavior;
});
//# sourceMappingURL=date-format-binding-behavior.js.map