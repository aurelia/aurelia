import { $BuiltinFunction, $Function } from '../types/function.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared.js';
import { $Error } from '../types/error.js';
import { $Undefined } from '../types/undefined.js';
import { $Object } from '../types/object.js';
import { $ObjectPrototype } from './object.js';
import { $List } from '../types/list.js';
import { FunctionKind } from '../ast/_shared.js';
import { $Number } from '../types/number.js';
export declare class $FunctionConstructor extends $BuiltinFunction<'%Function%'> {
    get length(): $Number<1>;
    set length(value: $Number<1>);
    get $prototype(): $FunctionPrototype;
    set $prototype(value: $FunctionPrototype);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $FunctionPrototype extends $Object<'%FunctionPrototype%'> {
    get $apply(): $FunctionPrototype_apply;
    set $apply(value: $FunctionPrototype_apply);
    get $bind(): $FunctionPrototype_bind;
    set $bind(value: $FunctionPrototype_bind);
    get $call(): $FunctionPrototype_call;
    set $call(value: $FunctionPrototype_call);
    get $constructor(): $FunctionConstructor;
    set $constructor(value: $FunctionConstructor);
    get $toString(): $FunctionPrototype_toString;
    set $toString(value: $FunctionPrototype_toString);
    get '@@hasInstance'(): $FunctionPrototype_hasInstance;
    set '@@hasInstance'(value: $FunctionPrototype_hasInstance);
    constructor(realm: Realm, objectPrototype: $ObjectPrototype);
}
export declare class $FunctionPrototype_apply extends $BuiltinFunction<'Function.prototype.apply'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [thisArg, argArray]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $FunctionPrototype_bind extends $BuiltinFunction<'Function.prototype.bind'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [thisArg, ...args]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $FunctionPrototype_call extends $BuiltinFunction<'Function.prototype.call'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [thisArg, ...args]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $FunctionPrototype_toString extends $BuiltinFunction<'Function.prototype.toString'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [thisArg, ...args]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $FunctionPrototype_hasInstance extends $BuiltinFunction<'Function.prototype.hasInstance'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [V]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $CreateDynamicFunction(ctx: ExecutionContext, constructor: $Function, newTarget: $Function | $Undefined, kind: FunctionKind.normal | FunctionKind.generator | FunctionKind.async | FunctionKind.asyncGenerator, args: $List<$AnyNonEmpty>): $Function | $Error;
//# sourceMappingURL=function.d.ts.map