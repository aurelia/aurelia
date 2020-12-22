import { $PropertyDescriptor, } from './types/property-descriptor.js';
import { $String, } from './types/string.js';
import { $TypeError, } from './types/error.js';
import { $Object, } from './types/object.js';
import { $List, } from './types/list.js';
import { $Empty, } from './types/empty.js';
// http://www.ecma-international.org/ecma-262/#sec-set-o-p-v-throw
export function $Set(ctx, O, P, V, Throw) {
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Assert: Type(Throw) is Boolean.
    // 4. Let success be ? O.[[Set]](P, V, O).
    const success = O['[[Set]]'](ctx, P, V, O);
    if (success.isAbrupt) {
        return success;
    }
    // 5. If success is false and Throw is true, throw a TypeError exception.
    if (success.isFalsey && Throw.isTruthy) {
        return new $TypeError(ctx.Realm, `Cannot set property ${P}`);
    }
    // 6. Return success.
    return success;
}
// http://www.ecma-international.org/ecma-262/#sec-getv
// 7.3.2 GetV ( V , P )
export function $GetV(ctx, V, P) {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let O be ? ToObject(V).
    const O = V.ToObject(ctx);
    if (O.isAbrupt) {
        return O;
    }
    // 3. Return ? O.[[Get]](P, V).
    return O['[[Get]]'](ctx, P, V);
}
// http://www.ecma-international.org/ecma-262/#sec-getmethod
// 7.3.9 GetMethod ( V , P )
export function $GetMethod(ctx, V, P) {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let func be ? GetV(V, P).
    const func = $GetV(ctx, V, P);
    if (func.isAbrupt) {
        return func;
    }
    // 3. If func is either undefined or null, return undefined.
    if (func.isNil) {
        return ctx.Realm['[[Intrinsics]]'].undefined;
    }
    // 4. If IsCallable(func) is false, throw a TypeError exception.
    if (!func.isFunction) {
        return new $TypeError(ctx.Realm, `Property ${P} of ${V} is ${func}, but expected a callable function`);
    }
    // 5. Return func.
    return func;
}
// http://www.ecma-international.org/ecma-262/#sec-createdataproperty
export function $CreateDataProperty(ctx, O, P, V) {
    const realm = ctx.Realm;
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
    return O['[[DefineOwnProperty]]'](ctx, P, newDesc);
}
// http://www.ecma-international.org/ecma-262/#sec-ordinarysetwithowndescriptor
export function $OrdinarySetWithOwnDescriptor(ctx, O, P, V, Receiver, ownDesc) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If ownDesc is undefined, then
    if (ownDesc.isUndefined) {
        // 2. a. Let parent be ? O.[[GetPrototypeOf]]().
        const parent = O['[[GetPrototypeOf]]'](ctx);
        if (parent.isAbrupt) {
            return parent;
        }
        // 2. b. If parent is not null, then
        if (!parent.isNull) {
            // 2. b. i. Return ? parent.[[Set]](P, V, Receiver).
            return parent['[[Set]]'](ctx, P, V, Receiver);
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
        const existingDescriptor = Receiver['[[GetOwnProperty]]'](ctx, P);
        if (existingDescriptor.isAbrupt) {
            return existingDescriptor;
        }
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
            return Receiver['[[DefineOwnProperty]]'](ctx, P, valueDesc);
        }
        // 3. e. Else Receiver does not currently have a property P,
        else {
            // 3. e. i. Return ? CreateDataProperty(Receiver, P, V).
            return $CreateDataProperty(ctx, Receiver, P, V);
        }
    }
    // 4. Assert: IsAccessorDescriptor(ownDesc) is true.
    // 5. Let setter be ownDesc.[[Set]].
    const setter = ownDesc['[[Set]]'];
    // 6. If setter is undefined, return false.
    if (setter.isUndefined) {
        return intrinsics.false;
    }
    // 7. Perform ? Call(setter, Receiver, « V »).
    $Call(ctx, setter, Receiver, new $List(V));
    // 8. Return true.
    return intrinsics.true;
}
// http://www.ecma-international.org/ecma-262/#sec-hasownproperty
export function $HasOwnProperty(ctx, O, P) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Let desc be ? O.[[GetOwnProperty]](P).
    const desc = O['[[GetOwnProperty]]'](ctx, P);
    if (desc.isAbrupt) {
        return desc;
    }
    // 4. If desc is undefined, return false.
    if (desc.isUndefined) {
        return intrinsics.false;
    }
    // 5. Return true.
    return intrinsics.true;
}
// http://www.ecma-international.org/ecma-262/#sec-call
export function $Call(ctx, F, V, argumentsList) {
    // 1. If argumentsList is not present, set argumentsList to a new empty List.
    if (!argumentsList.isList) {
        argumentsList = new $List();
    }
    // 2. If IsCallable(F) is false, throw a TypeError exception.
    if (!F.isFunction) {
        return new $TypeError(ctx.Realm, `${F} is not callable`);
    }
    // 3. Return ? F.[[Call]](V, argumentsList).
    return F['[[Call]]'](ctx, V, argumentsList);
}
// http://www.ecma-international.org/ecma-262/#sec-construct
export function $Construct(ctx, F, argumentsList, newTarget) {
    // 1. If newTarget is not present, set newTarget to F.
    if (newTarget.isUndefined) {
        newTarget = F;
    }
    // 2. If argumentsList is not present, set argumentsList to a new empty List.
    if (!argumentsList.isList) {
        argumentsList = new $List();
    }
    // 3. Assert: IsConstructor(F) is true.
    // 4. Assert: IsConstructor(newTarget) is true.
    // 5. Return ? F.[[Construct]](argumentsList, newTarget).
    return F['[[Construct]]'](ctx, argumentsList, newTarget);
}
// http://www.ecma-international.org/ecma-262/#sec-definepropertyorthrow
export function $DefinePropertyOrThrow(ctx, O, P, desc) {
    // 1. Assert: Type(O) is Object.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. Let success be ? O.[[DefineOwnProperty]](P, desc).
    const success = O['[[DefineOwnProperty]]'](ctx, P, desc);
    if (success.isAbrupt) {
        return success;
    }
    // 4. If success is false, throw a TypeError exception.
    if (success.isFalsey) {
        return new $TypeError(ctx.Realm, `Failed to define property ${P} on ${O}`);
    }
    // 5. Return success.
    return success;
}
// http://www.ecma-international.org/ecma-262/#sec-validateandapplypropertydescriptor
export function $ValidateAndApplyPropertyDescriptor(ctx, O, P, extensible, Desc, current) {
    const realm = ctx.Realm;
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
                const newDesc = new $PropertyDescriptor(realm, P);
                if (Desc['[[Value]]'].isEmpty) {
                    newDesc['[[Value]]'] = intrinsics.undefined;
                }
                else {
                    newDesc['[[Value]]'] = Desc['[[Value]]'];
                }
                if (Desc['[[Writable]]'].isEmpty) {
                    newDesc['[[Writable]]'] = intrinsics.false;
                }
                else {
                    newDesc['[[Writable]]'] = Desc['[[Writable]]'];
                }
                if (Desc['[[Enumerable]]'].isEmpty) {
                    newDesc['[[Enumerable]]'] = intrinsics.false;
                }
                else {
                    newDesc['[[Enumerable]]'] = Desc['[[Enumerable]]'];
                }
                if (Desc['[[Configurable]]'].isEmpty) {
                    newDesc['[[Configurable]]'] = intrinsics.false;
                }
                else {
                    newDesc['[[Configurable]]'] = Desc['[[Configurable]]'];
                }
                O['setProperty'](newDesc);
            }
        }
        // 2. d. Else Desc must be an accessor Property Descriptor,
        else {
            // 2. d. i. If O is not undefined, create an own accessor property named P of object O whose [[Get]], [[Set]], [[Enumerable]] and [[Configurable]] attribute values are described by Desc. If the value of an attribute field of Desc is absent, the attribute of the newly created property is set to its default value.
            if (!O.isUndefined) {
                const newDesc = new $PropertyDescriptor(realm, P);
                if (Desc['[[Get]]'].isEmpty) {
                    newDesc['[[Get]]'] = intrinsics.undefined;
                }
                else {
                    newDesc['[[Get]]'] = Desc['[[Get]]'];
                }
                if (Desc['[[Set]]'].isEmpty) {
                    newDesc['[[Set]]'] = intrinsics.undefined;
                }
                else {
                    newDesc['[[Set]]'] = Desc['[[Set]]'];
                }
                if (Desc['[[Enumerable]]'].isEmpty) {
                    newDesc['[[Enumerable]]'] = intrinsics.false;
                }
                else {
                    newDesc['[[Enumerable]]'] = Desc['[[Enumerable]]'];
                }
                if (Desc['[[Configurable]]'].isEmpty) {
                    newDesc['[[Configurable]]'] = intrinsics.false;
                }
                else {
                    newDesc['[[Configurable]]'] = Desc['[[Configurable]]'];
                }
                O['setProperty'](newDesc);
            }
        }
        // 2. e. Return true.
        return intrinsics.true;
    }
    // 3. If every field in Desc is absent, return true.
    if (Desc['[[Configurable]]'].isEmpty &&
        Desc['[[Enumerable]]'].isEmpty &&
        Desc['[[Writable]]'].isEmpty &&
        Desc['[[Value]]'].isEmpty &&
        Desc['[[Get]]'].isEmpty &&
        Desc['[[Set]]'].isEmpty) {
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
    // eslint-disable-next-line no-empty
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
                const existingDesc = O['getProperty'](P);
                const newDesc = new $PropertyDescriptor(realm, P);
                newDesc['[[Configurable]]'] = existingDesc['[[Configurable]]'];
                newDesc['[[Enumerable]]'] = existingDesc['[[Enumerable]]'];
                newDesc['[[Get]]'] = intrinsics.undefined;
                newDesc['[[Set]]'] = intrinsics.undefined;
                O['setProperty'](newDesc);
            }
        }
        // 6. c. Else,
        else {
            // 6. c. i. If O is not undefined, convert the property named P of object O from an accessor property to a data property. Preserve the existing values of the converted property's [[Configurable]] and [[Enumerable]] attributes and set the rest of the property's attributes to their default values.
            if (!O.isUndefined) {
                const existingDesc = O['getProperty'](P);
                const newDesc = new $PropertyDescriptor(realm, P);
                newDesc['[[Configurable]]'] = existingDesc['[[Configurable]]'];
                newDesc['[[Enumerable]]'] = existingDesc['[[Enumerable]]'];
                newDesc['[[Writable]]'] = intrinsics.false;
                newDesc['[[Value]]'] = intrinsics.undefined;
                O['setProperty'](newDesc);
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
        const existingDesc = O['getProperty'](P);
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
export function $SetImmutablePrototype(ctx, O, V) {
    const intrinsics = O.realm['[[Intrinsics]]'];
    // 1. Assert: Either Type(V) is Object or Type(V) is Null.
    // 2. Let current be ? O.[[GetPrototypeOf]]().
    const current = O['[[GetPrototypeOf]]'](ctx);
    if (current.isAbrupt) {
        return current;
    }
    // 3. If SameValue(V, current) is true, return true.
    if (V.is(current)) {
        return intrinsics.true;
    }
    // 4. Return false.
    return intrinsics.false;
}
// http://www.ecma-international.org/ecma-262/#sec-abstract-relational-comparison
export function $AbstractRelationalComparison(ctx, leftFirst, x, y) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    let px;
    let py;
    // 1. If the LeftFirst flag is true, then
    if (leftFirst) {
        // 1. a. Let px be ? ToPrimitive(x, hint Number).
        px = x.ToPrimitive(ctx, 'number');
        if (px.isAbrupt) {
            return px;
        }
        // 1. b. Let py be ? ToPrimitive(y, hint Number).
        py = y.ToPrimitive(ctx, 'number');
        if (py.isAbrupt) {
            return py;
        }
    }
    // 2. Else the order of evaluation needs to be reversed to preserve left to right evaluation,
    else {
        // 2. a. Let py be ? ToPrimitive(y, hint Number).
        py = y.ToPrimitive(ctx, 'number');
        if (py.isAbrupt) {
            return py;
        }
        // 2. b. Let px be ? ToPrimitive(x, hint Number).
        px = x.ToPrimitive(ctx, 'number');
        if (px.isAbrupt) {
            return px;
        }
    }
    // 3. If Type(px) is String and Type(py) is String, then
    if (px.isString && py.isString) {
        // 3. a. If IsStringPrefix(py, px) is true, return false.
        // 3. b. If IsStringPrefix(px, py) is true, return true.
        // 3. c. Let k be the smallest nonnegative integer such that the code unit at index k within px is different from the code unit at index k within py. (There must be such a k, for neither String is a prefix of the other.)
        // 3. d. Let m be the integer that is the numeric value of the code unit at index k within px.
        // 3. e. Let n be the integer that is the numeric value of the code unit at index k within py.
        // 3. f. If m < n, return true. Otherwise, return false.
        if (px['[[Value]]'] < py['[[Value]]']) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 4. Else,
    // 4. a. NOTE: Because px and py are primitive values evaluation order is not important.
    // 4. b. Let nx be ? ToNumber(px).
    const nx = px.ToNumber(ctx);
    if (nx.isAbrupt) {
        return nx;
    }
    // 4. c. Let ny be ? ToNumber(py).
    const ny = py.ToNumber(ctx);
    if (ny.isAbrupt) {
        return ny;
    }
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
    if (px['[[Value]]'] < py['[[Value]]']) {
        return intrinsics.true;
    }
    return intrinsics.false;
}
// http://www.ecma-international.org/ecma-262/#sec-abstract-equality-comparison
export function $AbstractEqualityComparison(ctx, x, y) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If Type(x) is the same as Type(y), then
    if (x.constructor === y.constructor) {
        // 1. a. Return the result of performing Strict Equality Comparison x === y.
        return $StrictEqualityComparison(ctx, x, y);
    }
    // 2. If x is null and y is undefined, return true.
    // 3. If x is undefined and y is null, return true.
    if (x.isNil && y.isNil) {
        return intrinsics.true;
    }
    // 4. If Type(x) is Number and Type(y) is String, return the result of the comparison x == ! ToNumber(y).
    if (x.isNumber && y.isString) {
        if (x.is(y.ToNumber(ctx))) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 5. If Type(x) is String and Type(y) is Number, return the result of the comparison ! ToNumber(x) == y.
    if (x.isString && y.isNumber) {
        if (x.ToNumber(ctx).is(y)) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 6. If Type(x) is Boolean, return the result of the comparison ! ToNumber(x) == y.
    if (x.isBoolean) {
        if (x.ToNumber(ctx).is(y)) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 7. If Type(y) is Boolean, return the result of the comparison x == ! ToNumber(y).
    if (y.isBoolean) {
        if (x.is(y.ToNumber(ctx))) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 8. If Type(x) is either String, Number, or Symbol and Type(y) is Object, return the result of the comparison x == ToPrimitive(y).
    if ((x.isString || x.isNumber || x.isSymbol) && y.isObject) {
        const yPrim = y.ToPrimitive(ctx);
        if (yPrim.isAbrupt) {
            return yPrim;
        }
        if (x.is(yPrim)) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 9. If Type(x) is Object and Type(y) is either String, Number, or Symbol, return the result of the comparison ToPrimitive(x) == y.
    if (x.isObject && (y.isString || y.isNumber || y.isSymbol)) {
        if (x.ToPrimitive(ctx).is(y)) {
            return intrinsics.true;
        }
        return intrinsics.false;
    }
    // 10. Return false.
    return intrinsics.false;
}
// http://www.ecma-international.org/ecma-262/#sec-strict-equality-comparison
export function $StrictEqualityComparison(ctx, x, y) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
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
        return intrinsics.true;
    }
    return intrinsics.false;
}
// http://www.ecma-international.org/ecma-262/#sec-instanceofoperator
export function $InstanceOfOperator(ctx, V, target) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
        return new $TypeError(realm, `Right-hand side of 'instanceof' operator is ${target}, but expected an object`);
    }
    // 2. Let instOfHandler be ? GetMethod(target, @@hasInstance).
    const instOfhandler = target.GetMethod(ctx, intrinsics['@@hasInstance']);
    if (instOfhandler.isAbrupt) {
        return instOfhandler;
    }
    // 3. If instOfHandler is not undefined, then
    if (!instOfhandler.isUndefined) {
        // 3. a. Return ToBoolean(? Call(instOfHandler, target, « V »)).
        return $Call(ctx, instOfhandler, target, new $List(V)).ToBoolean(ctx);
    }
    // 4. If IsCallable(target) is false, throw a TypeError exception.
    if (!target.isFunction) {
        return new $TypeError(realm, `Right-hand side of 'instanceof' operator is ${target}, but expected a callable function`);
    }
    // 5. Return ? OrdinaryHasInstance(target, V).
    return $OrdinaryHasInstance(ctx, target, V);
}
// http://www.ecma-international.org/ecma-262/#sec-ordinaryhasinstance
export function $OrdinaryHasInstance(ctx, C, O) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If IsCallable(C) is false, return false.
    if (!C.isFunction) {
        return intrinsics.false;
    }
    // 2. If C has a [[BoundTargetFunction]] internal slot, then
    if (C.isBoundFunction) {
        // 2. a. Let BC be C.[[BoundTargetFunction]].
        const BC = C['[[BoundTargetFunction]]'];
        // 2. b. Return ? InstanceofOperator(O, BC).
        return $InstanceOfOperator(ctx, O, BC);
    }
    // 3. If Type(O) is not Object, return false.
    if (!O.isObject) {
        return intrinsics.false;
    }
    // 4. Let P be ? Get(C, "prototype").
    const P = C['[[Get]]'](ctx, intrinsics.$prototype, C);
    if (P.isAbrupt) {
        return P;
    }
    // 5. If Type(P) is not Object, throw a TypeError exception.
    if (!P.isObject) {
        return new $TypeError(realm, `Prototype of right-hand side of 'instanceof' operator ${O} is ${P}, but expected an object`);
    }
    // 6. Repeat,
    while (true) {
        // 6. a. Set O to ? O.[[GetPrototypeOf]]().
        const $O = O['[[GetPrototypeOf]]'](ctx);
        if ($O.isAbrupt) {
            return $O;
        }
        O = $O;
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
// http://www.ecma-international.org/ecma-262/#sec-topropertydescriptor
export function $ToPropertyDescriptor(ctx, Obj, key) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If Type(Obj) is not Object, throw a TypeError exception.
    if (!Obj.isObject) {
        return new $TypeError(realm, `Cannot convert ${Obj} to property descriptor for property ${key}: expected an object`);
    }
    // 2. Let desc be a new Property Descriptor that initially has no fields.
    const desc = new $PropertyDescriptor(Obj.realm, key);
    // 3. Let hasEnumerable be ? HasProperty(Obj, "enumerable").
    const hasEnumerable = Obj['[[HasProperty]]'](ctx, intrinsics.$enumerable);
    if (hasEnumerable.isAbrupt) {
        return hasEnumerable;
    }
    // 4. If hasEnumerable is true, then
    if (hasEnumerable.isTruthy) {
        // 4. a. Let enumerable be ToBoolean(? Get(Obj, "enumerable")).
        const enumerable = Obj['[[Get]]'](ctx, intrinsics.$enumerable, Obj).ToBoolean(ctx);
        if (enumerable.isAbrupt) {
            return enumerable;
        }
        // 4. b. Set desc.[[Enumerable]] to enumerable.
        desc['[[Enumerable]]'] = enumerable;
    }
    // 5. Let hasConfigurable be ? HasProperty(Obj, "configurable").
    const hasConfigurable = Obj['[[HasProperty]]'](ctx, intrinsics.$configurable);
    if (hasConfigurable.isAbrupt) {
        return hasConfigurable;
    }
    // 6. If hasConfigurable is true, then
    if (hasConfigurable.isTruthy) {
        // 6. a. Let configurable be ToBoolean(? Get(Obj, "configurable")).
        const configurable = Obj['[[Get]]'](ctx, intrinsics.$configurable, Obj).ToBoolean(ctx);
        if (configurable.isAbrupt) {
            return configurable;
        }
        // 6. b. Set desc.[[Configurable]] to configurable.
        desc['[[Enumerable]]'] = configurable;
    }
    // 7. Let hasValue be ? HasProperty(Obj, "value").
    const hasValue = Obj['[[HasProperty]]'](ctx, intrinsics.$value);
    if (hasValue.isAbrupt) {
        return hasValue;
    }
    // 8. If hasValue is true, then
    if (hasValue.isTruthy) {
        // 8. a. Let value be ? Get(Obj, "value").
        const value = Obj['[[Get]]'](ctx, intrinsics.$value, Obj).ToBoolean(ctx);
        if (value.isAbrupt) {
            return value;
        }
        // 8. b. Set desc.[[Value]] to value.
        desc['[[Enumerable]]'] = value;
    }
    // 9. Let hasWritable be ? HasProperty(Obj, "writable").
    const hasWritable = Obj['[[HasProperty]]'](ctx, intrinsics.$writable);
    if (hasWritable.isAbrupt) {
        return hasWritable;
    }
    // 10. If hasWritable is true, then
    if (hasWritable.isTruthy) {
        // 10. a. Let writable be ToBoolean(? Get(Obj, "writable")).
        const writable = Obj['[[Get]]'](ctx, intrinsics.$writable, Obj).ToBoolean(ctx);
        if (writable.isAbrupt) {
            return writable;
        }
        // 10. b. Set desc.[[Writable]] to writable.
        desc['[[Enumerable]]'] = writable;
    }
    // 11. Let hasGet be ? HasProperty(Obj, "get").
    const hasGet = Obj['[[HasProperty]]'](ctx, intrinsics.$get);
    if (hasGet.isAbrupt) {
        return hasGet;
    }
    // 12. If hasGet is true, then
    if (hasGet.isTruthy) {
        // 12. a. Let getter be ? Get(Obj, "get").
        const getter = Obj['[[Get]]'](ctx, intrinsics.$get, Obj);
        if (getter.isAbrupt) {
            return getter;
        }
        // 12. b. If IsCallable(getter) is false and getter is not undefined, throw a TypeError exception.
        if (!getter.isFunction && !getter.isUndefined) {
            return new $TypeError(realm, `Cannot convert ${Obj} to property descriptor for property ${key}: the getter is neither a callable function nor undefined`);
        }
        // 12. c. Set desc.[[Get]] to getter.
        desc['[[Get]]'] = getter;
    }
    // 13. Let hasSet be ? HasProperty(Obj, "set").
    const hasSet = Obj['[[HasProperty]]'](ctx, intrinsics.$set);
    if (hasSet.isAbrupt) {
        return hasSet;
    }
    // 14. If hasSet is true, then
    if (hasSet.isTruthy) {
        // 14. a. Let setter be ? Get(Obj, "set").
        const setter = Obj['[[Get]]'](ctx, intrinsics.$set, Obj);
        if (setter.isAbrupt) {
            return setter;
        }
        // 14. b. If IsCallable(setter) is false and setter is not undefined, throw a TypeError exception.
        if (!setter.isFunction && !setter.isUndefined) {
            return new $TypeError(realm, `Cannot convert ${Obj} to property descriptor for property ${key}: the setter is neither a callable function nor undefined`);
        }
        // 14. c. Set desc.[[Set]] to setter.
        desc['[[Set]]'] = setter;
    }
    // 15. If desc.[[Get]] is present or desc.[[Set]] is present, then
    if (desc['[[Get]]'].hasValue || desc['[[Set]]'].hasValue) {
        // 15. a. If desc.[[Value]] is present or desc.[[Writable]] is present, throw a TypeError exception.
        if (desc['[[Value]]'].hasValue || desc['[[Writable]]'].hasValue) {
            return new $TypeError(realm, `Cannot convert ${Obj} to property descriptor for property ${key}: there is a getter and/or setter, as well as a writable and/or value property`);
        }
    }
    // 16. Return desc.
    return desc;
}
export function $FromPropertyDescriptor(ctx, Desc) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If Desc is undefined, return undefined.
    if (Desc.isUndefined) {
        return intrinsics.undefined;
    }
    // 2. Let obj be ObjectCreate(%ObjectPrototype%).
    const obj = $Object.ObjectCreate(ctx, 'PropertyDescriptor', intrinsics['%ObjectPrototype%']);
    // 3. Assert: obj is an extensible ordinary object with no own properties.
    // 4. If Desc has a [[Value]] field, then
    if (Desc['[[Value]]'].hasValue) {
        // 4. a. Perform CreateDataProperty(obj, "value", Desc.[[Value]]).
        $CreateDataProperty(ctx, obj, intrinsics.$value, Desc['[[Value]]']);
    }
    // 5. If Desc has a [[Writable]] field, then
    if (Desc['[[Writable]]'].hasValue) {
        // 5. a. Perform CreateDataProperty(obj, "writable", Desc.[[Writable]]).
        $CreateDataProperty(ctx, obj, intrinsics.$writable, Desc['[[Writable]]']);
    }
    // 6. If Desc has a [[Get]] field, then
    if (Desc['[[Get]]'].hasValue) {
        // 6. a. Perform CreateDataProperty(obj, "get", Desc.[[Get]]).
        $CreateDataProperty(ctx, obj, intrinsics.$get, Desc['[[Get]]']);
    }
    // 7. If Desc has a [[Set]] field, then
    if (Desc['[[Set]]'].hasValue) {
        // 7. a. Perform CreateDataProperty(obj, "set", Desc.[[Set]]).
        $CreateDataProperty(ctx, obj, intrinsics.$set, Desc['[[Set]]']);
    }
    // 8. If Desc has an [[Enumerable]] field, then
    if (Desc['[[Enumerable]]'].hasValue) {
        // 8. a. Perform CreateDataProperty(obj, "enumerable", Desc.[[Enumerable]]).
        $CreateDataProperty(ctx, obj, intrinsics.$enumerable, Desc['[[Enumerable]]']);
    }
    // 9. If Desc has a [[Configurable]] field, then
    if (Desc['[[Configurable]]'].hasValue) {
        // 9. a. Perform CreateDataProperty(obj, "configurable", Desc.[[Configurable]]).
        $CreateDataProperty(ctx, obj, intrinsics.$configurable, Desc['[[Configurable]]']);
    }
    // 10. Assert: All of the above CreateDataProperty operations return true.
    // 11. Return obj.
    return obj;
}
const defaultElementTypes = [
    'Undefined',
    'Null',
    'Boolean',
    'String',
    'Symbol',
    'Number',
    'Object',
];
// http://www.ecma-international.org/ecma-262/#sec-createlistfromarraylike
export function $CreateListFromArrayLike(ctx, obj, elementTypes = defaultElementTypes) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If elementTypes is not present, set elementTypes to « Undefined, Null, Boolean, String, Symbol, Number, Object ».
    // 2. If Type(obj) is not Object, throw a TypeError exception.
    if (!obj.isObject) {
        return new $TypeError(realm, `Cannot convert ${obj} to list: expected an object`);
    }
    // 3. Let len be ? ToLength(? Get(obj, "length")).
    const len = obj['[[Get]]'](ctx, intrinsics.length, obj).ToLength(ctx);
    if (len.isAbrupt) {
        return len;
    }
    // 4. Let list be a new empty List.
    const list = new $List();
    // 5. Let index be 0.
    let index = 0;
    // 6. Repeat, while index < len
    while (index < len['[[Value]]']) {
        // 6. a. Let indexName be ! ToString(index).
        const indexName = new $String(realm, index.toString());
        // 6. b. Let next be ? Get(obj, indexName).
        const next = obj['[[Get]]'](ctx, indexName, obj);
        if (next.isAbrupt) {
            return next;
        }
        // 6. c. If Type(next) is not an element of elementTypes, throw a TypeError exception.
        if (!elementTypes.includes(next.Type)) {
            return new $TypeError(realm, `Cannot convert ${obj} to list: one of the elements (${next}) is of type ${next.Type}, but expected one of: ${elementTypes}`);
        }
        // 6. d. Append next as the last element of list.
        list[index++] = next;
        // 6. e. Increase index by 1.
    }
    // 7. Return list.
    return list;
}
// http://www.ecma-international.org/ecma-262/#sec-getfunctionrealm
export function $GetFunctionRealm(ctx, obj) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: obj is a callable object.
    // 2. If obj has a [[Realm]] internal slot, then
    if ('[[Realm]]' in obj) {
        // 2. a. Return obj.[[Realm]].
        return obj['[[Realm]]'];
    }
    // 3. If obj is a Bound Function exotic object, then
    if (obj.isBoundFunction) {
        // 3. a. Let target be obj.[[BoundTargetFunction]].
        // 3. b. Return ? GetFunctionRealm(target).
        return $GetFunctionRealm(ctx, obj['[[BoundTargetFunction]]']);
    }
    // 4. If obj is a Proxy exotic object, then
    if (obj.isProxy) {
        // 4. a. If obj.[[ProxyHandler]] is null, throw a TypeError exception.
        if (obj['[[ProxyHandler]]'].isNull) {
            return new $TypeError(realm, `Cannot retrieve function realm of proxy object with a null handler`);
        }
        // 4. b. Let proxyTarget be obj.[[ProxyTarget]].
        const proxyTarget = obj['[[ProxyTarget]]'];
        // 4. c. Return ? GetFunctionRealm(proxyTarget).
        return $GetFunctionRealm(ctx, proxyTarget);
    }
    // 5. Return the current Realm Record.
    return realm;
}
// http://www.ecma-international.org/ecma-262/#sec-copydataproperties
// 7.3.23 CopyDataProperties ( target , source , excludedItems )
export function $CopyDataProperties(ctx, target, source, excludedItems) {
    // 1. Assert: Type(target) is Object.
    // 2. Assert: excludedItems is a List of property keys.
    // 3. If source is undefined or null, return target.
    if (source.isNil) {
        return target;
    }
    // 4. Let from be ! ToObject(source).
    const from = source.ToObject(ctx);
    // 5. Let keys be ? from.[[OwnPropertyKeys]]().
    const keys = from['[[OwnPropertyKeys]]'](ctx);
    if (keys.isAbrupt) {
        return keys;
    }
    // 6. For each element nextKey of keys in List order, do
    for (const nextKey of keys) {
        // 6. a. Let excluded be false.
        // 6. b. For each element e of excludedItems in List order, do
        // 6. b. i. If SameValue(e, nextKey) is true, then
        // 6. b. i. 1. Set excluded to true.
        // 6. c. If excluded is false, then
        if (!excludedItems.some(x => x.is(nextKey))) {
            // 6. c. i. Let desc be ? from.[[GetOwnProperty]](nextKey).
            const desc = from['[[GetOwnProperty]]'](ctx, nextKey);
            if (desc.isAbrupt) {
                return desc;
            }
            // 6. c. ii. If desc is not undefined and desc.[[Enumerable]] is true, then
            if (!desc.isUndefined && desc['[[Enumerable]]'].isTruthy) {
                // 6. c. ii. 1. Let propValue be ? Get(from, nextKey).
                const propValue = from['[[Get]]'](ctx, nextKey, from);
                if (propValue.isAbrupt) {
                    return propValue;
                }
                // 6. c. ii. 2. Perform ! CreateDataProperty(target, nextKey, propValue).
                $CreateDataProperty(ctx, target, nextKey, propValue);
            }
        }
    }
    // 7. Return target.
    return target;
}
// http://www.ecma-international.org/ecma-262/#sec-loopcontinues
// 13.7.1.2 Runtime Semantics: LoopContinues ( completion , labelSet )
export function $LoopContinues(ctx, completion, labelSet) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If completion.[[Type]] is normal, return true.
    if (completion['[[Type]]'] === 1 /* normal */) {
        return intrinsics.true;
    }
    // 2. If completion.[[Type]] is not continue, return false.
    if (completion['[[Type]]'] !== 3 /* continue */) {
        return intrinsics.false;
    }
    // 3. If completion.[[Target]] is empty, return true.
    if (completion['[[Target]]'].isEmpty) {
        return intrinsics.true;
    }
    // 4. If completion.[[Target]] is an element of labelSet, return true.
    if (labelSet.has(completion['[[Target]]'])) {
        return intrinsics.true;
    }
    // 5. Return false.
    return intrinsics.false;
}
// http://www.ecma-international.org/ecma-262/#sec-hostensurecancompilestrings
// 18.2.1.2 HostEnsureCanCompileStrings ( callerRealm , calleeRealm )
export function $HostEnsureCanCompileStrings(ctx, callerRealm, calleeRealm) {
    // HostEnsureCanCompileStrings is an implementation-defined abstract operation that allows host environments
    // to block certain ECMAScript functions which allow developers to compile strings into ECMAScript code.
    // An implementation of HostEnsureCanCompileStrings may complete normally or abruptly.
    // Any abrupt completions will be propagated to its callers.
    // The default implementation of HostEnsureCanCompileStrings is to unconditionally return an empty normal completion.
    return new $Empty(calleeRealm);
}
// http://www.ecma-international.org/ecma-262/#sec-invoke
// 7.3.18 Invoke ( V , P [ , argumentsList ] )
export function $Invoke(ctx, V, P, argumentsList) {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If argumentsList is not present, set argumentsList to a new empty List.
    if (!argumentsList.isList) {
        argumentsList = new $List();
    }
    // 3. Let func be ? GetV(V, P).
    const func = $GetV(ctx, V, P);
    if (func.isAbrupt) {
        return func;
    }
    // 4. Return ? Call(func, V, argumentsList).
    return $Call(ctx, func, V, argumentsList);
}
// http://www.ecma-international.org/ecma-262/#sec-speciesconstructor
// 7.3.20 SpeciesConstructor ( O , defaultConstructor )
export function $SpeciesConstructor(ctx, O, defaultConstructor) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(O) is Object.
    // 2. Let C be ? Get(O, "constructor").
    const C = O['[[Get]]'](ctx, intrinsics.$constructor, O);
    if (C.isAbrupt) {
        return C;
    }
    // 3. If C is undefined, return defaultConstructor.
    if (C.isUndefined) {
        return defaultConstructor;
    }
    // 4. If Type(C) is not Object, throw a TypeError exception.
    if (!C.isObject) {
        return new $TypeError(realm, `Expected 'this' to be an object, but got: ${C}`);
    }
    // 5. Let S be ? Get(C, @@species).
    const S = C['[[Get]]'](ctx, intrinsics['@@species'], C);
    if (S.isAbrupt) {
        return S;
    }
    // 6. If S is either undefined or null, return defaultConstructor.
    if (S.isNil) {
        return defaultConstructor;
    }
    // 7. If IsConstructor(S) is true, return S.
    if (S.isFunction) {
        return S;
    }
    // 8. Throw a TypeError exception.
    return new $TypeError(realm, `Expected return value of @@species to be null, undefined or a function, but got: ${S}`);
}
//# sourceMappingURL=operations.js.map