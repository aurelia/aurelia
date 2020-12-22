"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$IsFinite = void 0;
const function_js_1 = require("../types/function.js");
// http://www.ecma-international.org/ecma-262/#sec-isfinite-number
// 18.2.2 isFinite ( number )
class $IsFinite extends function_js_1.$BuiltinFunction {
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
//# sourceMappingURL=is-finite.js.map