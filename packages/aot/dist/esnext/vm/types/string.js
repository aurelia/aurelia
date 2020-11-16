import { nextValueId, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp, } from './_shared.js';
import { $Number, } from './number.js';
import { $Object, } from './object.js';
import { $Boolean, } from './boolean.js';
// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-string-type
export class $String {
    constructor(realm, value, type = 1 /* normal */, target = realm['[[Intrinsics]]'].empty, sourceNode = null, conversionSource = null) {
        this.realm = realm;
        this.sourceNode = sourceNode;
        this.conversionSource = conversionSource;
        this.id = nextValueId();
        this.IntrinsicName = 'string';
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
    get Type() { return 'String'; }
    get isEmpty() { return false; }
    get isUndefined() { return false; }
    get isNull() { return false; }
    get isNil() { return false; }
    get isBoolean() { return false; }
    get isNumber() { return false; }
    get isString() { return true; }
    get isSymbol() { return false; }
    get isPrimitive() { return true; }
    get isObject() { return false; }
    get isArray() { return false; }
    get isProxy() { return false; }
    get isFunction() { return false; }
    get isBoundFunction() { return false; }
    get isTruthy() { return this['[[Value]]'].length > 0; }
    get isFalsey() { return this['[[Value]]'].length === 0; }
    get isSpeculative() { return false; }
    get hasValue() { return true; }
    // Only used in contexts where a value is always 'ambiguous' if it is a $String
    get isAmbiguous() {
        if (this['[[Value]]'] !== 'ambiguous') {
            // Just make sure that we don't actually violate that invariant
            throw new Error(`Expected "${this['[[Value]]']}" to be "ambiguous"`);
        }
        return true;
    }
    get isList() { return false; }
    // http://www.ecma-international.org/ecma-262/#sec-canonicalnumericindexstring
    // 7.1.16 CanonicalNumericIndexString ( argument )
    CanonicalNumericIndexString(ctx) {
        if (this['[[Value]]'] === '-0') {
            return this.realm['[[Intrinsics]]']['-0'];
        }
        const n = this.ToNumber(ctx);
        if (n.ToString(ctx).is(this)) {
            return n;
        }
        return this.realm['[[Intrinsics]]'].undefined;
    }
    get IsArrayIndex() {
        if (this['[[Value]]'] === '-0') {
            return false;
        }
        const num = Number(this['[[Value]]']);
        if (num.toString() === this['[[Value]]']) {
            return num >= 0 && num <= (2 ** 32 - 1);
        }
        return false;
    }
    is(other) {
        return other instanceof $String && this['[[Value]]'] === other['[[Value]]'];
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
        return `"${this['[[Value]]']}"`;
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
        return $Object.ObjectCreate(ctx, 'string', intrinsics['%StringPrototype%'], {
            '[[StringData]]': this,
        });
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
        return this;
    }
    GetValue(ctx) {
        return this;
    }
}
//# sourceMappingURL=string.js.map