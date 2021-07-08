import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError, $Any } from '../types/_shared.js';
import { $Error } from '../types/error.js';
import { $Undefined } from '../types/undefined.js';
import { $Object } from '../types/object.js';
import { $String } from '../types/string.js';
import { $FunctionPrototype, $FunctionConstructor } from './function.js';
import { $IteratorPrototype } from './iteration.js';
import { $Number } from '../types/number.js';
import { $Block } from '../ast/statements.js';
import { $List } from '../types/list.js';
import { $PromiseCapability, $PromiseInstance } from './promise.js';
import { $Boolean } from '../types/boolean.js';
export declare class $AsyncGeneratorFunctionConstructor extends $BuiltinFunction<'%AsyncGeneratorFunction%'> {
    get $prototype(): $AsyncGeneratorFunctionPrototype;
    set $prototype(value: $AsyncGeneratorFunctionPrototype);
    get length(): $Number<1>;
    set length(value: $Number<1>);
    constructor(realm: Realm, functionConstructor: $FunctionConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncGeneratorFunctionPrototype extends $Object<'%AsyncGenerator%'> {
    get $constructor(): $AsyncGeneratorFunctionConstructor;
    set $constructor(value: $AsyncGeneratorFunctionConstructor);
    get $prototype(): $AsyncGeneratorPrototype;
    set $prototype(value: $AsyncGeneratorPrototype);
    get '@@toStringTag'(): $String<'AsyncGeneratorFunction'>;
    set '@@toStringTag'(value: $String<'AsyncGeneratorFunction'>);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
}
export declare class $AsyncGeneratorPrototype extends $Object<'%AsyncGeneratorPrototype%'> {
    get $constructor(): $AsyncGeneratorFunctionPrototype;
    set $constructor(value: $AsyncGeneratorFunctionPrototype);
    get next(): $AsyncGeneratorPrototype_next;
    set next(value: $AsyncGeneratorPrototype_next);
    get return(): $AsyncGeneratorPrototype_return;
    set return(value: $AsyncGeneratorPrototype_return);
    get throw(): $AsyncGeneratorPrototype_throw;
    set throw(value: $AsyncGeneratorPrototype_throw);
    get '@@toStringTag'(): $String<'AsyncGenerator'>;
    set '@@toStringTag'(value: $String<'AsyncGenerator'>);
    constructor(realm: Realm, iteratorPrototype: $IteratorPrototype);
}
export declare class $AsyncGeneratorPrototype_next extends $BuiltinFunction<'AsyncGenerator.prototype.next'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncGeneratorPrototype_return extends $BuiltinFunction<'AsyncGenerator.prototype.return'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncGeneratorPrototype_throw extends $BuiltinFunction<'AsyncGenerator.prototype.throw'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [exception]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare const enum AsyncGeneratorState {
    none = 0,
    suspendedStart = 1,
    suspendedYield = 2,
    executing = 3,
    awaitingReturn = 4,
    completed = 5
}
export declare class $AsyncGeneratorInstance extends $Object<'AsyncGeneratorInstance'> {
    '[[AsyncGeneratorState]]': AsyncGeneratorState;
    '[[AsyncGeneratorContext]]': ExecutionContext | undefined;
    '[[AsyncGeneratorQueue]]': $List<$AsyncGeneratorRequest>;
    constructor(realm: Realm, proto: $AsyncGeneratorPrototype);
}
export declare class $AsyncGeneratorRequest {
    readonly '[[Completion]]': $Any;
    readonly '[[Capability]]': $PromiseCapability;
    constructor(completion: $Any, capability: $PromiseCapability);
    is(other: $AsyncGeneratorRequest): boolean;
}
export declare function $AsyncGeneratorStart(ctx: ExecutionContext, generator: $AsyncGeneratorInstance, generatorBody: $Block): $Undefined;
export declare function $AsyncGeneratorResolve(ctx: ExecutionContext, generator: $AsyncGeneratorInstance, value: $AnyNonEmpty, done: $Boolean): $Undefined;
export declare function $AsyncGeneratorReject(ctx: ExecutionContext, generator: $AsyncGeneratorInstance, exception: $Error): $Undefined;
export declare function $AsyncGeneratorResumeNext(ctx: ExecutionContext, generator: $AsyncGeneratorInstance): $Undefined | $Error;
export declare class $AsyncGeneratorResumeNext_Return_Processor_Fulfilled extends $BuiltinFunction<'AsyncGeneratorResumeNext Return Processor Fulfilled'> {
    '[[Generator]]': $AsyncGeneratorInstance;
    constructor(realm: Realm, generator: $AsyncGeneratorInstance);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncGeneratorResumeNext_Return_Processor_Rejected extends $BuiltinFunction<'AsyncGeneratorResumeNext Return Processor Rejected'> {
    '[[Generator]]': $AsyncGeneratorInstance;
    constructor(realm: Realm, generator: $AsyncGeneratorInstance);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $AsyncGeneratorEnqueue(ctx: ExecutionContext, generator: $AsyncGeneratorInstance, completion: $Any): $PromiseInstance;
export declare function $AsyncGeneratorYield(ctx: ExecutionContext, value: $Any): $Any;
//# sourceMappingURL=async-generator-function.d.ts.map