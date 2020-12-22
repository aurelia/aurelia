import { $Object } from './object.js';
import { $EnvRec } from './environment-record.js';
import { $Boolean } from './boolean.js';
import { $String } from './string.js';
import { $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject } from './_shared.js';
import { $Symbol } from './symbol.js';
import { Intrinsics, IntrinsicObjectKey } from '../intrinsics.js';
import { $Undefined } from './undefined.js';
import { ExecutionContext, Realm } from '../realm.js';
import { $Null } from './null.js';
import { $Error } from './error.js';
import { $$Function } from '../ast/functions.js';
import { $$ESModuleOrScript } from '../ast/modules.js';
import { FunctionKind } from '../ast/_shared.js';
import { $List } from './list.js';
export declare class $Function<T extends string = string> extends $Object<T> {
    readonly '<$Function>': unknown;
    get isFunction(): true;
    ['[[Environment]]']: $EnvRec;
    ['[[FunctionKind]]']: FunctionKind;
    ['[[ECMAScriptCode]]']: $$Function;
    ['[[ConstructorKind]]']: ConstructorKind;
    ['[[Realm]]']: Realm;
    ['[[ScriptOrModule]]']: $$ESModuleOrScript | $Null;
    ['[[ThisMode]]']: ThisMode;
    ['[[Strict]]']: $Boolean;
    ['[[HomeObject]]']: $AnyObject;
    ['[[SourceText]]']: $String;
    constructor(realm: Realm, IntrinsicName: T, proto: $AnyObject);
    toString(): string;
    '[[Call]]'(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>): $AnyNonEmpty;
    '[[Construct]]'(ctx: ExecutionContext, argumentsList: $List<$AnyNonEmpty>, newTarget: $Function): $AnyObject | $Error;
    static FunctionAllocate(ctx: ExecutionContext, functionPrototype: $AnyObject, strict: $Boolean, functionKind: FunctionKind.normal | FunctionKind.nonConstructor | FunctionKind.generator | FunctionKind.async | FunctionKind.asyncGenerator): $Function;
    static FunctionInitialize(ctx: ExecutionContext, F: $Function, kind: 'normal' | 'method' | 'arrow', code: $$Function, Scope: $EnvRec): $Function;
    static FunctionCreate(ctx: ExecutionContext, kind: 'normal' | 'method' | 'arrow', code: $$Function, Scope: $EnvRec, Strict: $Boolean, prototype?: $AnyObject): $Function;
    static GeneratorFunctionCreate(ctx: ExecutionContext, kind: 'normal' | 'method' | 'arrow', code: $$Function, Scope: $EnvRec, Strict: $Boolean): $Function;
    static AsyncGeneratorFunctionCreate(ctx: ExecutionContext, kind: 'normal' | 'method' | 'arrow', code: $$Function, Scope: $EnvRec, Strict: $Boolean): $Function;
    static AsyncFunctionCreate(ctx: ExecutionContext, kind: 'normal' | 'method' | 'arrow', code: $$Function, Scope: $EnvRec, Strict: $Boolean): $Function;
    MakeConstructor(ctx: ExecutionContext, writablePrototype?: $Boolean, prototype?: $AnyObject): $Undefined;
    SetFunctionName(ctx: ExecutionContext, name: $String | $Symbol, prefix?: $String): $Boolean;
}
export declare function $OrdinaryCreateFromConstructor<T extends IntrinsicObjectKey = IntrinsicObjectKey, TSlots extends {} = {}>(ctx: ExecutionContext, constructor: $Function, intrinsicDefaultProto: T, internalSlotsList?: TSlots): ($Object<T> & TSlots) | $Error;
export declare function $GetPrototypeFromConstructor<T extends IntrinsicObjectKey = IntrinsicObjectKey>(ctx: ExecutionContext, constructor: $Function, intrinsicDefaultProto: T): Intrinsics[T] | $Error;
export declare type ConstructorKind = 'base' | 'derived';
export declare type ThisMode = 'lexical' | 'strict' | 'global';
export declare abstract class $BuiltinFunction<T extends string = string> extends $Function<T> {
    readonly '<$BuiltinFunction>': unknown;
    constructor(realm: Realm, IntrinsicName: T, proto: $AnyObject);
    '[[Call]]'(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>): $AnyNonEmpty;
    '[[Construct]]'(ctx: ExecutionContext, argumentsList: $List<$AnyNonEmpty>, newTarget: $Function | $Undefined): $AnyObject | $Error;
    abstract performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
//# sourceMappingURL=function.d.ts.map