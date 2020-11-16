import { nextValueId, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp, } from './_shared.js';
import { $String, } from './string.js';
import { $Number, } from './number.js';
import { $Boolean, } from './boolean.js';
import { $TypeError, } from './error.js';
// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-undefined-type
export class $Undefined {
    constructor(realm, type = 1 /* normal */, target = realm['[[Intrinsics]]'].empty, sourceNode = null) {
        this.realm = realm;
        this.sourceNode = sourceNode;
        this.id = nextValueId();
        this.IntrinsicName = 'undefined';
        this['[[Value]]'] = void 0;
        this.nodeStack = [];
        this.ctx = null;
        this.stack = '';
        this['[[Type]]'] = type;
        this['[[Target]]'] = target;
    }
    // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
    // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
    // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
    get isAbrupt() { return (this['[[Type]]'] !== 1 /* normal */); }
    get Type() { return 'Undefined'; }
    get isEmpty() { return false; }
    get isUndefined() { return true; }
    get isNull() { return false; }
    get isNil() { return true; }
    get isBoolean() { return false; }
    get isNumber() { return false; }
    get isString() { return false; }
    get isSymbol() { return false; }
    get isPrimitive() { return true; }
    get isObject() { return false; }
    get isArray() { return false; }
    get isProxy() { return false; }
    get isFunction() { return false; }
    get isBoundFunction() { return false; }
    get isTruthy() { return false; }
    get isFalsey() { return true; }
    get isSpeculative() { return false; }
    get hasValue() { return true; }
    get isList() { return false; }
    get IsArrayIndex() { return false; }
    is(other) {
        return other instanceof $Undefined;
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
        return new $TypeError(ctx.Realm, `${this} cannot be converted to object`);
    }
    ToPropertyKey(ctx) {
        return this.ToString(ctx);
    }
    ToLength(ctx) {
        return this.ToNumber(ctx).ToLength(ctx);
    }
    ToPrimitive(ctx) {
        return this;
    }
    ToBoolean(ctx) {
        return new $Boolean(
        /* realm */ this.realm, 
        /* value */ Boolean(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToNumber(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Number(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToInt32(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Int32(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToUint32(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Uint32(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToInt16(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Int16(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToUint16(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Uint16(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToInt8(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Int8(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToUint8(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Uint8(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToUint8Clamp(ctx) {
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Uint8Clamp(this['[[Value]]']), 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    ToString(ctx) {
        return new $String(
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
//# sourceMappingURL=undefined.js.map