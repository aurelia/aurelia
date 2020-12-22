"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$StringSet = exports.$StringPrototype = exports.$StringConstructor = void 0;
const function_js_1 = require("../types/function.js");
const string_js_1 = require("../types/string.js");
const string_js_2 = require("../exotics/string.js");
const object_js_1 = require("../types/object.js");
// http://www.ecma-international.org/ecma-262/#sec-string-constructor
class $StringConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, functionPrototype) {
        super(realm, '%String%', functionPrototype);
    }
    // http://www.ecma-international.org/ecma-262/#sec-string-constructor-string-value
    // 21.1.1.1 String ( value )
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        let s;
        // 1. If no arguments were passed to this function invocation, let s be "".
        if (argumentsList.length === 0) {
            s = new string_js_1.$String(realm, '');
        }
        // 2. Else,
        else {
            const [value] = argumentsList;
            // 2. a. If NewTarget is undefined and Type(value) is Symbol, return SymbolDescriptiveString(value).
            if (NewTarget.isUndefined && value.isSymbol) {
                // TODO: implement this
            }
            // 2. b. Let s be ? ToString(value).
            const $s = value.ToString(ctx);
            if ($s.isAbrupt) {
                return $s;
            }
            s = $s;
        }
        // 3. If NewTarget is undefined, return s.
        if (NewTarget.isUndefined) {
            return s;
        }
        // 4. Return ! StringCreate(s, ? GetPrototypeFromConstructor(NewTarget, "%StringPrototype%")).
        const proto = function_js_1.$GetPrototypeFromConstructor(ctx, NewTarget, '%StringPrototype%');
        if (proto.isAbrupt) {
            return proto;
        }
        return new string_js_2.$StringExoticObject(realm, s, proto);
    }
}
exports.$StringConstructor = $StringConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-string-prototype-object
class $StringPrototype extends object_js_1.$Object {
    constructor(realm, objectPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%StringPrototype%', objectPrototype, 1 /* normal */, intrinsics.empty);
        this['[[StringData]]'] = new string_js_1.$String(realm, '');
    }
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
}
exports.$StringPrototype = $StringPrototype;
class $StringSet {
    constructor() {
        this.arr = [];
        this.map = new Map();
    }
    has(item) {
        return this.map.has(item['[[Value]]']);
    }
    add(item) {
        const arr = this.arr;
        const map = this.map;
        const value = item['[[Value]]'];
        let idx = map.get(value);
        if (idx === void 0) {
            arr[idx = arr.length] = item;
            map.set(value, idx);
        }
        else {
            arr[idx] = item;
        }
    }
    [Symbol.iterator]() {
        return this.arr[Symbol.iterator]();
    }
}
exports.$StringSet = $StringSet;
//# sourceMappingURL=string.js.map