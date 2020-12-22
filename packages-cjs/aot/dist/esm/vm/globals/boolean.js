import { $BuiltinFunction, $OrdinaryCreateFromConstructor, } from '../types/function.js';
import { $Boolean, } from '../types/boolean.js';
import { $Object, } from '../types/object.js';
// http://www.ecma-international.org/ecma-262/#sec-boolean-constructor
export class $BooleanConstructor extends $BuiltinFunction {
    get $prototype() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'];
    }
    set $prototype(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
    }
    constructor(realm, functionPrototype) {
        super(realm, '%Boolean%', functionPrototype);
    }
    // http://www.ecma-international.org/ecma-262/#sec-boolean-constructor-boolean-value
    // 19.3.1.1 Boolean ( value )
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let b be ToBoolean(value).
        const b = value?.ToBoolean(ctx) ?? intrinsics.undefined;
        if (b.isAbrupt) {
            return b;
        }
        // 2. If NewTarget is undefined, return b.
        if (NewTarget.isUndefined) {
            return b;
        }
        // 3. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%BooleanPrototype%", « [[BooleanData]] »).
        // 4. Set O.[[BooleanData]] to b.
        // 5. Return O.
        return $OrdinaryCreateFromConstructor(ctx, NewTarget, '%BooleanPrototype%', { '[[BooleanData]]': b });
    }
}
// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-boolean-prototype-object
export class $BooleanPrototype extends $Object {
    constructor(realm, objectPrototype) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%BooleanPrototype%', objectPrototype, 1 /* normal */, intrinsics.empty);
        this['[[BooleanData]]'] = new $Boolean(realm, false);
    }
    get $constructor() {
        return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'];
    }
    set $constructor(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
    }
}
//# sourceMappingURL=boolean.js.map