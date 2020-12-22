import { $BuiltinFunction, } from '../types/function.js';
// http://www.ecma-international.org/ecma-262/#sec-isnan-number
// 18.2.3 isNaN ( number )
export class $IsNaN extends $BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%isNaN%', proto);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Let num be ? ToNumber(number).
        // 2. If num is NaN, return true.
        // 3. Otherwise, return false.
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=is-nan.js.map