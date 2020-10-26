import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Number } from '../types/number';
import { $Undefined } from '../types/undefined';
import { $FunctionPrototype } from './function';
import { $Object } from '../types/object';
import { $ObjectPrototype } from './object';
import { $List } from '../types/list';
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