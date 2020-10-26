import { $Object } from '../types/object';
import { Realm, ExecutionContext } from '../realm';
import { $Function, $BuiltinFunction } from '../types/function';
import { $PropertyKey, $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject } from '../types/_shared';
import { $EnvRec } from '../types/environment-record';
import { $String } from '../types/string';
import { $PropertyDescriptor } from '../types/property-descriptor';
import { $Undefined } from '../types/undefined';
import { $Boolean } from '../types/boolean';
import { $Error } from '../types/error';
import { $ParameterDeclaration } from '../ast/functions';
import { $List } from '../types/list';
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