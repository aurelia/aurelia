import { ExecutionContext, Realm } from '../realm.js';
import { $Object } from '../types/object.js';
import { $Function, $BuiltinFunction } from '../types/function.js';
import { $Boolean } from '../types/boolean.js';
import { $AnyNonError, $AnyNonEmpty, $AnyNonEmptyNonError, $AnyObject, $Any } from '../types/_shared.js';
import { $Number } from '../types/number.js';
import { $Undefined } from '../types/undefined.js';
import { $Error } from '../types/error.js';
import { $String } from '../types/string.js';
import { $List } from '../types/list.js';
import { $ObjectPrototype } from './object.js';
import { $FunctionPrototype } from './function.js';
import { $PromiseCapability, $PromiseInstance } from './promise.js';
export declare function $GetIterator(ctx: ExecutionContext, obj: $AnyNonEmptyNonError, hint?: 'sync' | 'async', method?: $Function | $Undefined): $IteratorRecord | $Error;
export declare function $IteratorNext(ctx: ExecutionContext, iteratorRecord: $IteratorRecord, value?: $AnyNonEmpty): $AnyObject | $Error;
export declare function $IteratorComplete(ctx: ExecutionContext, iterResult: $AnyObject): $Boolean | $Error;
export declare function $IteratorValue(ctx: ExecutionContext, iterResult: $AnyObject): $AnyNonEmpty;
export declare function $IteratorStep(ctx: ExecutionContext, iteratorRecord: $IteratorRecord): $AnyObject | $Boolean<false> | $Error;
export declare function $IteratorClose(ctx: ExecutionContext, iteratorRecord: $IteratorRecord, completion: $Any): $Any;
export declare function $AsyncIteratorClose(ctx: ExecutionContext, iteratorRecord: $IteratorRecord, completion: $AnyNonError): $AnyNonError | $Error;
export declare function $CreateIterResultObject(ctx: ExecutionContext, value: $AnyNonEmpty, done: $Boolean): $Object<"IterResultObject">;
export declare function $CreateListIteratorRecord(ctx: ExecutionContext, list: $List<$AnyNonEmpty>): $IteratorRecord;
export declare class $ListIterator_next extends $BuiltinFunction<'ListIterator_next'> {
    constructor(realm: Realm);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $ListIterator extends $Object<'ListIterator'> {
    readonly '[[IteratedList]]': $List<$AnyNonEmpty>;
    '[[ListIteratorNextIndex]]': $Number;
    get isAbrupt(): false;
    constructor(realm: Realm, list: $List<$AnyNonEmpty>);
}
export declare class $IteratorRecord {
    readonly '[[Iterator]]': $AnyObject;
    readonly '[[NextMethod]]': $Function;
    '[[Done]]': $Boolean;
    get isAbrupt(): false;
    constructor(iterator: $AnyObject, next: $Function, done: $Boolean);
}
export declare class $AsyncFromSyncIterator extends $Object<'AsyncFromSyncIterator'> {
    readonly '[[SyncIteratorRecord]]': $IteratorRecord;
    constructor(realm: Realm, syncIteratorRecord: $IteratorRecord);
}
export declare class $Symbol_Iterator extends $BuiltinFunction<'[Symbol.iterator]'> {
    constructor(realm: Realm);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $Symbol_AsyncIterator extends $BuiltinFunction<'[Symbol.asyncIterator]'> {
    constructor(realm: Realm);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, argumentsList: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $IteratorPrototype extends $Object<'%IteratorPrototype%'> {
    constructor(realm: Realm, proto: $ObjectPrototype);
}
export declare class $AsyncIteratorPrototype extends $Object<'%AsyncIteratorPrototype%'> {
    constructor(realm: Realm, proto: $ObjectPrototype);
}
export declare function $CreateAsyncFromSyncIterator(ctx: ExecutionContext, syncIteratorRecord: $IteratorRecord): $IteratorRecord | $Error;
export declare class $AsyncFromSyncIteratorPrototype extends $Object<'%AsyncFromSyncIteratorPrototype%'> {
    get next(): $AsyncFromSyncIteratorPrototype_next;
    set next(value: $AsyncFromSyncIteratorPrototype_next);
    get return(): $AsyncFromSyncIteratorPrototype_return;
    set return(value: $AsyncFromSyncIteratorPrototype_return);
    get throw(): $AsyncFromSyncIteratorPrototype_throw;
    set throw(value: $AsyncFromSyncIteratorPrototype_throw);
    get '@@toStringTag'(): $String<'Async-from-Sync Iterator'>;
    set '@@toStringTag'(value: $String<'Async-from-Sync Iterator'>);
    constructor(realm: Realm, proto: $AsyncIteratorPrototype);
}
export declare class $AsyncFromSyncIteratorPrototype_next extends $BuiltinFunction<'%AsyncFromSyncIteratorPrototype%.next'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncFromSyncIteratorPrototype_return extends $BuiltinFunction<'%AsyncFromSyncIteratorPrototype%.return'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncFromSyncIteratorPrototype_throw extends $BuiltinFunction<'%AsyncFromSyncIteratorPrototype%.throw'> {
    constructor(realm: Realm, proto: $FunctionPrototype);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare class $AsyncFromSyncIterator_Value_Unwrap extends $BuiltinFunction<'Async-from-Sync Iterator Value Unwrap'> {
    '[[Done]]': $Boolean;
    constructor(realm: Realm, done: $Boolean);
    performSteps(ctx: ExecutionContext, thisArgument: $AnyNonEmptyNonError, [value]: $List<$AnyNonEmpty>, NewTarget: $Function | $Undefined): $AnyNonEmpty;
}
export declare function $AsyncFromSyncIteratorContinuation(ctx: ExecutionContext, result: $AnyObject, promiseCapability: $PromiseCapability): $PromiseInstance | $Error;
//# sourceMappingURL=iteration.d.ts.map