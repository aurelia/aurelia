"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ThrowTypeError = void 0;
const error_js_1 = require("../types/error.js");
const function_js_1 = require("../types/function.js");
// http://www.ecma-international.org/ecma-262/#sec-%throwtypeerror%
// 9.2.9.1 %ThrowTypeError% ( )
class $ThrowTypeError extends function_js_1.$BuiltinFunction {
    // http://www.ecma-international.org/ecma-262/#sec-function.prototype.call
    // 19.2.3.3 Function.prototype.call ( thisArg , ... args )
    performSteps(ctx, thisArgument, [thisArg, ...args], NewTarget) {
        // 1. Throw a TypeError exception.
        return new error_js_1.$TypeError(ctx.Realm);
    }
}
exports.$ThrowTypeError = $ThrowTypeError;
//# sourceMappingURL=throw-type-error.js.map