import {
  $BuiltinFunction,
  $Function,
} from '../types/function';
import {
  $AnyNonEmptyNonError,
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $List,
} from '../types/list';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $Undefined,
} from '../types/undefined';

export class $ValueRecord<T> {
  public '[[Value]]': T;

  public constructor(
    value: T,
  ) {
    this['[[Value]]'] = value;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-get-regexp-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-array-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-%typedarray%-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-map-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-set-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-arraybuffer-@@species
// http://www.ecma-international.org/ecma-262/#sec-sharedarraybuffer-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-promise-@@species
export class $GetSpecies extends $BuiltinFunction<'get [@@species]'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'get [@@species]', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    return thisArgument;
  }
}
