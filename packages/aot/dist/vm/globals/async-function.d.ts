import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $Object } from '../types/object.js';
import { $String } from '../types/string.js';
import { $FunctionPrototype, $FunctionConstructor } from './function.js';
import { $Number } from '../types/number.js';
import { $Block } from '../ast/statements.js';
import { $List } from '../types/list.js';
import { $PromiseCapability } from './promise.js';
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