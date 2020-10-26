import { $TypeError } from '../types/error';
import { $BuiltinFunction, $Function } from '../types/function';
import { ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Undefined } from '../types/undefined';
import { $List } from '../types/list';
export declare class $ThrowTypeError extends $BuiltinFunction<'%ThrowTypeError%'> {
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [thisArg, ...args]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $TypeError;
}
//# sourceMappingURL=throw-type-error.d.ts.map