import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $String } from '../types/string';
import { $Undefined } from '../types/undefined';
import { $FunctionPrototype } from './function';
import { $Object } from '../types/object';
import { $ObjectPrototype } from './object';
import { $List } from '../types/list';
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