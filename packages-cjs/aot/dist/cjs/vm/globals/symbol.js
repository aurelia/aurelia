"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$SymbolPrototype = exports.$SymbolConstructor = void 0;
const function_js_1 = require("../types/function.js");
const error_js_1 = require("../types/error.js");
const symbol_js_1 = require("../types/symbol.js");
const undefined_js_1 = require("../types/undefined.js");
const object_js_1 = require("../types/object.js");
// http://www.ecma-international.org/ecma-262/#sec-symbol-constructor
class $SymbolConstructor extends function_js_1.$BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, functionPrototype) {
        super(realm, '%Symbol%', functionPrototype);
    }
    // http://www.ecma-international.org/ecma-262/#sec-symbol-description
    // 19.4.1.1 Symbol ( [ description ] )
    performSteps(ctx, thisArgument, [description], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If NewTarget is not undefined, throw a TypeError exception.
        if (!NewTarget.isUndefined) {
            return new error_js_1.$TypeError(realm, `Symbol is not a constructor`);
        }
        // 2. If description is undefined, let descString be undefined.
        if (description === void 0 || description.isUndefined) {
            // 4. Return a new unique Symbol value whose [[Description]] value is descString.
            return new symbol_js_1.$Symbol(realm, new undefined_js_1.$Undefined(realm));
        }
        // 3. Else, let descString be ? ToString(description).
        else {
            const descString = description.ToString(ctx);
            if (descString.isAbrupt) {
                return descString;
            }
            // 4. Return a new unique Symbol value whose [[Description]] value is descString.
            return new symbol_js_1.$Symbol(realm, descString);
        }
    }
}
exports.$SymbolConstructor = $SymbolConstructor;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-symbol-prototype-object
class $SymbolPrototype extends object_js_1.$Object {
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
    constructor(realm, objectPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%SymbolPrototype%', objectPrototype, 1 /* normal */, intrinsics.empty);
    }
}
exports.$SymbolPrototype = $SymbolPrototype;
//# sourceMappingURL=symbol.js.map