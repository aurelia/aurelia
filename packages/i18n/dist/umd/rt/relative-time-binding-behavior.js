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
    let RelativeTimeBindingBehavior = class RelativeTimeBindingBehavior {
        bind(flags, scope, binding) {
            utils_1.createIntlFormatValueConverterExpression("rt" /* relativeTimeValueConverterName */, binding);
        }
    };
    RelativeTimeBindingBehavior = tslib_1.__decorate([
        runtime_1.bindingBehavior("rt" /* relativeTimeValueConverterName */)
    ], RelativeTimeBindingBehavior);
    exports.RelativeTimeBindingBehavior = RelativeTimeBindingBehavior;
});
//# sourceMappingURL=relative-time-binding-behavior.js.map