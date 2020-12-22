import { nextValueId, } from './_shared.js';
import { $TypeError, } from './error.js';
export const empty = Symbol('empty');
export class $Empty {
    constructor(realm, type = 1 /* normal */, target = realm['[[Intrinsics]]'].empty, sourceNode = null) {
        this.realm = realm;
        this.sourceNode = sourceNode;
        this.id = nextValueId();
        this.IntrinsicName = 'empty';
        this['[[Value]]'] = empty;
        this['[[Type]]'] = type;
        this['[[Target]]'] = target;
    }
    // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
    // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
    // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
    get isAbrupt() { return (this['[[Type]]'] !== 1 /* normal */); }
    get Type() { return new $TypeError(this.realm, `[[empty]] has no Type`); }
    get isEmpty() { return true; }
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
    get isFalsey() { return true; }
    get isSpeculative() { return false; }
    get hasValue() { return false; }
    get isList() { return false; }
    is(other) {
        return other instanceof $Empty;
    }
    enrichWith(ctx, node) {
        return this;
    }
    [Symbol.toPrimitive]() {
        return '[[empty]]';
    }
    [Symbol.toStringTag]() {
        return '[object [[empty]]]';
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
        // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
        return value.ToCompletion(this['[[Type]]'], this['[[Target]]']);
    }
    ToObject(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to object`);
    }
    ToPropertyKey(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to property key`);
    }
    ToLength(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to length`);
    }
    ToPrimitive(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to primitive`);
    }
    ToBoolean(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to boolean`);
    }
    ToNumber(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to number`);
    }
    ToInt32(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Int32`);
    }
    ToUint32(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Uint32`);
    }
    ToInt16(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Int16`);
    }
    ToUint16(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Uint16`);
    }
    ToInt8(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Int8`);
    }
    ToUint8(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Uint8`);
    }
    ToUint8Clamp(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to Uint8Clamp`);
    }
    ToString(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] cannot be converted to string`);
    }
    GetValue(ctx) {
        return new $TypeError(ctx.Realm, `[[empty]] has no value`);
    }
}
//# sourceMappingURL=empty.js.map