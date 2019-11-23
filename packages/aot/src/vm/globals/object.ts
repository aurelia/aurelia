import {
  $BuiltinFunction,
  $GetPrototypeFromConstructor,
  $Function,
  $OrdinaryCreateFromConstructor,
} from '../types/function';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $Error,
} from '../types/error';
import {
  $Undefined,
} from '../types/undefined';
import { $Object } from '../types/object';


// http://www.ecma-international.org/ecma-262/#sec-object-constructor
export class $ObjectConstructor extends $BuiltinFunction<'%Object%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Object%', intrinsics['%FunctionPrototype%']);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-value
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [value]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If NewTarget is neither undefined nor the active function, then
    if (!NewTarget.isUndefined && NewTarget !== this) {
      // 1. a. Return ? OrdinaryCreateFromConstructor(NewTarget, "%ObjectPrototype%").
      return $OrdinaryCreateFromConstructor(ctx, NewTarget, '%ObjectPrototype%');
    }

    // 2. If value is null, undefined or not supplied, return ObjectCreate(%ObjectPrototype%).
    if (value === void 0 || value.isNil) {
      return $Object.ObjectCreate(ctx, 'Object', intrinsics['%ObjectPrototype%']);
    }

    // 3. Return ! ToObject(value).
    return value.ToObject(ctx);
  }
}
