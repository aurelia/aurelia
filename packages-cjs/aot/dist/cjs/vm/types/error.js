"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$URIError = exports.$RangeError = exports.$ReferenceError = exports.$TypeError = exports.$SyntaxError = exports.$Error = void 0;
const _shared_js_1 = require("./_shared.js");
class $Error {
    constructor(realm, err, intrinsicName) {
        this.realm = realm;
        this.id = _shared_js_1.nextValueId();
        this['[[Type]]'] = 5 /* throw */;
        this.nodeStack = [];
        this.ctx = null;
        this.stack = '';
        this.IntrinsicName = intrinsicName;
        this['[[Value]]'] = err;
        this['[[Target]]'] = realm['[[Intrinsics]]'].empty;
    }
    get isAbrupt() { return true; }
    get isEmpty() { return false; }
    get isUndefined() { return false; }
    get isNull() { return false; }
    get isNil() { return false; }
    get isBoolean() { return true; }
    get isNumber() { return false; }
    get isString() { return false; }
    get isSymbol() { return false; }
    get isPrimitive() { return true; }
    get isObject() { return false; }
    get isArray() { return false; }
    get isProxy() { return false; }
    get isFunction() { return false; }
    get isBoundFunction() { return false; }
    get isTruthy() { return this['[[Value]]']; }
    get isFalsey() { return !this['[[Value]]']; }
    get isSpeculative() { return false; }
    get hasValue() { return true; }
    get isList() { return false; }
    is(other) {
        return other instanceof $Error && other.id === this.id;
    }
    enrichWith(ctx, node) {
        this.nodeStack.push(node);
        if (this.ctx === null) {
            this.ctx = ctx;
            this.stack = ctx.Realm.stack.toString();
        }
        return this;
    }
    [Symbol.toPrimitive]() {
        return String(this['[[Value]]']);
    }
    [Symbol.toStringTag]() {
        return Object.prototype.toString.call(this['[[Value]]']);
    }
    ToCompletion(type, target) {
        return this;
    }
    // http://www.ecma-international.org/ecma-262/#sec-getvalue
    // 6.2.4.8 GetValue ( V )
    GetValue(ctx) {
        // 1. ReturnIfAbrupt(V)
        return this;
    }
    // http://www.ecma-international.org/ecma-262/#sec-updateempty
    // 6.2.3.4 UpdateEmpty ( completionRecord , value )
    UpdateEmpty(value) {
        // 1. Assert: If completionRecord.[[Type]] is either return or throw, then completionRecord.[[Value]] is not empty.
        // 2. If completionRecord.[[Value]] is not empty, return Completion(completionRecord).
        return this;
        // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
    }
    ToObject(ctx) {
        return this;
    }
    ToPropertyKey(ctx) {
        return this;
    }
    ToLength(ctx) {
        return this;
    }
    ToPrimitive(ctx) {
        return this;
    }
    ToBoolean(ctx) {
        return this;
    }
    ToNumber(ctx) {
        return this;
    }
    ToInt32(ctx) {
        return this;
    }
    ToUint32(ctx) {
        return this;
    }
    ToInt16(ctx) {
        return this;
    }
    ToUint16(ctx) {
        return this;
    }
    ToInt8(ctx) {
        return this;
    }
    ToUint8(ctx) {
        return this;
    }
    ToUint8Clamp(ctx) {
        return this;
    }
    ToString(ctx) {
        return this;
    }
}
exports.$Error = $Error;
class $SyntaxError extends $Error {
    constructor(realm, message = void 0) {
        super(realm, new SyntaxError(message), 'SyntaxError');
    }
}
exports.$SyntaxError = $SyntaxError;
class $TypeError extends $Error {
    constructor(realm, message = void 0) {
        super(realm, new TypeError(message), 'TypeError');
    }
}
exports.$TypeError = $TypeError;
class $ReferenceError extends $Error {
    constructor(realm, message = void 0) {
        super(realm, new ReferenceError(message), 'ReferenceError');
    }
}
exports.$ReferenceError = $ReferenceError;
class $RangeError extends $Error {
    constructor(realm, message = void 0) {
        super(realm, new RangeError(message), 'RangeError');
    }
}
exports.$RangeError = $RangeError;
class $URIError extends $Error {
    constructor(realm, message = void 0) {
        super(realm, new URIError(message), 'URIError');
    }
}
exports.$URIError = $URIError;
//# sourceMappingURL=error.js.map