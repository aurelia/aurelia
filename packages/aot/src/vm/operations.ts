/* eslint-disable */
import { Realm } from './realm';
import { $Object, $Any, $BuiltinFunction, $PropertyKey, $Boolean, $Undefined, $Null, $String, $Reference, $Primitive, $Function, $BoundFunctionExoticObject } from './value';
import { $PropertyDescriptor } from './property-descriptor';
import { $EnvRec } from './environment';

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
  realm: Realm,
  IntrinsicName: T,
  steps: CallableFunction,
  internalSlotsList: readonly string[],
  prototype?: $Object,
): $BuiltinFunction<T> {
  // 1. Assert: steps is either a set of algorithm steps or other definition of a function's behaviour provided in this specification.
  // 2. If realm is not present, set realm to the current Realm Record.

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
  return new $BuiltinFunction(realm, IntrinsicName, prototype, steps);
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

// http://www.ecma-international.org/ecma-262/#sec-set-o-p-v-throw
export function $Set(O: $Object, P: $PropertyKey, V: $Any, Throw: $Boolean): $Boolean {
  // 1. Assert: Type(O) is Object.
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Assert: Type(Throw) is Boolean.
  // 4. Let success be ? O.[[Set]](P, V, O).
  const success = O['[[Set]]'](P, V, O);

  // 5. If success is false and Throw is true, throw a TypeError exception.
  if (success.isFalsey && Throw.isTruthy) {
    throw new TypeError('5. If success is false and Throw is true, throw a TypeError exception.');
  }

  // 6. Return success.
  return success;
}

// http://www.ecma-international.org/ecma-262/#sec-createdataproperty
export function $CreateDataProperty(O: $Object, P: $PropertyKey, V: $Any): $Boolean {
  const realm = O.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(O) is Object.
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Let newDesc be the PropertyDescriptor { [[Value]]: V, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
  const newDesc = new $PropertyDescriptor(realm, P);
  newDesc['[[Value]]'] = V;
  newDesc['[[Writable]]'] = intrinsics.true;
  newDesc['[[Enumerable]]'] = intrinsics.true;
  newDesc['[[Configurable]]'] = intrinsics.true;

  // 4. Return ? O.[[DefineOwnProperty]](P, newDesc).
  return O['[[DefineOwnProperty]]'](P, newDesc);
}

// http://www.ecma-international.org/ecma-262/#sec-ordinarysetwithowndescriptor
export function $OrdinarySetWithOwnDescriptor(O: $Object, P: $PropertyKey, V: $Any, Receiver: $Object, ownDesc: $PropertyDescriptor | $Undefined): $Boolean {
  const realm = O.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: IsPropertyKey(P) is true.
  // 2. If ownDesc is undefined, then
  if (ownDesc.isUndefined) {
    // 2. a. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = O['[[GetPrototypeOf]]']();

    // 2. b. If parent is not null, then
    if (!parent.isNull) {
      // 2. b. i. Return ? parent.[[Set]](P, V, Receiver).
      return parent['[[Set]]'](P, V, Receiver);
    }
    // 2. c. Else,
    else {
      // 2. c. i. Set ownDesc to the PropertyDescriptor { [[Value]]: undefined, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true }.
      ownDesc = new $PropertyDescriptor(realm, P);
      ownDesc['[[Value]]'] = intrinsics.undefined;
      ownDesc['[[Writable]]'] = intrinsics.true;
      ownDesc['[[Enumerable]]'] = intrinsics.true;
      ownDesc['[[Configurable]]'] = intrinsics.true;
    }
  }

  // 3. If IsDataDescriptor(ownDesc) is true, then
  if (ownDesc.isDataDescriptor) {
    // 3. a. If ownDesc.[[Writable]] is false, return false.
    if (ownDesc['[[Writable]]'].isFalsey) {
      return intrinsics.false;
    }

    // 3. b. If Type(Receiver) is not Object, return false.
    if (!Receiver.isObject) {
      return intrinsics.false;
    }

    // 3. c. Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
    const existingDescriptor = Receiver['[[GetOwnProperty]]'](P);

    // 3. d. If existingDescriptor is not undefined, then
    if (!existingDescriptor.isUndefined) {
      // 3. d. i. If IsAccessorDescriptor(existingDescriptor) is true, return false.
      if (existingDescriptor.isAccessorDescriptor) {
        return intrinsics.false;
      }

      // 3. d. ii. If existingDescriptor.[[Writable]] is false, return false.
      if (existingDescriptor['[[Writable]]'].isFalsey) {
        return intrinsics.false;
      }

      // 3. d. iii. Let valueDesc be the PropertyDescriptor { [[Value]]: V }.
      const valueDesc = new $PropertyDescriptor(realm, P);
      valueDesc['[[Value]]'] = V;

      // 3. d. iv. Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
      return Receiver['[[DefineOwnProperty]]'](P, valueDesc);
    }
    // 3. e. Else Receiver does not currently have a property P,
    else {
      // 3. e. i. Return ? CreateDataProperty(Receiver, P, V).
      return $CreateDataProperty(Receiver, P, V);
    }
  }

  // 4. Assert: IsAccessorDescriptor(ownDesc) is true.
  // 5. Let setter be ownDesc.[[Set]].
  const setter = ownDesc['[[Set]]'] as $Undefined | $Function;

  // 6. If setter is undefined, return false.
  if (setter.isUndefined) {
    return intrinsics.false;
  }

  // 7. Perform ? Call(setter, Receiver, « V »).
  $Call(setter, Receiver, [V]);

  // 8. Return true.
  return intrinsics.true;
}

// http://www.ecma-international.org/ecma-262/#sec-hasownproperty
export function $HasOwnProperty(O: $Object, P: $PropertyKey): $Boolean {
  const realm = O.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(O) is Object.
  // 2. Assert: IsPropertyKey(P) is true.
  // 3. Let desc be ? O.[[GetOwnProperty]](P).
  const desc = O['[[GetOwnProperty]]'](P);

  // 4. If desc is undefined, return false.
  if (desc.isUndefined) {
    return intrinsics.false;
  }

  // 5. Return true.
  return intrinsics.true;
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

// http://www.ecma-international.org/ecma-262/#sec-construct
export function $Construct(F: $Function, argumentsList?: readonly $Any[], newTarget?: $Any): $Object {
  // 1. If newTarget is not present, set newTarget to F.
  if (newTarget === void 0) {
    newTarget = F;
  }

  // 2. If argumentsList is not present, set argumentsList to a new empty List.
  if (argumentsList === void 0) {
    argumentsList = [];
  }

  // 3. Assert: IsConstructor(F) is true.
  // 4. Assert: IsConstructor(newTarget) is true.
  // 5. Return ? F.[[Construct]](argumentsList, newTarget).
  return F['[[Construct]]'](argumentsList, newTarget);
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
  const realm = O.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: If O is not undefined, then IsPropertyKey(P) is true.
  // 2. If current is undefined, then
  if (current.isUndefined) {
    // 2. a. If extensible is false, return false.
    if (extensible.isFalsey) {
      return intrinsics.false;
    }

    // 2. b. Assert: extensible is true.
    // 2. c. If IsGenericDescriptor(Desc) is true or IsDataDescriptor(Desc) is true, then
    if (Desc.isGenericDescriptor || Desc.isDataDescriptor) {
      // 2. c. i. If O is not undefined, create an own data property named P of object O whose [[Value]], [[Writable]], [[Enumerable]] and [[Configurable]] attribute values are described by Desc. If the value of an attribute field of Desc is absent, the attribute of the newly created property is set to its default value.
      if (!O.isUndefined) {
        const newDesc = new $PropertyDescriptor(realm, P as $PropertyKey);
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
        const newDesc = new $PropertyDescriptor(realm, P as $PropertyKey);
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
        const newDesc = new $PropertyDescriptor(realm, P as $PropertyKey);
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
        const newDesc = new $PropertyDescriptor(realm, P as $PropertyKey);
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


// http://www.ecma-international.org/ecma-262/#sec-set-immutable-prototype
export function $SetImmutablePrototype(O: $Object, V: $Object | $Null): $Boolean {
  const intrinsics = O.realm['[[Intrinsics]]'];

  // 1. Assert: Either Type(V) is Object or Type(V) is Null.
  // 2. Let current be ? O.[[GetPrototypeOf]]().
  const current = O['[[GetPrototypeOf]]']();

  // 3. If SameValue(V, current) is true, return true.
  if (V.is(current)) {
    return intrinsics.true;
  }

  // 4. Return false.
  return intrinsics.false;
}

// http://www.ecma-international.org/ecma-262/#sec-getidentifierreference
export function $GetIdentifierReference(lex: $EnvRec | $Null, name: $String, strict: $Boolean): $Reference {
  const realm = lex.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. If lex is the value null, then
  if (lex.isNull) {
    // 1. a. Return a value of type Reference whose base value component is undefined, whose referenced name component is name, and whose strict reference flag is strict.
    return new $Reference(realm, intrinsics.undefined, name, strict, intrinsics.undefined);
  }

  // 2. Let envRec be lex's EnvironmentRecord.
  const envRec = lex;

  // 3. Let exists be ? envRec.HasBinding(name).
  const exists = envRec.HasBinding(name);

  // 4. If exists is true, then
  if (exists.isTruthy) {
    // 4. a. Return a value of type Reference whose base value component is envRec, whose referenced name component is name, and whose strict reference flag is strict.
    return new $Reference(realm, envRec, name, strict, intrinsics.undefined);
  }
  // 5. Else,
  else {
    // 5. a. Let outer be the value of lex's outer environment reference.
    const outer = lex.outer;

    // 5. b. Return ? GetIdentifierReference(outer, name, strict).
    return $GetIdentifierReference(outer, name, strict);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-abstract-relational-comparison
export function $AbstractRelationalComparison(leftFirst: boolean, x: $Any, y: $Any): $Boolean | $Undefined {
  const realm = x.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  let px: $Primitive;
  let py: $Primitive;

  // 1. If the LeftFirst flag is true, then
  if (leftFirst) {
    // 1. a. Let px be ? ToPrimitive(x, hint Number).
    px = x.ToPrimitive('number');

    // 1. b. Let py be ? ToPrimitive(y, hint Number).
    py = y.ToPrimitive('number');
  }
  // 2. Else the order of evaluation needs to be reversed to preserve left to right evaluation,
  else {
    // 2. a. Let py be ? ToPrimitive(y, hint Number).
    py = y.ToPrimitive('number');

    // 2. b. Let px be ? ToPrimitive(x, hint Number).
    px = x.ToPrimitive('number');
  }

  // 3. If Type(px) is String and Type(py) is String, then
  if (px.isString && py.isString) {
    // 3. a. If IsStringPrefix(py, px) is true, return false.
    // 3. b. If IsStringPrefix(px, py) is true, return true.
    // 3. c. Let k be the smallest nonnegative integer such that the code unit at index k within px is different from the code unit at index k within py. (There must be such a k, for neither String is a prefix of the other.)
    // 3. d. Let m be the integer that is the numeric value of the code unit at index k within px.
    // 3. e. Let n be the integer that is the numeric value of the code unit at index k within py.
    // 3. f. If m < n, return true. Otherwise, return false.
    if (px.value < py.value) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }
  // 4. Else,
  // 4. a. NOTE: Because px and py are primitive values evaluation order is not important.
  // 4. b. Let nx be ? ToNumber(px).
  const nx = px.ToNumber();

  // 4. c. Let ny be ? ToNumber(py).
  const ny = py.ToNumber();

  // 4. d. If nx is NaN, return undefined.
  if (nx.isNaN) {
    return intrinsics.undefined;
  }

  // 4. e. If ny is NaN, return undefined.
  if (ny.isNaN) {
    return intrinsics.undefined;
  }

  // 4. f. If nx and ny are the same Number value, return false.
  if (nx.equals(ny)) {
    return intrinsics.false;
  }

  // 4. g. If nx is +0 and ny is -0, return false.
  if (nx.isPositiveZero && ny.isNegativeZero) {
    return intrinsics.false;
  }

  // 4. h. If nx is -0 and ny is +0, return false.
  if (nx.isNegativeZero && ny.isPositiveZero) {
    return intrinsics.false;
  }

  // 4. i. If nx is +∞, return false.
  if (nx.isPositiveInfinity) {
    return intrinsics.false;
  }

  // 4. j. If ny is +∞, return true.
  if (ny.isPositiveInfinity) {
    return intrinsics.true;
  }

  // 4. k. If ny is -∞, return false.
  if (ny.isNegativeInfinity) {
    return intrinsics.false;
  }

  // 4. l. If nx is -∞, return true.
  if (nx.isNegativeInfinity) {
    return intrinsics.true;
  }

  // 4. m. If the mathematical value of nx is less than the mathematical value of ny—note that these mathematical values are both finite and not both zero—return true. Otherwise, return false.
  if ((px.value as number) < (py.value as number)) {
    return intrinsics.true;
  }

  return intrinsics.false;
}

// http://www.ecma-international.org/ecma-262/#sec-abstract-equality-comparison
export function $AbstractEqualityComparison(x: $Any, y: $Any): $Boolean {
  const realm = x.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. If Type(x) is the same as Type(y), then
  if (x.constructor === y.constructor) {
    // 1. a. Return the result of performing Strict Equality Comparison x === y.
    return $StrictEqualityComparison(x, y);
  }

  // 2. If x is null and y is undefined, return true.
  // 3. If x is undefined and y is null, return true.
  if (x.isNil && y.isNil) {
    return intrinsics.true;
  }

  // 4. If Type(x) is Number and Type(y) is String, return the result of the comparison x == ! ToNumber(y).
  if (x.isNumber && y.isString) {
    if (x.is(y.ToNumber())) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }

  // 5. If Type(x) is String and Type(y) is Number, return the result of the comparison ! ToNumber(x) == y.
  if (x.isString && y.isNumber) {
    if (x.ToNumber().is(y)) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }

  // 6. If Type(x) is Boolean, return the result of the comparison ! ToNumber(x) == y.
  if (x.isBoolean) {
    if (x.ToNumber().is(y)) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }

  // 7. If Type(y) is Boolean, return the result of the comparison x == ! ToNumber(y).
  if (y.isBoolean) {
    if (x.is(y.ToNumber())) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }

  // 8. If Type(x) is either String, Number, or Symbol and Type(y) is Object, return the result of the comparison x == ToPrimitive(y).
  if ((x.isString || x.isNumber || x.isSymbol) && y.isObject) {
    if (x.is(y.ToPrimitive())) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }

  // 9. If Type(x) is Object and Type(y) is either String, Number, or Symbol, return the result of the comparison ToPrimitive(x) == y.
  if (x.isObject && (y.isString || y.isNumber || y.isSymbol)) {
    if (x.ToPrimitive().is(y)) {
      return intrinsics.true;
    }

    return intrinsics.false;
  }

  // 10. Return false.
  return intrinsics.false;
}

// http://www.ecma-international.org/ecma-262/#sec-strict-equality-comparison
export function $StrictEqualityComparison(x: $Any, y: $Any): $Boolean {
  // 1. If Type(x) is different from Type(y), return false.
  // 2. If Type(x) is Number, then
  // 2. a. If x is NaN, return false.
  // 2. b. If y is NaN, return false.
  // 2. c. If x is the same Number value as y, return true.
  // 2. d. If x is +0 and y is -0, return true.
  // 2. e. If x is -0 and y is +0, return true.
  // 2. f. Return false.
  // 3. Return SameValueNonNumber(x, y).
  if (x.is(y)) {
    return x.realm['[[Intrinsics]]'].true;
  }

  return x.realm['[[Intrinsics]]'].false;
}


// http://www.ecma-international.org/ecma-262/#sec-instanceofoperator
export function $InstanceOfOperator(V: $Any, target: $Any): $Boolean {
  const realm = V.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. If Type(target) is not Object, throw a TypeError exception.
  if (!target.isObject) {
    throw new TypeError('1. If Type(target) is not Object, throw a TypeError exception.');
  }

  // 2. Let instOfHandler be ? GetMethod(target, @@hasInstance).
  const instOfhandler = target.GetMethod(intrinsics['@@hasInstance']);

  // 3. If instOfHandler is not undefined, then
  if (!instOfhandler.isUndefined) {
    // 3. a. Return ToBoolean(? Call(instOfHandler, target, « V »)).
    return $Call(instOfhandler, target, [V]).ToBoolean();
  }

  // 4. If IsCallable(target) is false, throw a TypeError exception.
  if (!target.isFunction) {
    throw new TypeError('4. If IsCallable(target) is false, throw a TypeError exception.');
  }

  // 5. Return ? OrdinaryHasInstance(target, V).
  return $OrdinaryHasInstance(target, V);
}

// http://www.ecma-international.org/ecma-262/#sec-ordinaryhasinstance
export function $OrdinaryHasInstance(C: $Object, O: $Any): $Boolean {
  const realm = C.realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. If IsCallable(C) is false, return false.
  if (!C.isFunction) {
    return intrinsics.false;
  }

  // 2. If C has a [[BoundTargetFunction]] internal slot, then
  if (C.isBoundFunction) {
    // 2. a. Let BC be C.[[BoundTargetFunction]].
    const BC = (C as $BoundFunctionExoticObject)['[[BoundTargetFunction]]'];

    // 2. b. Return ? InstanceofOperator(O, BC).
    return $InstanceOfOperator(O, BC);
  }

  // 3. If Type(O) is not Object, return false.
  if (!O.isObject) {
    return intrinsics.false;
  }

  // 4. Let P be ? Get(C, "prototype").
  const P = $Get(C, intrinsics.$prototype);

  // 5. If Type(P) is not Object, throw a TypeError exception.
  if (!P.isObject) {
    throw new TypeError('5. If Type(P) is not Object, throw a TypeError exception.');
  }

  // 6. Repeat,
  while (true) {
    // 6. a. Set O to ? O.[[GetPrototypeOf]]().
    O = (O as $Object)['[[GetPrototypeOf]]']();

    // 6. b. If O is null, return false.
    if (O.isNull) {
      return intrinsics.false;
    }

    // 6. c. If SameValue(P, O) is true, return true.
    if (P.is(O)) {
      return intrinsics.true;
    }
  }
}
