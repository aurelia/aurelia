import { $Object } from '../types/object';
import { $Null } from '../types/null';
import { Realm } from '../realm';
import { $Boolean } from '../types/boolean';

// http://www.ecma-international.org/ecma-262/#sec-string-exotic-objects
export class $ImmutablePrototypeExoticObject extends $Object<'ImmutablePrototypeExoticObject'> {
  public readonly '[[Prototype]]': $Object | $Null;

  public constructor(
    realm: Realm,
    proto: $Object | $Null,
  ) {
    super(realm, 'ImmutablePrototypeExoticObject', proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-immutable-prototype-exotic-objects-setprototypeof-v
  public '[[SetPrototypeOf]]'(V: $Object | $Null): $Boolean {
    // 1. Return ? SetImmutablePrototype(O, V).

    // http://www.ecma-international.org/ecma-262/#sec-set-immutable-prototype

    // 1. Assert: Either Type(V) is Object or Type(V) is Null.
    // 2. Let current be ? O.[[GetPrototypeOf]]().
    const current = super['[[GetPrototypeOf]]']();

    // 3. If SameValue(V, current) is true, return true.
    if (V.is(current)) {
      return this.realm['[[Intrinsics]]'].true;
    }

    // 4. Return false.
    return this.realm['[[Intrinsics]]'].false;
  }
}
