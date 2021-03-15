import {
  $TypeError,
} from '../types/error.js';
import {
  $BuiltinFunction,
  $Function,
} from '../types/function.js';
import {
  ExecutionContext,
} from '../realm.js';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
} from '../types/_shared.js';
import {
  $Undefined,
} from '../types/undefined.js';
import {
  $List
} from '../types/list.js';

// http://www.ecma-international.org/ecma-262/#sec-%throwtypeerror%
// 9.2.9.1 %ThrowTypeError% ( )
export class $ThrowTypeError extends $BuiltinFunction<'%ThrowTypeError%'> {
  // http://www.ecma-international.org/ecma-262/#sec-function.prototype.call
  // 19.2.3.3 Function.prototype.call ( thisArg , ... args )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [thisArg, ...args]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $TypeError {
    // 1. Throw a TypeError exception.
    return new $TypeError(ctx.Realm);
  }
}
