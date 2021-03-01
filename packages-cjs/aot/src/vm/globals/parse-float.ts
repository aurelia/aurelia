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

// http://www.ecma-international.org/ecma-262/#sec-parsefloat-string
// 18.2.4 parseFloat ( string )
export class $ParseFloat extends $BuiltinFunction<'%parseFloat%'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, '%parseFloat%', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    // 1. Let inputString be ? ToString(string).
    // 2. Let trimmedString be a substring of inputString consisting of the leftmost code unit that is not a StrWhiteSpaceChar and all code units to the right of that code unit. (In other words, remove leading white space.) If inputString does not contain any such code units, let trimmedString be the empty string.
    // 3. If neither trimmedString nor any prefix of trimmedString satisfies the syntax of a StrDecimalLiteral (see 7.1.3.1), return NaN.
    // 4. Let numberString be the longest prefix of trimmedString, which might be trimmedString itself, that satisfies the syntax of a StrDecimalLiteral.
    // 5. Let mathFloat be MV of numberString.
    // 6. If mathFloat = 0, then
      // 6. a. If the first code unit of trimmedString is the code unit 0x002D (HYPHEN-MINUS), return -0.
      // 6. b. Return +0.
    // 7. Return the Number value for mathFloat.
    throw new Error('Method not implemented.');
  }
}
