"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$CreateArrayFromList = exports.$ArraySpeciesCreate = exports.$ArrayExoticObject = void 0;
const object_js_1 = require("../types/object.js");
const number_js_1 = require("../types/number.js");
const property_descriptor_js_1 = require("../types/property-descriptor.js");
const operations_js_1 = require("../operations.js");
const string_js_1 = require("../types/string.js");
const error_js_1 = require("../types/error.js");
const list_js_1 = require("../types/list.js");
// http://www.ecma-international.org/ecma-262/#sec-array-exotic-objects
class $ArrayExoticObject extends object_js_1.$Object {
    get isArray() { return true; }
    // http://www.ecma-international.org/ecma-262/#sec-arraycreate
    // 9.4.2.2 ArrayCreate ( length [ , proto ] )
    constructor(realm, length, proto) {
        const intrinsics = realm['[[Intrinsics]]'];
        if (proto === void 0) {
            proto = intrinsics['%ArrayPrototype%'];
        }
        super(realm, 'ArrayExoticObject', proto, 1 /* normal */, intrinsics.empty);
        // 1. Assert: length is an integer Number ≥ 0.
        // 2. If length is -0, set length to +0.
        if (length.is(intrinsics['-0'])) {
            length = intrinsics['0'];
        }
        // 3. If length > 232 - 1, throw a RangeError exception.
        if (length['[[Value]]'] > (2 ** 32 - 1)) {
            // TODO: move logic to static method so we can return an error completion
            throw new RangeError('3. If length > 2^32 - 1, throw a RangeError exception.');
        }
        // 4. If proto is not present, set proto to the intrinsic object %ArrayPrototype%.
        // 5. Let A be a newly created Array exotic object.
        // 6. Set A's essential internal methods except for [[DefineOwnProperty]] to the default ordinary object definitions specified in 9.1.
        // 7. Set A.[[DefineOwnProperty]] as specified in 9.4.2.1.
        // 8. Set A.[[Prototype]] to proto.
        // 9. Set A.[[Extensible]] to true.
        // 10. Perform ! OrdinaryDefineOwnProperty(A, "length", PropertyDescriptor { [[Value]]: length, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
        super['[[DefineOwnProperty]]'](realm.stack.top, intrinsics.length, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.length, {
            '[[Value]]': length,
            '[[Writable]]': intrinsics.true,
            '[[Enumerable]]': intrinsics.false,
            '[[Configurable]]': intrinsics.false,
        }));
        // 11. Return A.
    }
    // http://www.ecma-international.org/ecma-262/#sec-array-exotic-objects-defineownproperty-p-desc
    // 9.4.2.1 [[DefineOwnProperty]] ( P , Desc )
    '[[DefineOwnProperty]]'(ctx, P, Desc) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Assert: IsPropertyKey(P) is true.
        // 2. If P is "length", then
        if (P.is(intrinsics.length)) {
            // 2. a. Return ? ArraySetLength(A, Desc).
            return this.ArraySetLength(ctx, Desc);
        }
        // 3. Else if P is an array index, then
        else if (P.IsArrayIndex) {
            // 3. a. Let oldLenDesc be OrdinaryGetOwnProperty(A, "length").
            const oldLenDesc = super['[[GetOwnProperty]]'](ctx, intrinsics.length);
            // 3. b. Assert: oldLenDesc will never be undefined or an accessor descriptor because Array objects are created with a length data property that cannot be deleted or reconfigured.
            // 3. c. Let oldLen be oldLenDesc.[[Value]].
            const oldLen = oldLenDesc['[[Value]]'];
            // 3. d. Let index be ! ToUint32(P).
            const index = P.ToUint32(ctx);
            // 3. e. If index ≥ oldLen and oldLenDesc.[[Writable]] is false, return false.
            if (index['[[Value]]'] >= oldLen['[[Value]]'] && oldLenDesc['[[Writable]]'].isFalsey) {
                return intrinsics.false;
            }
            // 3. f. Let succeeded be ! OrdinaryDefineOwnProperty(A, P, Desc).
            const succeeded = super['[[DefineOwnProperty]]'](ctx, P, Desc);
            // 3. g. If succeeded is false, return false.
            if (succeeded.isFalsey) {
                return intrinsics.false;
            }
            // 3. h. If index ≥ oldLen, then
            if (index['[[Value]]'] >= oldLen['[[Value]]']) {
                // 3. h. i. Set oldLenDesc.[[Value]] to index + 1.
                oldLenDesc['[[Value]]'] = new number_js_1.$Number(realm, index['[[Value]]'] + 1);
                // 3. h. ii. Let succeeded be OrdinaryDefineOwnProperty(A, "length", oldLenDesc).
                const succeeded = super['[[DefineOwnProperty]]'](ctx, intrinsics.length, oldLenDesc);
                // 3. h. iii. Assert: succeeded is true.
            }
            // 3. i. Return true.
            return intrinsics.true;
        }
        // 4. Return OrdinaryDefineOwnProperty(A, P, Desc).
        return super['[[DefineOwnProperty]]'](ctx, P, Desc);
    }
    // http://www.ecma-international.org/ecma-262/#sec-arraysetlength
    // 9.4.2.4 ArraySetLength ( A , Desc )
    ArraySetLength(ctx, Desc) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If Desc.[[Value]] is absent, then
        if (Desc['[[Value]]'].isEmpty) {
            // 1. a. Return OrdinaryDefineOwnProperty(A, "length", Desc).
            return super['[[DefineOwnProperty]]'](ctx, intrinsics.length, Desc);
        }
        // 2. Let newLenDesc be a copy of Desc.
        const newLenDesc = new property_descriptor_js_1.$PropertyDescriptor(Desc.realm, Desc.name, {
            '[[Writable]]': Desc['[[Writable]]'],
            '[[Enumerable]]': Desc['[[Enumerable]]'],
            '[[Configurable]]': Desc['[[Configurable]]'],
        });
        // 3. Let newLen be ? ToUint32(Desc.[[Value]]).
        const newLen = Desc['[[Value]]'].ToUint32(ctx);
        if (newLen.isAbrupt) {
            return newLen;
        }
        // 4. Let numberLen be ? ToNumber(Desc.[[Value]]).
        const numberLen = Desc['[[Value]]'].ToNumber(ctx);
        if (numberLen.isAbrupt) {
            return numberLen;
        }
        // 5. If newLen ≠ numberLen, throw a RangeError exception.
        if (!newLen.is(numberLen)) {
            return new error_js_1.$RangeError(ctx.Realm, '5. If newLen ≠ numberLen, throw a RangeError exception.');
        }
        // 6. Set newLenDesc.[[Value]] to newLen.
        newLenDesc['[[Value]]'] = newLen;
        // 7. Let oldLenDesc be OrdinaryGetOwnProperty(A, "length").
        const oldLenDesc = super['[[GetOwnProperty]]'](ctx, intrinsics.length);
        // 8. Assert: oldLenDesc will never be undefined or an accessor descriptor because Array objects are created with a length data property that cannot be deleted or reconfigured.
        // 9. Let oldLen be oldLenDesc.[[Value]].
        const oldLen = oldLenDesc['[[Value]]'];
        // 10. If newLen ≥ oldLen, then
        if (newLen['[[Value]]'] >= oldLen['[[Value]]']) {
            // 10. a. Return OrdinaryDefineOwnProperty(A, "length", newLenDesc).
            return super['[[DefineOwnProperty]]'](ctx, intrinsics.length, newLenDesc);
        }
        // 11. If oldLenDesc.[[Writable]] is false, return false.
        if (oldLenDesc['[[Writable]]'].isFalsey) {
            return intrinsics.false;
        }
        let newWritable;
        // 12. If newLenDesc.[[Writable]] is absent or has the value true, let newWritable be true.
        if (newLenDesc['[[Writable]]'].isEmpty || newLenDesc['[[Writable]]'].isTruthy) {
            newWritable = true;
        }
        // 13. Else,
        else {
            // 13. a. Need to defer setting the [[Writable]] attribute to false in case any elements cannot be deleted.
            // 13. b. Let newWritable be false.
            newWritable = false;
            // 13. c. Set newLenDesc.[[Writable]] to true.
            newLenDesc['[[Writable]]'] = intrinsics.true;
        }
        // 14. Let succeeded be ! OrdinaryDefineOwnProperty(A, "length", newLenDesc).
        const succeeded = super['[[DefineOwnProperty]]'](ctx, intrinsics.length, newLenDesc);
        // 15. If succeeded is false, return false.
        if (succeeded.isFalsey) {
            return intrinsics.false;
        }
        const $newLen = newLen['[[Value]]'];
        let $oldLen = oldLen['[[Value]]'];
        // 16. Repeat, while newLen < oldLen,
        while ($newLen < $oldLen) {
            // 16. a. Decrease oldLen by 1.
            --$oldLen;
            // 16. b. Let deleteSucceeded be ! A.[[Delete]](! ToString(oldLen)).
            const deleteSucceeded = this['[[Delete]]'](ctx, new number_js_1.$Number(realm, $oldLen).ToString(ctx));
            // 16. c. If deleteSucceeded is false, then
            if (deleteSucceeded.isFalsey) {
                // 16. c. i. Set newLenDesc.[[Value]] to oldLen + 1.
                newLenDesc['[[Value]]'] = new number_js_1.$Number(realm, $oldLen + 1);
                // 16. c. ii. If newWritable is false, set newLenDesc.[[Writable]] to false.
                if (!newWritable) {
                    newLenDesc['[[Writable]]'] = intrinsics.false;
                }
                // 16. c. iii. Perform ! OrdinaryDefineOwnProperty(A, "length", newLenDesc).
                super['[[DefineOwnProperty]]'](ctx, intrinsics.length, newLenDesc);
                // 16. c. iv. Return false.
                return intrinsics.false;
            }
        }
        // 17. If newWritable is false, then
        if (!newWritable) {
            // 17. a. Return OrdinaryDefineOwnProperty(A, "length", PropertyDescriptor { [[Writable]]: false }). This call will always return true.
            return super['[[DefineOwnProperty]]'](ctx, intrinsics.length, new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics.length, {
                '[[Writable]]': intrinsics.false,
            }));
        }
        // 18. Return true.
        return intrinsics.true;
    }
}
exports.$ArrayExoticObject = $ArrayExoticObject;
// http://www.ecma-international.org/ecma-262/#sec-arrayspeciescreate
function $ArraySpeciesCreate(ctx, originalArray, length) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: length is an integer Number ≥ 0.
    // 2. If length is -0, set length to +0.
    if (length.is(intrinsics['-0'])) {
        length = intrinsics['0'];
    }
    // 3. Let isArray be ? IsArray(originalArray).
    if (!originalArray.isArray) {
        // 4. If isArray is false, return ? ArrayCreate(length).
        return new $ArrayExoticObject(realm, length);
    }
    // 5. Let C be ? Get(originalArray, "constructor").
    let C = originalArray['[[Get]]'](ctx, intrinsics.$constructor, originalArray);
    if (C.isAbrupt) {
        return C;
    }
    // 6. If IsConstructor(C) is true, then
    if (C.isFunction) {
        // 6. a. Let thisRealm be the current Realm Record.
        const thisRealm = realm;
        // 6. b. Let realmC be ? GetFunctionRealm(C).
        const realmC = operations_js_1.$GetFunctionRealm(ctx, C);
        if (realmC.isAbrupt) {
            return realmC;
        }
        // 6. c. If thisRealm and realmC are not the same Realm Record, then
        if (thisRealm !== realmC) {
            // 6. c. i. If SameValue(C, realmC.[[Intrinsics]].[[%Array%]]) is true, set C to undefined.
            if (C.is(realmC['[[Intrinsics]]']['%Array%'])) {
                C = intrinsics.undefined;
            }
        }
    }
    // 7. If Type(C) is Object, then
    if (C.isObject) {
        // 7. a. Set C to ? Get(C, @@species).
        C = C['[[Get]]'](ctx, intrinsics['@@species'], C);
        if (C.isAbrupt) {
            return C;
        }
        // 7. b. If C is null, set C to undefined.
        if (C.isNull) {
            C = intrinsics.undefined;
        }
    }
    // 8. If C is undefined, return ? ArrayCreate(length).
    if (C.isUndefined) {
        return new $ArrayExoticObject(realm, length);
    }
    // 9. If IsConstructor(C) is false, throw a TypeError exception.
    if (!C.isFunction) {
        return new error_js_1.$TypeError(realm, `${C} is not a constructor`);
    }
    // 10. Return ? Construct(C, « length »).
    return operations_js_1.$Construct(ctx, C, new list_js_1.$List(length), intrinsics.undefined);
}
exports.$ArraySpeciesCreate = $ArraySpeciesCreate;
// http://www.ecma-international.org/ecma-262/#sec-createarrayfromlist
function $CreateArrayFromList(ctx, elements) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: elements is a List whose elements are all ECMAScript language values.
    // 2. Let array be ! ArrayCreate(0).
    const array = new $ArrayExoticObject(realm, intrinsics['0']);
    // 3. Let n be 0.
    let n = 0;
    // 4. For each element e of elements, do
    for (const e of elements) {
        // 4. a. Let status be CreateDataProperty(array, ! ToString(n), e).
        const status = operations_js_1.$CreateDataProperty(ctx, array, new string_js_1.$String(realm, n.toString()), e);
        // 4. b. Assert: status is true.
        // 4. c. Increment n by 1.
        ++n;
    }
    // 5. Return array.
    return array;
}
exports.$CreateArrayFromList = $CreateArrayFromList;
//# sourceMappingURL=array.js.map