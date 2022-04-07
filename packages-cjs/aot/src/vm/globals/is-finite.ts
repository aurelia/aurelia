import {
  $BuiltinFunction,
  $Function,
} from '../types/function.js';
import {
  Realm,
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
  $FunctionPrototype,
} from './function.js';
import {
  $List,
} from '../types/list.js';

// http://www.ecma-international.org/ecma-262/#sec-isfinite-number
// 18.2.2 isFinite ( number )
export class $IsFinite extends $BuiltinFunction<'%isFinite%'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, '%isFinite%', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    // 1. Let num be ? ToNumber(number).
    // 2. If num is NaN, +∞, or -∞, return false.
    // 3. Otherwise, return true.
    throw new Error('Method not implemented.');
  }
}
