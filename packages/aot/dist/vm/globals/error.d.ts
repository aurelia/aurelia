import { $BuiltinFunction, $Function } from '../types/function';
import { Realm, ExecutionContext } from '../realm';
import { $AnyNonEmpty, $AnyNonEmptyNonError } from '../types/_shared';
import { $Undefined } from '../types/undefined';
import { $FunctionPrototype } from './function';
import { $Object } from '../types/object';
import { $ObjectPrototype } from './object';
import { $String } from '../types/string';
import { $List } from '../types/list';
export declare class $ErrorConstructor extends $BuiltinFunction<'%Error%'> {
    get $prototype(): $ErrorPrototype;
    set $prototype(value: $ErrorPrototype);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ErrorPrototype extends $Object<'%ErrorPrototype%'> {
    get $constructor(): $ErrorConstructor;
    set $constructor(value: $ErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    get $toString(): $ErrorPrototype_toString;
    set $toString(value: $ErrorPrototype_toString);
    constructor(realm: Realm, objectPrototype: $ObjectPrototype);
}
export declare class $ErrorPrototype_toString extends $BuiltinFunction<'Error.prototype.toString'> {
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $EvalErrorConstructor extends $BuiltinFunction<'%EvalError%'> {
    get $prototype(): $EvalErrorPrototype;
    set $prototype(value: $EvalErrorPrototype);
    constructor(realm: Realm, errorConstructor: $ErrorConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $EvalErrorPrototype extends $Object<'%EvalErrorPrototype%'> {
    get $constructor(): $EvalErrorConstructor;
    set $constructor(value: $EvalErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    constructor(realm: Realm, errorPrototype: $ErrorPrototype);
}
export declare class $RangeErrorConstructor extends $BuiltinFunction<'%RangeError%'> {
    get $prototype(): $RangeErrorPrototype;
    set $prototype(value: $RangeErrorPrototype);
    constructor(realm: Realm, errorConstructor: $ErrorConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $RangeErrorPrototype extends $Object<'%RangeErrorPrototype%'> {
    get $constructor(): $RangeErrorConstructor;
    set $constructor(value: $RangeErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    constructor(realm: Realm, errorPrototype: $ErrorPrototype);
}
export declare class $ReferenceErrorConstructor extends $BuiltinFunction<'%ReferenceError%'> {
    get $prototype(): $ReferenceErrorPrototype;
    set $prototype(value: $ReferenceErrorPrototype);
    constructor(realm: Realm, errorConstructor: $ErrorConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ReferenceErrorPrototype extends $Object<'%ReferenceErrorPrototype%'> {
    get $constructor(): $ReferenceErrorConstructor;
    set $constructor(value: $ReferenceErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    constructor(realm: Realm, errorPrototype: $ErrorPrototype);
}
export declare class $SyntaxErrorConstructor extends $BuiltinFunction<'%SyntaxError%'> {
    get $prototype(): $SyntaxErrorPrototype;
    set $prototype(value: $SyntaxErrorPrototype);
    constructor(realm: Realm, errorConstructor: $ErrorConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $SyntaxErrorPrototype extends $Object<'%SyntaxErrorPrototype%'> {
    get $constructor(): $SyntaxErrorConstructor;
    set $constructor(value: $SyntaxErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    constructor(realm: Realm, errorPrototype: $ErrorPrototype);
}
export declare class $TypeErrorConstructor extends $BuiltinFunction<'%TypeError%'> {
    get $prototype(): $TypeErrorPrototype;
    set $prototype(value: $TypeErrorPrototype);
    constructor(realm: Realm, errorConstructor: $ErrorConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $TypeErrorPrototype extends $Object<'%TypeErrorPrototype%'> {
    get $constructor(): $TypeErrorConstructor;
    set $constructor(value: $TypeErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    constructor(realm: Realm, errorPrototype: $ErrorPrototype);
}
export declare class $URIErrorConstructor extends $BuiltinFunction<'%URIError%'> {
    get $prototype(): $URIErrorPrototype;
    set $prototype(value: $URIErrorPrototype);
    constructor(realm: Realm, errorConstructor: $ErrorConstructor);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [message]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $URIErrorPrototype extends $Object<'%URIErrorPrototype%'> {
    get $constructor(): $URIErrorConstructor;
    set $constructor(value: $URIErrorConstructor);
    get message(): $String;
    set message(value: $String);
    get $name(): $String;
    set $name(value: $String);
    constructor(realm: Realm, errorPrototype: $ErrorPrototype);
}
//# sourceMappingURL=error.d.ts.map