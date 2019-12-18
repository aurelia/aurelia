import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Error } from '../types/error';
import { $Undefined } from '../types/undefined';
import { $Object } from '../types/object';
import { $String } from '../types/string';
import { $FunctionPrototype, $FunctionConstructor } from './function';
import { $IteratorPrototype } from './iteration';
import { $Number } from '../types/number';
import { $Block } from '../ast/statements';
import { $List } from '../types/list';
export declare class $GeneratorFunctionConstructor extends $BuiltinFunction<'%GeneratorFunction%'> {
    get $prototype(): $GeneratorFunctionPrototype;
    set $prototype(value: $GeneratorFunctionPrototype);
    get length(): $Number<1>;
    set length(value: $Number<1>);
    constructor(realm: Realm, functionConstructor: $FunctionConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $GeneratorFunctionPrototype extends $Object<'%Generator%'> {
    get $constructor(): $GeneratorFunctionConstructor;
    set $constructor(value: $GeneratorFunctionConstructor);
    get $prototype(): $GeneratorPrototype;
    set $prototype(value: $GeneratorPrototype);
    get '@@toStringTag'(): $String<'GeneratorFunction'>;
    set '@@toStringTag'(value: $String<'GeneratorFunction'>);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
}
export declare class $GeneratorPrototype extends $Object<'%GeneratorPrototype%'> {
    get $constructor(): $GeneratorFunctionPrototype;
    set $constructor(value: $GeneratorFunctionPrototype);
    get next(): $GeneratorPrototype_next;
    set next(value: $GeneratorPrototype_next);
    get return(): $GeneratorPrototype_return;
    set return(value: $GeneratorPrototype_return);
    get throw(): $GeneratorPrototype_throw;
    set throw(value: $GeneratorPrototype_throw);
    get '@@toStringTag'(): $String<'Generator'>;
    set '@@toStringTag'(value: $String<'Generator'>);
    constructor(realm: Realm, iteratorPrototype: $IteratorPrototype);
}
export declare class $GeneratorPrototype_next extends $BuiltinFunction<'Generator.prototype.next'> {
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $GeneratorPrototype_return extends $BuiltinFunction<'Generator.prototype.return'> {
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $GeneratorPrototype_throw extends $BuiltinFunction<'Generator.prototype.throw'> {
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [exception]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare const enum GeneratorState {
    none = 0,
    suspendedStart = 1,
    suspendedYield = 2,
    executing = 3,
    completed = 4
}
export declare class $GeneratorInstance extends $Object<'GeneratorInstance'> {
    '[[GeneratorState]]': GeneratorState;
    '[[GeneratorContext]]': ExecutionContext | undefined;
    constructor(realm: Realm, proto: $GeneratorPrototype);
}
export declare function $GeneratorStart(ctx: ExecutionContext, generator: $GeneratorInstance, generatorBody: $Block): $Undefined;
export declare class $GeneratorState {
    readonly value: GeneratorState;
    get isAbrupt(): false;
    constructor(value: GeneratorState);
}
export declare function $GeneratorValidate(ctx: ExecutionContext, generator: $AnyNonEmpty): $GeneratorState | $Error;
export declare function $GeneratorResume(ctx: ExecutionContext, _generator: $AnyNonEmpty, value: $AnyNonEmpty): $AnyNonEmpty;
export declare function $GeneratorResumeAbrupt(ctx: ExecutionContext, _generator: $AnyNonEmpty, abruptCompletion: $AnyNonEmpty): $AnyNonEmpty;
export declare const enum GeneratorKind {
    none = 0,
    async = 1,
    sync = 2
}
export declare function $GetGeneratorKind(ctx: ExecutionContext): GeneratorKind;
export declare function $GeneratorYield(ctx: ExecutionContext, iterNextObj: $Object): any;
//# sourceMappingURL=generator-function.d.ts.map