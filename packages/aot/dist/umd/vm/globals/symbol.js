(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../types/function", "../types/error", "../types/symbol", "../types/undefined", "../types/object"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SymbolPrototype = exports.$SymbolConstructor = void 0;
    const function_1 = require("../types/function");
    const error_1 = require("../types/error");
    const symbol_1 = require("../types/symbol");
    const undefined_1 = require("../types/undefined");
    const object_1 = require("../types/object");
    // http://www.ecma-international.org/ecma-262/#sec-symbol-constructor
    class $SymbolConstructor extends function_1.$BuiltinFunction {
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
                return new error_1.$TypeError(realm, `Symbol is not a constructor`);
            }
            // 2. If description is undefined, let descString be undefined.
            if (description === void 0 || description.isUndefined) {
                // 4. Return a new unique Symbol value whose [[Description]] value is descString.
                return new symbol_1.$Symbol(realm, new undefined_1.$Undefined(realm));
            }
            // 3. Else, let descString be ? ToString(description).
            else {
                const descString = description.ToString(ctx);
                if (descString.isAbrupt) {
                    return descString;
                }
                // 4. Return a new unique Symbol value whose [[Description]] value is descString.
                return new symbol_1.$Symbol(realm, descString);
            }
        }
    }
    exports.$SymbolConstructor = $SymbolConstructor;
    // http://www.ecma-international.org/ecma-262/#sec-properties-of-the-symbol-prototype-object
    class $SymbolPrototype extends object_1.$Object {
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
});
//# sourceMappingURL=symbol.js.map