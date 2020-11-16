import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $String } from '../types/string.js';
import { $Undefined } from '../types/undefined.js';
import { $FunctionPrototype } from './function.js';
import { $Object } from '../types/object.js';
import { $ObjectPrototype } from './object.js';
import { $List } from '../types/list.js';
export declare class $StringConstructor extends $BuiltinFunction<'%String%'> {
    get $prototype(): $StringPrototype;
    set $prototype(value: $StringPrototype);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $StringPrototype extends $Object<'%StringPrototype%'> {
    get $constructor(): $StringConstructor;
    set $constructor(value: $StringConstructor);
    '[[StringData]]': $String;
    constructor(realm: Realm, objectPrototype: $ObjectPrototype);
}
export declare class $StringSet {
    private readonly arr;
    private readonly map;
    has(item: $String): boolean;
    add(item: $String): void;
    [Symbol.iterator](): IterableIterator<$String>;
}
//# sourceMappingURL=string.d.ts.map