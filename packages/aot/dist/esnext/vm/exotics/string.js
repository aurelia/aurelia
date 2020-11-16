import { $Object, } from '../types/object.js';
import { $String, } from '../types/string.js';
import { $DefinePropertyOrThrow, $ValidateAndApplyPropertyDescriptor, } from '../operations.js';
import { $PropertyDescriptor, } from '../types/property-descriptor.js';
import { $Number, } from '../types/number.js';
import { $List, } from '../types/list.js';
// http://www.ecma-international.org/ecma-262/#sec-string-exotic-objects
export class $StringExoticObject extends $Object {
    // http://www.ecma-international.org/ecma-262/#sec-stringcreate
    // 9.4.3.4 StringCreate ( value , prototype )
    constructor(realm, value, proto) {
        super(realm, 'StringExoticObject', proto, 1 /* normal */, realm['[[Intrinsics]]'].empty);
        // 1. Assert: Type(value) is String.
        // 2. Let S be a newly created String exotic object.
        // 3. Set S.[[StringData]] to value.
        this['[[StringData]]'] = value;
        // 4. Set S's essential internal methods to the default ordinary object definitions specified in 9.1.
        // 5. Set S.[[GetOwnProperty]] as specified in 9.4.3.1.
        // 6. Set S.[[DefineOwnProperty]] as specified in 9.4.3.2.
        // 7. Set S.[[OwnPropertyKeys]] as specified in 9.4.3.3.
        // 8. Set S.[[Prototype]] to prototype.
        // 9. Set S.[[Extensible]] to true.
        // 10. Let length be the number of code unit elements in value.
        const length = value['[[Value]]'].length;
        // 11. Perform ! DefinePropertyOrThrow(S, "length", PropertyDescriptor { [[Value]]: length, [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: false }).
        $DefinePropertyOrThrow(realm.stack.top, this, realm['[[Intrinsics]]'].length, new $PropertyDescriptor(realm, realm['[[Intrinsics]]'].length, {
            '[[Value]]': new $Number(realm, length),
            '[[Writable]]': realm['[[Intrinsics]]'].false,
            '[[Enumerable]]': realm['[[Intrinsics]]'].false,
            '[[Configurable]]': realm['[[Intrinsics]]'].false,
        }));
        // 12. Return S.
    }
    // http://www.ecma-international.org/ecma-262/#sec-string-exotic-objects-getownproperty-p
    // 9.4.3.1 [[GetOwnProperty]] ( P )
    '[[GetOwnProperty]]'(ctx, P) {
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let desc be OrdinaryGetOwnProperty(S, P).
        const desc = super['[[GetOwnProperty]]'](ctx, P);
        // 3. If desc is not undefined, return desc.
        if (!desc.isUndefined) {
            return desc;
        }
        // 4. Return ! StringGetOwnProperty(S, P).
        return $StringGetOwnProperty(ctx, this, P);
    }
    // http://www.ecma-international.org/ecma-262/#sec-string-exotic-objects-defineownproperty-p-desc
    // 9.4.3.2 [[DefineOwnProperty]] ( P , Desc )
    '[[DefineOwnProperty]]'(ctx, P, Desc) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. Let stringDesc be ! StringGetOwnProperty(S, P).
        const stringDesc = $StringGetOwnProperty(ctx, this, P);
        // 3. If stringDesc is not undefined, then
        if (!stringDesc.isUndefined) {
            // 3. a. Let extensible be S.[[Extensible]].
            const extensible = this['[[Extensible]]'];
            // 3. b. Return ! IsCompatiblePropertyDescriptor(extensible, Desc, stringDesc).
            return $ValidateAndApplyPropertyDescriptor(ctx, 
            /* O */ intrinsics.undefined, 
            /* P */ intrinsics.undefined, 
            /* extensible */ extensible, 
            /* Desc */ Desc, 
            /* current */ stringDesc);
        }
        // 4. Return ! OrdinaryDefineOwnProperty(S, P, Desc).
        return super['[[DefineOwnProperty]]'](ctx, P, Desc);
    }
    // http://www.ecma-international.org/ecma-262/#sec-string-exotic-objects-ownpropertykeys
    // 9.4.3.3 [[OwnPropertyKeys]] ( )
    '[[OwnPropertyKeys]]'(ctx) {
        const realm = ctx.Realm;
        // 1. Let keys be a new empty List.
        const keys = new $List();
        // 2. Let str be O.[[StringData]].
        const str = this['[[StringData]]'];
        // 3. Assert: Type(str) is String.
        // 4. Let len be the length of str.
        const len = str['[[Value]]'].length;
        let i = 0;
        let keysLen = 0;
        // 5. For each integer i starting with 0 such that i < len, in ascending order, do
        for (; i < len; ++i) {
            // 5. a. Add ! ToString(i) as the last element of keys.
            keys[keysLen++] = new $String(realm, i.toString());
        }
        // 6. For each own property key P of O such that P is an array index and ToInteger(P) ≥ len, in ascending numeric index order, do
        // 6. a. Add P as the last element of keys.
        // 7. For each own property key P of O such that Type(P) is String and P is not an array index, in ascending chronological order of property creation, do
        // 7. a. Add P as the last element of keys.
        // 8. For each own property key P of O such that Type(P) is Symbol, in ascending chronological order of property creation, do
        // 8. a. Add P as the last element of keys.
        // 9. Return keys.
        return keys;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-stringgetownproperty
function $StringGetOwnProperty(ctx, S, P) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: S is an Object that has a [[StringData]] internal slot.
    // 2. Assert: IsPropertyKey(P) is true.
    // 3. If Type(P) is not String, return undefined.
    if (!P.isString) {
        return intrinsics.undefined;
    }
    // 4. Let index be ! CanonicalNumericIndexString(P).
    const index = P.CanonicalNumericIndexString(ctx);
    // 5. If index is undefined, return undefined.
    if (index.isUndefined) {
        return intrinsics.undefined;
    }
    // 6. If IsInteger(index) is false, return undefined.
    if (!index.IsInteger) {
        return intrinsics.undefined;
    }
    // 7. If index = -0, return undefined.
    if (index.is(intrinsics['-0'])) {
        return intrinsics.undefined;
    }
    // 8. Let str be S.[[StringData]].
    const str = S['[[StringData]]'];
    // 9. Assert: Type(str) is String.
    // 10. Let len be the length of str.
    const len = str['[[Value]]'].length;
    // 11. If index < 0 or len ≤ index, return undefined.
    if (index['[[Value]]'] < 0 || len <= index['[[Value]]']) {
        return intrinsics.undefined;
    }
    // 12. Let resultStr be the String value of length 1, containing one code unit from str, specifically the code unit at index index.
    const resultStr = new $String(realm, str['[[Value]]'][index['[[Value]]']]);
    // 13. Return a PropertyDescriptor { [[Value]]: resultStr, [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false }.
    return new $PropertyDescriptor(realm, P, {
        '[[Value]]': resultStr,
        '[[Writable]]': intrinsics.false,
        '[[Enumerable]]': intrinsics.true,
        '[[Configurable]]': intrinsics.false,
    });
}
//# sourceMappingURL=string.js.map