import {
  $TypeError,
} from '../types/error';
import {
  $BuiltinFunction,
  $Function,
} from '../types/function';
import {
  ExecutionContext,
} from '../realm';
import {
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $Undefined,
} from '../types/undefined';

// http://www.ecma-international.org/ecma-262/#sec-%throwtypeerror%
// 9.2.9.1 %ThrowTypeError% ( )
export class $ThrowTypeError extends $BuiltinFunction<'%ThrowTypeError%'> {
  // http://www.ecma-international.org/ecma-262/#sec-function.prototype.call
  // 19.2.3.3 Function.prototype.call ( thisArg , ... args )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [thisArg, ...args]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $TypeError {
    // 1. Throw a TypeError exception.
    return new $TypeError(ctx.Realm);
  }
}
