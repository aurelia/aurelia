"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$GetSpecies = exports.$ValueRecord = void 0;
const function_js_1 = require("../types/function.js");
class $ValueRecord {
    constructor(value) {
        this['[[Value]]'] = value;
    }
}
exports.$ValueRecord = $ValueRecord;
// http://www.ecma-international.org/ecma-262/#sec-get-regexp-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-array-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-%typedarray%-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-map-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-set-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-arraybuffer-@@species
// http://www.ecma-international.org/ecma-262/#sec-sharedarraybuffer-@@species
// http://www.ecma-international.org/ecma-262/#sec-get-promise-@@species
class $GetSpecies extends function_js_1.$BuiltinFunction {
    constructor(realm) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, 'get [@@species]', intrinsics['%FunctionPrototype%']);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        return thisArgument;
    }
}
exports.$GetSpecies = $GetSpecies;
//# sourceMappingURL=_shared.js.map