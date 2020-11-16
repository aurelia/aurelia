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

// http://www.ecma-international.org/ecma-262/#sec-isnan-number
// 18.2.3 isNaN ( number )
export class $IsNaN extends $BuiltinFunction<'%isNaN%'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, '%isNaN%', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    // 1. Let num be ? ToNumber(number).
    // 2. If num is NaN, return true.
    // 3. Otherwise, return false.
    throw new Error('Method not implemented.');
  }
}
