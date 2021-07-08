import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Number } from '../types/number.js';
import { $Undefined } from '../types/undefined.js';
import { $FunctionPrototype } from './function.js';
import { $Object } from '../types/object.js';
import { $ObjectPrototype } from './object.js';
import { $List } from '../types/list.js';
export declare class $NumberConstructor extends $BuiltinFunction<'%Number%'> {
    get $prototype(): $NumberPrototype;
    set $prototype(value: $NumberPrototype);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $NumberPrototype extends $Object<'%NumberPrototype%'> {
    get $constructor(): $NumberConstructor;
    set $constructor(value: $NumberConstructor);
    '[[NumberData]]': $Number;
    constructor(realm: Realm, objectPrototype: $ObjectPrototype);
}
//# sourceMappingURL=number.d.ts.map