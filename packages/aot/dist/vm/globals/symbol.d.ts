import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Undefined } from '../types/undefined';
import { $FunctionPrototype } from './function';
import { $Object } from '../types/object';
import { $ObjectPrototype } from './object';
import { $List } from '../types/list';
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