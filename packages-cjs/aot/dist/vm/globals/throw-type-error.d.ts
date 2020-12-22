import { $TypeError } from '../types/error.js';
import { $BuiltinFunction, $Function } from '../types/function.js';
import { ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $List } from '../types/list.js';
export declare class $ThrowTypeError extends $BuiltinFunction<'%ThrowTypeError%'> {
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [thisArg, ...args]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $TypeError;
}
//# sourceMappingURL=throw-type-error.d.ts.map