(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../types/function"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const function_1 = require("../types/function");
    // http://www.ecma-international.org/ecma-262/#sec-isfinite-number
    // 18.2.2 isFinite ( number )
    class $IsFinite extends function_1.$BuiltinFunction {
        constructor(realm, proto) {
            super(realm, '%isFinite%', proto);
        }
        performSteps(ctx, thisArgument, argumentsList, NewTarget) {
            // 1. Let num be ? ToNumber(number).
            // 2. If num is NaN, +∞, or -∞, return false.
            // 3. Otherwise, return true.
            throw new Error('Method not implemented.');
        }
    }
    exports.$IsFinite = $IsFinite;
});
//# sourceMappingURL=is-finite.js.map