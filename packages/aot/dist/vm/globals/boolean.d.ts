import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Boolean } from '../types/boolean';
import { $Undefined } from '../types/undefined';
import { $FunctionPrototype } from './function';
import { $Object } from '../types/object';
import { $ObjectPrototype } from './object';
import { $List } from '../types/list';
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