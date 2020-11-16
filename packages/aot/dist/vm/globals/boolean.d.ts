import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Boolean } from '../types/boolean.js';
import { $Undefined } from '../types/undefined.js';
import { $FunctionPrototype } from './function.js';
import { $Object } from '../types/object.js';
import { $ObjectPrototype } from './object.js';
import { $List } from '../types/list.js';
export declare class $BooleanConstructor extends $BuiltinFunction<'%Boolean%'> {
    get $prototype(): $BooleanPrototype;
    set $prototype(value: $BooleanPrototype);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $BooleanPrototype extends $Object<'%BooleanPrototype%'> {
    get $constructor(): $BooleanConstructor;
    set $constructor(value: $BooleanConstructor);
    '[[BooleanData]]': $Boolean;
    constructor(realm: Realm, objectPrototype: $ObjectPrototype);
}
//# sourceMappingURL=boolean.d.ts.map