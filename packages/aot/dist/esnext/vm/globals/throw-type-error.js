import { $TypeError, } from '../types/error.js';
import { $BuiltinFunction, } from '../types/function.js';
// http://www.ecma-international.org/ecma-262/#sec-%throwtypeerror%
// 9.2.9.1 %ThrowTypeError% ( )
export class $ThrowTypeError extends $BuiltinFunction {
    // http://www.ecma-international.org/ecma-262/#sec-function.prototype.call
    // 19.2.3.3 Function.prototype.call ( thisArg , ... args )
    performSteps(ctx, thisArgument, [thisArg, ...args], NewTarget) {
        // 1. Throw a TypeError exception.
        return new $TypeError(ctx.Realm);
    }
}
//# sourceMappingURL=throw-type-error.js.map