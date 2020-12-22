import { nextValueId, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp, } from './_shared.js';
import { $Object, } from './object.js';
import { $String, } from './string.js';
import { $Boolean, } from './boolean.js';
// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-number-type
export class $Number {
    constructor(realm, value, type = 1 /* normal */, target = realm['[[Intrinsics]]'].empty, sourceNode = null, conversionSource = null) {
        this.realm = realm;
        this.sourceNode = sourceNode;
        this.conversionSource = conversionSource;
        this.id = nextValueId();
        this.IntrinsicName = 'number';
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
    get Type() { return 'Number'; }
    get isNaN() { return isNaN(this['[[Value]]']); }
    get isPositiveZero() { return Object.is(this['[[Value]]'], +0); }
    get isNegativeZero() { return Object.is(this['[[Value]]'], -0); }
    get isPositiveInfinity() { return Object.is(this['[[Value]]'], +Infinity); }
    get isNegativeInfinity() { return Object.is(this['[[Value]]'], -Infinity); }
    get isEmpty() { return false; }
    get isUndefined() { return false; }
    get isNull() { return false; }
    get isNil() { return false; }
    get isBoolean() { return false; }
    get isNumber() { return true; }
    get isString() { return false; }
    get isSymbol() { return false; }
    get isPrimitive() { return true; }
    get isObject() { return false; }
    get isArray() { return false; }
    get isProxy() { return false; }
    get isFunction() { return false; }
    get isBoundFunction() { return false; }
    get isTruthy() { return this['[[Value]]'] !== 0 && !isNaN(this['[[Value]]']); }
    get isFalsey() { return this['[[Value]]'] === 0 || isNaN(this['[[Value]]']); }
    get isSpeculative() { return false; }
    get hasValue() { return true; }
    get isList() { return false; }
    is(other) {
        return other instanceof $Number && Object.is(this['[[Value]]'], other['[[Value]]']);
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
    equals(other) {
        return Object.is(this['[[Value]]'], other['[[Value]]']);
    }
    // http://www.ecma-international.org/ecma-262/#sec-isinteger
    // 7.2.6 IsInteger ( argument )
    get IsInteger() {
        if (isNaN(this['[[Value]]']) || Object.is(this['[[Value]]'], Infinity) || Object.is(this['[[Value]]'], -Infinity)) {
            return false;
        }
        return Math.floor(Math.abs(this['[[Value]]'])) === Math.abs(this['[[Value]]']);
    }
    ToObject(ctx) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        return $Object.ObjectCreate(ctx, 'number', intrinsics['%NumberPrototype%'], {
            '[[NumberData]]': this,
        });
    }
    ToPropertyKey(ctx) {
        return this.ToString(ctx);
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
        return this;
    }
    // http://www.ecma-international.org/ecma-262/#sec-tointeger
    // 7.1.4 ToInteger ( argument )
    ToInteger(ctx) {
        // 1. Let number be ? ToNumber(argument).
        const value = this['[[Value]]'];
        if (isNaN(value)) {
            // 2. If number is NaN, return +0.
            return new $Number(
            /* realm */ this.realm, 
            /* value */ 0, 
            /* type */ this['[[Type]]'], 
            /* target */ this['[[Target]]'], 
            /* sourceNode */ null, 
            /* conversionSource */ this);
        }
        // 3. If number is +0, -0, +∞, or -∞, return number.
        if (Object.is(value, +0) || Object.is(value, -0) || Object.is(value, +Infinity) || Object.is(value, -Infinity)) {
            return this;
        }
        // 4. Return the number value that is the same sign as number and whose magnitude is floor(abs(number)).
        const sign = value < 0 ? -1 : 1;
        return new $Number(
        /* realm */ this.realm, 
        /* value */ Math.floor(Math.abs(value)) * sign, 
        /* type */ this['[[Type]]'], 
        /* target */ this['[[Target]]'], 
        /* sourceNode */ null, 
        /* conversionSource */ this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-tolength
    // 7.1.15 ToLength ( argument )
    ToLength(ctx) {
        // 1. Let len be ? ToInteger(argument).
        const len = this.ToInteger(ctx);
        if (len.isAbrupt) {
            return len;
        }
        // 2. If len ≤ +0, return +0.
        if (len['[[Value]]'] < 0) {
            return new $Number(
            /* realm */ this.realm, 
            /* value */ 0, 
            /* type */ this['[[Type]]'], 
            /* target */ this['[[Target]]'], 
            /* sourceNode */ null, 
            /* conversionSource */ this);
        }
        // 3. Return min(len, 253 - 1).
        if (len['[[Value]]'] > (2 ** 53 - 1)) {
            return new $Number(
            /* realm */ this.realm, 
            /* value */ (2 ** 53 - 1), 
            /* type */ this['[[Type]]'], 
            /* target */ this['[[Target]]'], 
            /* sourceNode */ null, 
            /* conversionSource */ this);
        }
        return this;
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
//# sourceMappingURL=number.js.map