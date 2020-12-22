"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$NumberPrototype = exports.$NumberConstructor = void 0;
const function_js_1 = require("../types/function.js");
const number_js_1 = require("../types/number.js");
const object_js_1 = require("../types/object.js");
// http://www.ecma-international.org/ecma-262/#sec-number-constructor
class $NumberConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, functionPrototype) {
        super(realm, '%Number%', functionPrototype);
    }
    // http://www.ecma-international.org/ecma-262/#sec-number-constructor-number-value
    // 20.1.1.1 Number ( value )
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        let n;
        // 1. If no arguments were passed to this function invocation, let n be +0.
        if (value === void 0) {
            n = intrinsics['0'];
        }
        // 2. Else, let n be ? ToNumber(value).
        else {
            const $n = value.ToNumber(ctx);
            if ($n.isAbrupt) {
                return $n;
            }
            n = $n;
        }
        // 3. If NewTarget is undefined, return n.
        if (NewTarget.isUndefined) {
            return n;
        }
        // 4. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%NumberPrototype%", « [[NumberData]] »).
        // 5. Set O.[[NumberData]] to n.
        // 6. Return O.
        return function_js_1.$OrdinaryCreateFromConstructor(ctx, NewTarget, '%NumberPrototype%', { '[[NumberData]]': n });
    }
}
exports.$NumberConstructor = $NumberConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-number-prototype-object
class $NumberPrototype extends object_js_1.$Object {
    constructor(realm, objectPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%NumberPrototype%', objectPrototype, 1 /* normal */, intrinsics.empty);
        this['[[NumberData]]'] = new number_js_1.$Number(realm, 0);
    }
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
}
exports.$NumberPrototype = $NumberPrototype;
//# sourceMappingURL=number.js.map