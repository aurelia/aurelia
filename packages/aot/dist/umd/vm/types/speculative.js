(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./_shared", "./error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const _shared_1 = require("./_shared");
    const error_1 = require("./error");
    class $SpeculativeValue {
        constructor(realm, sourceNode, antecedents) {
            this.realm = realm;
            this.sourceNode = sourceNode;
            this.antecedents = antecedents;
            this.id = _shared_1.nextValueId();
            this.path = `((${antecedents.map(_shared_1.getPath).join('+')})/${this.id})`;
        }
        get Type() { return new error_1.$TypeError(this.realm); }
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
        get isArray() { return false; }
        get isProxy() { return false; }
        get isFunction() { return false; }
        get isBoundFunction() { return false; }
        get isTruthy() { return false; }
        get isFalsey() { return false; }
        get isSpeculative() { return true; }
        get hasValue() { return false; }
        is(other) {
            return other instanceof $SpeculativeValue && this.id === other.id;
        }
        ToObject(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToPropertyKey(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToLength(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToPrimitive(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToBoolean(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToNumber(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToInt32(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToUint32(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToInt16(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToUint16(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToInt8(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToUint8(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToUint8Clamp(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        ToString(ctx) {
            return new error_1.$TypeError(ctx.Realm);
        }
        GetValue() {
            return new error_1.$TypeError(this.realm);
        }
    }
    exports.$SpeculativeValue = $SpeculativeValue;
});
//# sourceMappingURL=speculative.js.map