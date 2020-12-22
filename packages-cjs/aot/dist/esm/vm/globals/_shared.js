import { $BuiltinFunction, } from '../types/function.js';
export class $ValueRecord {
    constructor(value) {
        this['[[Value]]'] = value;
    }
}
// http://www.ecma-international.org/ecma-262/#sec-get-regexp-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-array-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-%typedarray%-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-map-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-set-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-arraybuffer-@@species
// http://www.ecma-international.org/ecma-262/#sec-sharedarraybuffer-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-promise-@@species
export class $GetSpecies extends $BuiltinFunction {
    constructor(realm) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, 'get [@@species]', intrinsics['%FunctionPrototype%']);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        return thisArgument;
    }
}
//# sourceMappingURL=_shared.js.map