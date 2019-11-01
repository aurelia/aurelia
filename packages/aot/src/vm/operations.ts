/* eslint-disable */
import { Host, Realm } from './host';
import { $Object, $Any, $BuiltinFunction, $PropertyKey, $Boolean, $Function, $Undefined } from './value';
import { $PropertyDescriptor } from './property-descriptor';

export type CallableFunction = (
  thisArgument: $Any,
  argumentsList: readonly $Any[],
  NewTarget: $Any,
) => $Any;

export type FunctionPrototype = Realm['[[Intrinsics]]']['%FunctionPrototype%'];

// http://www.ecma-international.org/ecma-262/#sec-createbuiltinfunction
export function $CreateBuiltinFunction<
  T extends string = string,
>(
  host: Host,
  IntrinsicName: T,
  steps: CallableFunction,
  internalSlotsList: readonly string[],
  realm?: Realm,
  prototype?: $Object,
): $BuiltinFunction<T> {
  // 1. Assert: steps is either a set of algorithm steps or other definition of a function's behaviour provided in this specification.
  // 2. If realm is not present, set realm to the current Realm Record.
  if (realm === void 0) {
    realm = host.realm;
  }

  // 3. Assert: realm is a Realm Record.
  // 4. If prototype is not present, set prototype to realm.[[Intrinsics]].[[%FunctionPrototype%]].
  if (prototype === void 0) {
    prototype = realm['[[Intrinsics]]']['%FunctionPrototype%'];
  }

  // 5. Let func be a new built-in function object that when called performs the action described by steps. The new function object has internal slots whose names are the elements of internalSlotsList. The initial value of each of those internal slots is undefined.
  // 6. Set func.[[Realm]] to realm.
  // 7. Set func.[[Prototype]] to prototype.
  // 8. Set func.[[Extensible]] to true.
  // 9. Set func.[[ScriptOrModule]] to null.
  // 10. Return func.
  return new $BuiltinFunction(host, IntrinsicName, prototype, steps);
}

// http://www.ecma-international.org/ecma-262/#sec-hasproperty
export function $HasProperty(O: $Object, P: $PropertyKey): $Boolean {
  // 1. Assert: Type(O) is Object.
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Return ? O.[[HasProperty]](P).
  return O['[[HasProperty]]'](P);
}

// http://www.ecma-international.org/ecma-262/#sec-get-o-p
export function $Get(O: $Object, P: $PropertyKey): $Any {
  // 1. Assert: Type(O) is Object.
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Return ? O.[[Get]](P, O).
  return O['[[Get]]'](P, O);
}

// http://www.ecma-international.org/ecma-262/#sec-call
export function $Call(F: $Function, V: $Any, argumentsList?: readonly $Any[]): $Any {
  // 1. If argumentsList is not present, set argumentsList to a new empty List.
  if (argumentsList === void 0) {
    argumentsList = [];
  }

  // 2. If IsCallable(F) is false, throw a TypeError exception.
  if (!F.isFunction) {
    throw new TypeError('2. If IsCallable(F) is false, throw a TypeError exception.');
  }

  // 3. Return ? F.[[Call]](V, argumentsList).
  return F['[[Call]]'](V, argumentsList);
}

// http://www.ecma-international.org/ecma-262/#sec-definepropertyorthrow
export function $DefinePropertyOrThrow(O: $Object, P: $PropertyKey, desc: $PropertyDescriptor): $Boolean {
  // 1. Assert: Type(O) is Object.
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Let success be ? O.[[DefineOwnProperty]](P, desc).
  const success = O['[[DefineOwnProperty]]'](P, desc);

  // 4. If success is false, throw a TypeError exception.
  if (success.isFalsey) {
    throw new TypeError('4. If success is false, throw a TypeError exception.');
  }

  // 5. Return success.
  return success;
}

