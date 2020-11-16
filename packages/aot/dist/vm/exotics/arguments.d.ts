import { $Object } from '../types/object.js';
import { Realm, ExecutionContext } from '../realm.js';
import { $Function, $BuiltinFunction } from '../types/function.js';
import { $PropertyKey, $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject } from '../types/_shared.js';
import { $EnvRec } from '../types/environment-record.js';
import { $String } from '../types/string.js';
import { $PropertyDescriptor } from '../types/property-descriptor.js';
import { $Undefined } from '../types/undefined.js';
import { $Boolean } from '../types/boolean.js';
import { $Error } from '../types/error.js';
import { $ParameterDeclaration } from '../ast/functions.js';
import { $List } from '../types/list.js';
export declare class $ArgumentsExoticObject extends $Object<'ArgumentsExoticObject'> {
    readonly '[[ParameterMap]]': $AnyObject;
    constructor(realm: Realm, func: $Function, formals: readonly $ParameterDeclaration[], argumentsList: readonly $AnyNonEmpty[], env: $EnvRec);
    '[[GetOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey): $PropertyDescriptor | $Undefined;
    '[[DefineOwnProperty]]'(ctx: ExecutionContext, P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean | $Error;
    '[[Get]]'(ctx: ExecutionContext, P: $PropertyKey, Receiver: $AnyObject): $AnyNonEmpty;
    '[[Set]]'(ctx: ExecutionContext, P: $PropertyKey, V: $AnyNonEmpty, Receiver: $AnyObject): $Boolean | $Error;
    '[[Delete]]'(ctx: ExecutionContext, P: $PropertyKey): $Boolean | $Error;
}
export declare class $ArgGetter extends $BuiltinFunction {
    readonly '[[Name]]': $String;
    readonly '[[Env]]': $EnvRec;
    constructor(realm: Realm, name: $String, env: $EnvRec);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ArgSetter extends $BuiltinFunction {
    readonly '[[Name]]': $String;
    readonly '[[Env]]': $EnvRec;
    constructor(realm: Realm, name: $String, env: $EnvRec);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $CreateUnmappedArgumentsObject(ctx: ExecutionContext, argumentsList: readonly $AnyNonEmpty[]): $AnyObject;
//# sourceMappingURL=arguments.d.ts.map