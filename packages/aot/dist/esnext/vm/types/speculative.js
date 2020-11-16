import { nextValueId, getPath, } from './_shared.js';
import { $TypeError, } from './error.js';
export class $SpeculativeValue {
    constructor(realm, sourceNode, antecedents) {
        this.realm = realm;
        this.sourceNode = sourceNode;
        this.antecedents = antecedents;
        this.id = nextValueId();
        this.path = `((${antecedents.map(getPath).join('+')})/${this.id})`;
    }
    get Type() { return new $TypeError(this.realm); }
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
        return new $TypeError(ctx.Realm);
    }
    ToPropertyKey(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToLength(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToPrimitive(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToBoolean(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToNumber(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToInt32(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToUint32(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToInt16(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToUint16(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToInt8(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToUint8(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToUint8Clamp(ctx) {
        return new $TypeError(ctx.Realm);
    }
    ToString(ctx) {
        return new $TypeError(ctx.Realm);
    }
    GetValue() {
        return new $TypeError(this.realm);
    }
}
//# sourceMappingURL=speculative.js.map