// http://www.ecma-international.org/ecma-262/#sec-validateandapplypropertydescriptor
export function $ValidateAndApplyPropertyDescriptor(
  O: $Object | $Undefined,
  P: $PropertyKey | $Undefined,
  extensible: $Boolean,
  Desc: $PropertyDescriptor,
  current: $PropertyDescriptor | $Undefined,
): $Boolean {
  const host = O.host;
  const intrinsics = host.realm['[[Intrinsics]]'];

  // 1. Assert: If O is not undefined, then IsPropertyKey(P) is true.
  // 2. If current is undefined, then
  if (current.isUndefined) {
    // 2. a. If extensible is false, return false.
    if (!extensible.value) {
      return intrinsics.false;
    }

    // 2. b. Assert: extensible is true.
    // 2. c. If IsGenericDescriptor(Desc) is true or IsDataDescriptor(Desc) is true, then
    if (Desc.isGenericDescriptor || Desc.isDataDescriptor) {
      // 2. c. i. If O is not undefined, create an own data property named P of object O whose [[Value]], [[Writable]], [[Enumerable]] and [[Configurable]] attribute values are described by Desc. If the value of an attribute field of Desc is absent, the attribute of the newly created property is set to its default value.
      if (!O.isUndefined) {
        const newDesc = new $PropertyDescriptor(host, P as $PropertyKey);
        if (Desc['[[Value]]'].isEmpty) {
          newDesc['[[Value]]'] = intrinsics.undefined;
        } else {
          newDesc['[[Value]]'] = Desc['[[Value]]'];
        }
        if (Desc['[[Writable]]'].isEmpty) {
          newDesc['[[Writable]]'] = intrinsics.false;
        } else {
          newDesc['[[Writable]]'] = Desc['[[Writable]]'];
        }
        if (Desc['[[Enumerable]]'].isEmpty) {
          newDesc['[[Enumerable]]'] = intrinsics.false;
        } else {
          newDesc['[[Enumerable]]'] = Desc['[[Enumerable]]'];
        }
        if (Desc['[[Configurable]]'].isEmpty) {
          newDesc['[[Configurable]]'] = intrinsics.false;
        } else {
          newDesc['[[Configurable]]'] = Desc['[[Configurable]]'];
        }

        O.properties.set((P as $PropertyKey).value, newDesc);
      }
    }
    // 2. d. Else Desc must be an accessor Property Descriptor,
    else {
      // 2. d. i. If O is not undefined, create an own accessor property named P of object O whose [[Get]], [[Set]], [[Enumerable]] and [[Configurable]] attribute values are described by Desc. If the value of an attribute field of Desc is absent, the attribute of the newly created property is set to its default value.
      if (!O.isUndefined) {
        const newDesc = new $PropertyDescriptor(host, P as $PropertyKey);
        if (Desc['[[Get]]'].isEmpty) {
          newDesc['[[Get]]'] = intrinsics.undefined;
        } else {
          newDesc['[[Get]]'] = Desc['[[Get]]'];
        }
        if (Desc['[[Set]]'].isEmpty) {
          newDesc['[[Set]]'] = intrinsics.undefined;
        } else {
          newDesc['[[Set]]'] = Desc['[[Set]]'];
        }
        if (Desc['[[Enumerable]]'].isEmpty) {
          newDesc['[[Enumerable]]'] = intrinsics.false;
        } else {
          newDesc['[[Enumerable]]'] = Desc['[[Enumerable]]'];
        }
        if (Desc['[[Configurable]]'].isEmpty) {
          newDesc['[[Configurable]]'] = intrinsics.false;
        } else {
          newDesc['[[Configurable]]'] = Desc['[[Configurable]]'];
        }

        O.properties.set((P as $PropertyKey).value, newDesc);
      }
    }

    // 2. e. Return true.
    return intrinsics.true;
  }

  // 3. If every field in Desc is absent, return true.
  if (
    Desc['[[Configurable]]'].isEmpty &&
    Desc['[[Enumerable]]'].isEmpty &&
    Desc['[[Writable]]'].isEmpty &&
    Desc['[[Value]]'].isEmpty &&
    Desc['[[Get]]'].isEmpty &&
    Desc['[[Set]]'].isEmpty
  ) {
    return intrinsics.true;
  }

  // 4. If current.[[Configurable]] is false, then
  if (current['[[Configurable]]'].isFalsey) {
    // 4. a. If Desc.[[Configurable]] is present and its value is true, return false.
    if (Desc['[[Configurable]]'].isTruthy) {
      return intrinsics.false;
    }

    // 4. b. If Desc.[[Enumerable]] is present and the [[Enumerable]] fields of current and Desc are the Boolean negation of each other, return false.
    if (!Desc['[[Enumerable]]'].isEmpty && current['[[Enumerable]]'].isTruthy === Desc['[[Enumerable]]'].isFalsey) {
      return intrinsics.false;
    }
  }

  // 5. If IsGenericDescriptor(Desc) is true, no further validation is required.
  if (Desc.isGenericDescriptor) {

  }
  // 6. Else if IsDataDescriptor(current) and IsDataDescriptor(Desc) have different results, then
  else if (current.isDataDescriptor !== Desc.isDataDescriptor) {
    // 6. a. If current.[[Configurable]] is false, return false.
    if (current['[[Configurable]]'].isFalsey) {
      return intrinsics.false;
    }

    // 6. b. If IsDataDescriptor(current) is true, then
    if (current.isDataDescriptor) {
      // 6. b. i. If O is not undefined, convert the property named P of object O from a data property to an accessor property. Preserve the existing values of the converted property's [[Configurable]] and [[Enumerable]] attributes and set the rest of the property's attributes to their default values.
      if (!O.isUndefined) {
        const existingDesc = O.properties.get((P as $PropertyKey).value)!;
        const newDesc = new $PropertyDescriptor(host, P as $PropertyKey);
        newDesc['[[Configurable]]'] = existingDesc['[[Configurable]]'];
        newDesc['[[Enumerable]]'] = existingDesc['[[Enumerable]]'];
        newDesc['[[Get]]'] = intrinsics.undefined;
        newDesc['[[Set]]'] = intrinsics.undefined;

        O.properties.set((P as $PropertyKey).value, newDesc);
      }
    }
    // 6. c. Else,
    else {
      // 6. c. i. If O is not undefined, convert the property named P of object O from an accessor property to a data property. Preserve the existing values of the converted property's [[Configurable]] and [[Enumerable]] attributes and set the rest of the property's attributes to their default values.
      if (!O.isUndefined) {
        const existingDesc = O.properties.get((P as $PropertyKey).value)!;
        const newDesc = new $PropertyDescriptor(host, P as $PropertyKey);
        newDesc['[[Configurable]]'] = existingDesc['[[Configurable]]'];
        newDesc['[[Enumerable]]'] = existingDesc['[[Enumerable]]'];
        newDesc['[[Writable]]'] = intrinsics.false;
        newDesc['[[Value]]'] = intrinsics.undefined;

        O.properties.set((P as $PropertyKey).value, newDesc);
      }
    }
  }
  // 7. Else if IsDataDescriptor(current) and IsDataDescriptor(Desc) are both true, then
  else if (current.isDataDescriptor && Desc.isDataDescriptor) {
    // 7. a. If current.[[Configurable]] is false and current.[[Writable]] is false, then
    if (current['[[Configurable]]'].isFalsey && current['[[Writable]]'].isFalsey) {
      // 7. a. i. If Desc.[[Writable]] is present and Desc.[[Writable]] is true, return false.
      if (Desc['[[Writable]]'].isTruthy) {
        return intrinsics.false;
      }

      // 7. a. ii. If Desc.[[Value]] is present and SameValue(Desc.[[Value]], current.[[Value]]) is false, return false.
      if (!Desc['[[Value]]'].isEmpty && !Desc['[[Value]]'].is(current['[[Value]]'])) {
        return intrinsics.false;
      }

      // 7. a. iii. Return true.
      return intrinsics.true;
    }
  }
  // 8. Else IsAccessorDescriptor(current) and IsAccessorDescriptor(Desc) are both true,
  else {
    // 8. a. If current.[[Configurable]] is false, then
    if (current['[[Configurable]]'].isFalsey) {
      // 8. a. i. If Desc.[[Set]] is present and SameValue(Desc.[[Set]], current.[[Set]]) is false, return false.
      if (!Desc['[[Set]]'].isEmpty && !Desc['[[Set]]'].is(current['[[Set]]'])) {
        return intrinsics.false;
      }

      // 8. a. ii. If Desc.[[Get]] is present and SameValue(Desc.[[Get]], current.[[Get]]) is false, return false.
      if (!Desc['[[Get]]'].isEmpty && !Desc['[[Get]]'].is(current['[[Get]]'])) {
        return intrinsics.false;
      }

      // 8. a. iii. Return true.
      return intrinsics.true;
    }
  }

  // 9. If O is not undefined, then
  if (!O.isUndefined) {
    const existingDesc = O.properties.get((P as $PropertyKey).value)!;

    // 9. a. For each field of Desc that is present, set the corresponding attribute of the property named P of object O to the value of the field.
    if (!Desc['[[Configurable]]'].isEmpty) {
      existingDesc['[[Configurable]]'] = Desc['[[Configurable]]'];
    }
    if (!Desc['[[Enumerable]]'].isEmpty) {
      existingDesc['[[Enumerable]]'] = Desc['[[Enumerable]]'];
    }
    if (!Desc['[[Writable]]'].isEmpty) {
      existingDesc['[[Writable]]'] = Desc['[[Writable]]'];
    }
    if (!Desc['[[Value]]'].isEmpty) {
      existingDesc['[[Value]]'] = Desc['[[Value]]'];
    }
    if (!Desc['[[Get]]'].isEmpty) {
      existingDesc['[[Get]]'] = Desc['[[Get]]'];
    }
    if (!Desc['[[Set]]'].isEmpty) {
      existingDesc['[[Set]]'] = Desc['[[Set]]'];
    }
  }

  // 10. Return true.
  return intrinsics.true;
}
