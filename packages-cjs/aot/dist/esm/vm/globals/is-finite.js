import { $BuiltinFunction, } from '../types/function.js';
// http://www.ecma-international.org/ecma-262/#sec-isfinite-number
// 18.2.2 isFinite ( number )
export class $IsFinite extends $BuiltinFunction {
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
//# sourceMappingURL=is-finite.js.map