"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Symbol = void 0;
const string_js_1 = require("./string.js");
const _shared_js_1 = require("./_shared.js");
const object_js_1 = require("./object.js");
const boolean_js_1 = require("./boolean.js");
const error_js_1 = require("./error.js");
// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-symbol-type
class $Symbol {
    constructor(realm, Description, value = Symbol(Description['[[Value]]']), type = 1 /* normal */, target = realm['[[Intrinsics]]'].empty) {
        this.realm = realm;
        this.Description = Description;
        this.id = _shared_js_1.nextValueId();
        this.IntrinsicName = 'symbol';
        this.nodeStack = [];
        this.ctx = null;
        this.stack = '';
        this['[[Value]]'] = value;
        this['[[Type]]'] = type;
        this['[[Target]]'] = target;
    }
    // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
    // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
    // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
    get isAbrupt() { return (this['[[Type]]'] !== 1 /* normal */); }
    get Type() { return 'Symbol'; }
    get isEmpty() { return false; }
    get isUndefined() { return false; }
    get isNull() { return false; }
    get isNil() { return false; }
    get isBoolean() { return false; }
    get isNumber() { return false; }
    get isString() { return false; }
    get isSymbol() { return true; }
    get isPrimitive() { return true; }
    get isObject() { return false; }
    get isArray() { return false; }
    get isProxy() { return false; }
    get isFunction() { return false; }
    get isBoundFunction() { return false; }
    get isTruthy() { return true; }
    get isFalsey() { return false; }
    get isSpeculative() { return false; }
    get hasValue() { return true; }
    get isList() { return false; }
    get IsArrayIndex() { return false; }
    is(other) {
        return other instanceof $Symbol && this['[[Value]]'] === other['[[Value]]'];
    }
    enrichWith(ctx, node) {
        if (this['[[Type]]'] === 5 /* throw */) {
            this.nodeStack.push(node);
            if (this.ctx === null) {
                this.ctx = ctx;
                this.stack = ctx.Realm.stack.toString();
            }
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
        this['[[Type]]'] = type;
        this['[[Target]]'] = target;
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
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        return object_js_1.$Object.ObjectCreate(ctx, 'symbol', intrinsics['%SymbolPrototype%'], {
            '[[SymbolData]]': this,
        });
    }
    ToPropertyKey(ctx) {
        return this.ToString(ctx);
    }
    ToLength(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToPrimitive(ctx) {
        return this;
    }
    ToBoolean(ctx) {
        return new boolean_js_1.$Boolean(
        /* realm */ this.realm, 
        /* value */ Boolean(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToNumber(ctx) {
        return new error_js_1.$TypeError(ctx.Realm, `${this} cannot be converted to number`);
    }
    ToInt32(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToUint32(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToInt16(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToUint16(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToInt8(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToUint8(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToUint8Clamp(ctx) {
        // Short circuit
        return this.ToNumber(ctx);
    }
    ToString(ctx) {
        return new string_js_1.$String(
        /* realm */ this.realm, 
        /* value */ String(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    GetValue(ctx) {
        return this;
    }
}
exports.$Symbol = $Symbol;
//# sourceMappingURL=symbol.js.map