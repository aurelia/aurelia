import { $Object } from '../types/object.js';
import { $Function, $BuiltinFunction } from '../types/function.js';
import { ExecutionContext, Realm } from '../realm.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject, $Any } from '../types/_shared.js';
import { $Undefined } from '../types/undefined.js';
import { $IteratorRecord } from './iteration.js';
import { $Error } from '../types/error.js';
import { $List } from '../types/list.js';
import { Job } from '../job.js';
import { $$ESModuleOrScript } from '../ast/modules.js';
import { $FunctionPrototype } from './function.js';
import { $ValueRecord, $GetSpecies } from './_shared.js';
import { $String } from '../types/string.js';
export declare class $PromiseCapability {
    '[[Promise]]': $PromiseInstance | $Undefined;
    '[[Resolve]]': $Function | $Undefined;
    '[[Reject]]': $Function | $Undefined;
    get isUndefined(): false;
    get isAbrupt(): false;
    constructor(promise: $PromiseInstance | $Undefined, resolve: $Function | $Undefined, reject: $Function | $Undefined);
}
export declare function $IfAbruptRejectPromise(ctx: ExecutionContext, value: $Any | $IteratorRecord, capability: $PromiseCapability): $Any | $IteratorRecord;
export declare const enum PromiseReactionType {
    Fulfill = 1,
    Reject = 2
}
export declare class $PromiseReaction {
    readonly '[[Capability]]': $PromiseCapability | $Undefined;
    readonly '[[Type]]': PromiseReactionType;
    readonly '[[Handler]]': $Function | $Undefined;
    constructor(capability: $PromiseCapability | $Undefined, type: PromiseReactionType, handler: $Function | $Undefined);
    is(other: $PromiseReaction): boolean;
}
export declare class $PromiseResolvingFunctions {
    readonly '[[Resolve]]': $PromiseResolveFunction;
    readonly '[[Reject]]': $PromiseRejectFunction;
    constructor(realm: Realm, promise: $PromiseInstance);
}
export declare class $PromiseRejectFunction extends $BuiltinFunction<'PromiseRejectFunction'> {
    '[[Promise]]': $PromiseInstance;
    '[[AlreadyResolved]]': $ValueRecord<boolean>;
    constructor(realm: Realm, promise: $PromiseInstance, alreadyResolved: $ValueRecord<boolean>);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [reason]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $PromiseResolveFunction extends $BuiltinFunction<'PromiseResolveFunction'> {
    '[[Promise]]': $PromiseInstance;
    '[[AlreadyResolved]]': $ValueRecord<boolean>;
    constructor(realm: Realm, promise: $PromiseInstance, alreadyResolved: $ValueRecord<boolean>);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [resolution]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $FulfillPromise(ctx: ExecutionContext, promise: $PromiseInstance, value: $AnyNonEmpty): $Undefined;
export declare function $NewPromiseCapability(ctx: ExecutionContext, C: $AnyObject): $PromiseCapability | $Error;
export declare class $GetCapabilitiesExecutor extends $BuiltinFunction<'GetCapabilitiesExecutor'> {
    '[[Capability]]': $PromiseCapability;
    constructor(realm: Realm, capability: $PromiseCapability);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [resolve, reject]: $List<$Function | $Undefined>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $RejectPromise(ctx: ExecutionContext, promise: $PromiseInstance, reason: $AnyNonEmpty): $Undefined;
export declare function $TriggerPromiseReactions(ctx: ExecutionContext, reactions: $List<$PromiseReaction>, argument: $AnyNonEmpty): $Undefined;
export declare const enum PromiseRejectionOperation {
    reject = 1,
    handle = 2
}
export declare function $HostPromiseRejectionTracker(ctx: ExecutionContext, promise: $PromiseInstance, operation: PromiseRejectionOperation): void;
export declare class PromiseReactionJob extends Job {
    readonly reaction: $PromiseReaction;
    readonly argument: $AnyNonEmpty;
    constructor(realm: Realm, scriptOrModule: $$ESModuleOrScript, reaction: $PromiseReaction, argument: $AnyNonEmpty);
    Run(ctx: ExecutionContext): $Any;
}
export declare class PromiseResolveThenableJob extends Job {
    readonly promiseToResolve: $PromiseInstance;
    readonly thenable: $AnyNonEmptyNonError;
    readonly then: $AnyNonEmptyNonError;
    constructor(realm: Realm, scriptOrModule: $$ESModuleOrScript, promiseToResolve: $PromiseInstance, thenable: $AnyNonEmptyNonError, then: $AnyNonEmptyNonError);
    Run(ctx: ExecutionContext): $Any;
}
export declare class $PromiseConstructor extends $BuiltinFunction<'%Promise%'> {
    get $prototype(): $PromisePrototype;
    set $prototype(value: $PromisePrototype);
    get all(): $Promise_all;
    set all(value: $Promise_all);
    get race(): $Promise_race;
    set race(value: $Promise_race);
    get reject(): $Promise_reject;
    set reject(value: $Promise_reject);
    get resolve(): $Promise_resolve;
    set resolve(value: $Promise_resolve);
    get ['@@species'](): $GetSpecies;
    set ['@@species'](value: $GetSpecies);
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [executor]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Promise_all extends $BuiltinFunction<'%Promise_all%'> {
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [iterable]: $List<$AnyNonEmptyNonError>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Promise_all_ResolveElement extends $BuiltinFunction<'Promise.all Resolve Element'> {
    '[[AlreadyCalled]]': $ValueRecord<boolean>;
    '[[Index]]': number;
    '[[Values]]': $List<$AnyNonEmpty>;
    '[[Capability]]': $PromiseCapability;
    '[[RemainingElements]]': $ValueRecord<number>;
    constructor(realm: Realm, alreadyCalled: $ValueRecord<boolean>, index: number, values: $List<$AnyNonEmpty>, capability: $PromiseCapability, remainingElements: $ValueRecord<number>);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [x]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Promise_race extends $BuiltinFunction<'%Promise_race%'> {
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [iterable]: $List<$AnyNonEmptyNonError>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $PerformPromiseRace(ctx: ExecutionContext, iteratorRecord: $IteratorRecord, constructor: $Function, resultCapability: $PromiseCapability): $AnyNonEmpty;
export declare class $Promise_reject extends $BuiltinFunction<'%Promise_reject%'> {
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [r]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Promise_resolve extends $BuiltinFunction<'%Promise_resolve%'> {
    constructor(realm: Realm, functionPrototype: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [x]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $PromiseResolve(ctx: ExecutionContext, C: $AnyObject, x: $AnyNonEmpty): $PromiseInstance | $Error;
export declare class $PromisePrototype extends $Object<'%PromisePrototype%'> {
    get catch(): $PromiseProto_catch;
    set catch(value: $PromiseProto_catch);
    get $constructor(): $PromiseConstructor;
    set $constructor(value: $PromiseConstructor);
    get finally(): $PromiseProto_finally;
    set finally(value: $PromiseProto_finally);
    get then(): $PromiseProto_then;
    set then(value: $PromiseProto_then);
    get '@@toStringTag'(): $String<'Promise'>;
    set '@@toStringTag'(value: $String<'Promise'>);
    constructor(realm: Realm, proto: $FunctionPrototype);
}
export declare class $PromiseProto_catch extends $BuiltinFunction<'%PromiseProto_catch%'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [onRejected]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $PromiseProto_finally extends $BuiltinFunction<'%PromiseProto_finally%'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [onFinally]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ThenFinally extends $BuiltinFunction<'Then Finally'> {
    '[[Constructor]]': $Function;
    '[[OnFinally]]': $AnyNonEmpty;
    constructor(realm: Realm, constructor: $Function, onFinally: $AnyNonEmpty);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ValueThunk extends $BuiltinFunction<'ValueThunk'> {
    readonly value: $AnyNonEmpty;
    constructor(realm: Realm, value: $AnyNonEmpty);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $CatchFinally extends $BuiltinFunction<'Catch Finally'> {
    '[[Constructor]]': $Function;
    '[[OnFinally]]': $AnyNonEmpty;
    constructor(realm: Realm, constructor: $Function, onFinally: $AnyNonEmpty);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Thrower extends $BuiltinFunction<'Thrower'> {
    readonly reason: $AnyNonEmpty;
    constructor(realm: Realm, reason: $AnyNonEmpty);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $PromiseProto_then extends $BuiltinFunction<'%PromiseProto_then%'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [onFulfilled, onRejected]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $PerformPromiseThen(ctx: ExecutionContext, promise: $PromiseInstance, onFulfilled: $AnyNonEmpty, onRejected: $AnyNonEmpty, resultCapability?: $PromiseCapability | $Undefined): $PromiseInstance | $Undefined;
export declare const enum PromiseState {
    pending = 1,
    fulfilled = 2,
    rejected = 3
}
export declare class $PromiseInstance extends $Object<'PromiseInstance'> {
    '[[PromiseState]]': PromiseState;
    '[[PromiseResult]]': $AnyNonEmpty | undefined;
    '[[PromiseFulfillReactions]]': $List<$PromiseReaction> | undefined;
    '[[PromiseRejectReactions]]': $List<$PromiseReaction> | undefined;
    '[[PromiseIsHandled]]': boolean;
    private constructor();
    static Create(ctx: ExecutionContext, NewTarget: $Function): $PromiseInstance | $Error;
}
//# sourceMappingURL=promise.d.ts.map