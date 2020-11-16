import { $BuiltinFunction, } from '../types/function.js';
import { $TypeError, } from '../types/error.js';
import { $Symbol, } from '../types/symbol.js';
import { $Undefined, } from '../types/undefined.js';
import { $Object, } from '../types/object.js';
// http://www.ecma-international.org/ecma-262/#sec-symbol-constructor
export class $SymbolConstructor extends $BuiltinFunction {
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
            return new $TypeError(realm, `Symbol is not a constructor`);
        }
        // 2. If description is undefined, let descString be undefined.
        if (description === void 0 || description.isUndefined) {
            // 4. Return a new unique Symbol value whose [[Description]] value is descString.
            return new $Symbol(realm, new $Undefined(realm));
        }
        // 3. Else, let descString be ? ToString(description).
        else {
            const descString = description.ToString(ctx);
            if (descString.isAbrupt) {
                return descString;
            }
            // 4. Return a new unique Symbol value whose [[Description]] value is descString.
            return new $Symbol(realm, descString);
        }
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-symbol-prototype-object
export class $SymbolPrototype extends $Object {
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
//# sourceMappingURL=symbol.js.map