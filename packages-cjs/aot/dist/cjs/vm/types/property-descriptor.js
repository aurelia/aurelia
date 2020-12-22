"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$IsGenericDescriptor = exports.$IsDataDescriptor = exports.$IsAccessorDescriptor = exports.$PropertyDescriptor = void 0;
let descriptorId = 0;
// http://www.ecma-international.org/ecma-262/#sec-property-descriptor-specification-type
class $PropertyDescriptor {
    constructor(realm, name, config) {
        this.realm = realm;
        this.name = name;
        this.id = ++descriptorId;
        const $empty = realm['[[Intrinsics]]'].empty;
        this['[[Enumerable]]'] = $empty;
        this['[[Configurable]]'] = $empty;
        this['[[Get]]'] = $empty;
        this['[[Set]]'] = $empty;
        this['[[Value]]'] = $empty;
        this['[[Writable]]'] = $empty;
        Object.assign(this, config);
    }
    get isAbrupt() { return false; }
    get isEmpty() { return false; }
    get isUndefined() { return false; }
    get isNull() { return false; }
    get isNil() { return false; }
    get isBoolean() { return false; }
    get isNumber() { return false; }
    get isString() { return false; }
    get isSymbol() { return false; }
    get isPrimitive() { return false; }
    get isObject() { return false; }
    get isFunction() { return false; }
    // http://www.ecma-international.org/ecma-262/#sec-isaccessordescriptor
    // 6.2.5.1 IsAccessorDescriptor ( Desc )
    get isAccessorDescriptor() {
        // 2. If both Desc.[[Get]] and Desc.[[Set]] are absent, return false.
        return !this['[[Get]]'].isEmpty || !this['[[Set]]'].isEmpty;
    }
    // http://www.ecma-international.org/ecma-262/#sec-isdatadescriptor
    // 6.2.5.2 IsDataDescriptor ( Desc )
    get isDataDescriptor() {
        // 2. If both Desc.[[Value]] and Desc.[[Writable]] are absent, return false.
        return !this['[[Value]]'].isEmpty || !this['[[Writable]]'].isEmpty;
    }
    // http://www.ecma-international.org/ecma-262/#sec-isgenericdescriptor
    // 6.2.5.3 IsGenericDescriptor ( Desc )
    get isGenericDescriptor() {
        // 2. If IsAccessorDescriptor(Desc) and IsDataDescriptor(Desc) are both false, return true.
        return (this['[[Get]]'].isEmpty &&
            this['[[Set]]'].isEmpty &&
            this['[[Value]]'].isEmpty &&
            this['[[Writable]]'].isEmpty);
    }
    // http://www.ecma-international.org/ecma-262/#sec-completepropertydescriptor
    // 6.2.5.6 CompletePropertyDescriptor ( Desc )
    Complete(ctx) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Assert: Desc is a Property Descriptor.
        // 2. Let like be Record { [[Value]]: undefined, [[Writable]]: false, [[Get]]: undefined, [[Set]]: undefined, [[Enumerable]]: false, [[Configurable]]: false }.
        // 3. If IsGenericDescriptor(Desc) is true or IsDataDescriptor(Desc) is true, then
        if (this.isGenericDescriptor || this.isDataDescriptor) {
            // 3. a. If Desc does not have a [[Value]] field, set Desc.[[Value]] to like.[[Value]].
            if (this['[[Value]]'].isEmpty) {
                this['[[Value]]'] = intrinsics.undefined;
            }
            // 3. b. If Desc does not have a [[Writable]] field, set Desc.[[Writable]] to like.[[Writable]].
            if (this['[[Writable]]'].isEmpty) {
                this['[[Writable]]'] = intrinsics.false;
            }
        }
        // 4. Else,
        else {
            // 4. a. If Desc does not have a [[Get]] field, set Desc.[[Get]] to like.[[Get]].
            if (this['[[Get]]'].isEmpty) {
                this['[[Get]]'] = intrinsics.undefined;
            }
            // 4. b. If Desc does not have a [[Set]] field, set Desc.[[Set]] to like.[[Set]].
            if (this['[[Set]]'].isEmpty) {
                this['[[Set]]'] = intrinsics.undefined;
            }
        }
        // 5. If Desc does not have an [[Enumerable]] field, set Desc.[[Enumerable]] to like.[[Enumerable]].
        if (this['[[Enumerable]]'].isEmpty) {
            this['[[Enumerable]]'] = intrinsics.false;
        }
        // 6. If Desc does not have a [[Configurable]] field, set Desc.[[Configurable]] to like.[[Configurable]].
        if (this['[[Configurable]]'].isEmpty) {
            this['[[Configurable]]'] = intrinsics.false;
        }
        // 7. Return Desc.
        return this;
    }
    dispose() {
        this['[[Enumerable]]'] = void 0;
        this['[[Configurable]]'] = void 0;
        this['[[Get]]'] = void 0;
        this['[[Set]]'] = void 0;
        this['[[Writable]]'] = void 0;
        this['[[Value]]'] = void 0;
    }
}
exports.$PropertyDescriptor = $PropertyDescriptor;
// http://www.ecma-international.org/ecma-262/#sec-isaccessordescriptor
function $IsAccessorDescriptor(Desc) {
    // 1. If Desc is undefined, return false.
    if (Desc.isUndefined) {
        return false;
    }
    // 2. If both Desc.[[Get]] and Desc.[[Set]] are absent, return false.
    // 3. Return true.
    return Desc.isAccessorDescriptor;
}
exports.$IsAccessorDescriptor = $IsAccessorDescriptor;
// http://www.ecma-international.org/ecma-262/#sec-isdatadescriptor
function $IsDataDescriptor(Desc) {
    // 1. If Desc is undefined, return false.
    if (Desc.isUndefined) {
        return false;
    }
    // 2. If both Desc.[[Value]] and Desc.[[Writable]] are absent, return false.
    // 3. Return true.
    return Desc.isDataDescriptor;
}
exports.$IsDataDescriptor = $IsDataDescriptor;
// http://www.ecma-international.org/ecma-262/#sec-isgenericdescriptor
function $IsGenericDescriptor(Desc) {
    // 1. If Desc is undefined, return false.
    if (Desc.isUndefined) {
        return false;
    }
    // 2. If IsAccessorDescriptor(Desc) and IsDataDescriptor(Desc) are both false, return true.
    // 3. Return false.
    return Desc.isGenericDescriptor;
}
exports.$IsGenericDescriptor = $IsGenericDescriptor;
//# sourceMappingURL=property-descriptor.js.map