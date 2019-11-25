import {
  $Object,
} from '../types/object';
import {
  $Null,
} from '../types/null';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $Boolean,
} from '../types/boolean';
import {
  $Error,
} from '../types/error';
import {
  $AnyObject,
  CompletionType,
} from '../types/_shared';

// http://www.ecma-international.org/ecma-262/#sec-string-exotic-objects
export class $ImmutablePrototypeExoticObject extends $Object<'ImmutablePrototypeExoticObject'> {
  public constructor(
    realm: Realm,
    proto: $AnyObject | $Null,
  ) {
    super(realm, 'ImmutablePrototypeExoticObject', proto, CompletionType.normal, realm['[[Intrinsics]]'].empty);
  }

  // http://www.ecma-international.org/ecma-262/#sec-immutable-prototype-exotic-objects-setprototypeof-v
  // 9.4.7.1 [[SetPrototypeOf]] ( V )
  public '[[SetPrototypeOf]]'(
    ctx: ExecutionContext,
    V: $AnyObject | $Null,
  ): $Boolean | $Error {
    // 1. Return ? SetImmutablePrototype(O, V).

    // http://www.ecma-international.org/ecma-262/#sec-set-immutable-prototype
    // 9.4.7.2 SetImmutablePrototype ( O , V )

    // 1. Assert: Either Type(V) is Object or Type(V) is Null.
    // 2. Let current be ? O.[[GetPrototypeOf]]().
    const current = super['[[GetPrototypeOf]]'](ctx);
    if (current.isAbrupt) { return current; }

    // 3. If SameValue(V, current) is true, return true.
    if (V.is(current)) {
      return this.realm['[[Intrinsics]]'].true;
    }

    // 4. Return false.
    return this.realm['[[Intrinsics]]'].false;
  }
}
