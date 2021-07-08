import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $FunctionPrototype } from './function.js';
import { $Object } from '../types/object.js';
import { $ObjectPrototype } from './object.js';
import { $List } from '../types/list.js';
export declare class $SymbolConstructor extends $BuiltinFunction<'%Symbol%'> {
    get $prototype(): $SymbolPrototype;
    set $prototype(value: $SymbolPrototype);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [description]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $SymbolPrototype extends $Object<'%SymbolPrototype%'> {
    get $constructor(): $SymbolConstructor;
    set $constructor(value: $SymbolConstructor);
    constructor(realm: Realm, objectPrototype: $ObjectPrototype);
}
//# sourceMappingURL=symbol.d.ts.map