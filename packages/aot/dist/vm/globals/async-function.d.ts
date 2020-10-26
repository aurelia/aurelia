import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Undefined } from '../types/undefined';
import { $Object } from '../types/object';
import { $String } from '../types/string';
import { $FunctionPrototype, $FunctionConstructor } from './function';
import { $Number } from '../types/number';
import { $Block } from '../ast/statements';
import { $List } from '../types/list';
import { $PromiseCapability } from './promise';
export declare class $AsyncFunctionConstructor extends $BuiltinFunction<'%AsyncFunction%'> {
    get $prototype(): $AsyncFunctionPrototype;
    set $prototype(value: $AsyncFunctionPrototype);
    get length(): $Number<1>;
    set length(value: $Number<1>);
    constructor(realm: Realm, functionConstructor: $FunctionConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncFunctionPrototype extends $Object<'%AsyncFunctionPrototype%'> {
    get $constructor(): $AsyncFunctionConstructor;
    set $constructor(value: $AsyncFunctionConstructor);
    get '@@toStringTag'(): $String<'AsyncFunction'>;
    set '@@toStringTag'(value: $String<'AsyncFunction'>);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
}
export declare function $AsyncFunctionStart(ctx: ExecutionContext, promiseCapability: $PromiseCapability, asyncFunctionBody: $Block): $Undefined;
//# sourceMappingURL=async-function.d.ts.map