"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$AsyncFromSyncIteratorContinuation = exports.$AsyncFromSyncIterator_Value_Unwrap = exports.$AsyncFromSyncIteratorPrototype_throw = exports.$AsyncFromSyncIteratorPrototype_return = exports.$AsyncFromSyncIteratorPrototype_next = exports.$AsyncFromSyncIteratorPrototype = exports.$CreateAsyncFromSyncIterator = exports.$AsyncIteratorPrototype = exports.$IteratorPrototype = exports.$Symbol_AsyncIterator = exports.$Symbol_Iterator = exports.$AsyncFromSyncIterator = exports.$IteratorRecord = exports.$ListIterator = exports.$ListIterator_next = exports.$CreateListIteratorRecord = exports.$CreateIterResultObject = exports.$AsyncIteratorClose = exports.$IteratorClose = exports.$IteratorStep = exports.$IteratorValue = exports.$IteratorComplete = exports.$IteratorNext = exports.$GetIterator = void 0;
const object_js_1 = require("../types/object.js");
const function_js_1 = require("../types/function.js");
const operations_js_1 = require("../operations.js");
const number_js_1 = require("../types/number.js");
const error_js_1 = require("../types/error.js");
const string_js_1 = require("../types/string.js");
const property_descriptor_js_1 = require("../types/property-descriptor.js");
const list_js_1 = require("../types/list.js");
const promise_js_1 = require("./promise.js");
// http://www.ecma-international.org/ecma-262/#sec-getiterator
function $GetIterator(ctx, obj, hint, method) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. If hint is not present, set hint to sync.
    if (hint === void 0) {
        hint = 'sync';
    }
    // 2. Assert: hint is either sync or async.
    // 3. If method is not present, then
    if (method === void 0) {
        // 3. a. If hint is async, then
        if (hint === 'async') {
            // 3. a. i. Set method to ? GetMethod(obj, @@asyncIterator).
            const $method = operations_js_1.$GetMethod(ctx, obj, intrinsics['@@asyncIterator']);
            if ($method.isAbrupt) {
                return $method;
            }
            method = $method;
            // 3. a. ii. If method is undefined, then
            if (method.isUndefined) {
                // 3. a. ii. 1. Let syncMethod be ? GetMethod(obj, @@iterator).
                const syncMethod = operations_js_1.$GetMethod(ctx, obj, intrinsics['@@iterator']);
                if (syncMethod.isAbrupt) {
                    return syncMethod;
                }
                // 3. a. ii. 2. Let syncIteratorRecord be ? GetIterator(obj, sync, syncMethod).
                const syncIteratorRecord = $GetIterator(ctx, obj, 'sync', syncMethod);
                if (syncIteratorRecord.isAbrupt) {
                    return syncIteratorRecord;
                }
                // 3. a. ii. 3. Return ? CreateAsyncFromSyncIterator(syncIteratorRecord).
                return $CreateAsyncFromSyncIterator(ctx, syncIteratorRecord);
            }
        }
        else {
            // 3. b. Otherwise, set method to ? GetMethod(obj, @@iterator).
            const $method = operations_js_1.$GetMethod(ctx, obj, intrinsics['@@iterator']);
            if ($method.isAbrupt) {
                return $method;
            }
            method = $method;
        }
    }
    // 4. Let iterator be ? Call(method, obj).
    const iterator = operations_js_1.$Call(ctx, method, obj, intrinsics.undefined);
    if (iterator.isAbrupt) {
        return iterator;
    }
    // 5. If Type(iterator) is not Object, throw a TypeError exception.
    if (!iterator.isObject) {
        return new error_js_1.$TypeError(realm, `The iterator is ${iterator}, but expected an object`);
    }
    // 6. Let nextMethod be ? GetV(iterator, "next").
    const nextMethod = iterator['[[Get]]'](ctx, intrinsics.next, iterator);
    if (nextMethod.isAbrupt) {
        return nextMethod;
    }
    // 7. Let iteratorRecord be Record { [[Iterator]]: iterator, [[NextMethod]]: nextMethod, [[Done]]: false }.
    const iteratorRecord = new $IteratorRecord(
    /* [[Iterator]] */ iterator, 
    /* [[NextMethod]] */ nextMethod, 
    /* [[Done]] */ intrinsics.false);
    // 8. Return iteratorRecord.
    return iteratorRecord;
}
exports.$GetIterator = $GetIterator;
// http://www.ecma-international.org/ecma-262/#sec-iteratornext
function $IteratorNext(ctx, iteratorRecord, value) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    let result;
    // 1. If value is not present, then
    if (value === void 0) {
        // 1. a. Let result be ? Call(iteratorRecord.[[NextMethod]], iteratorRecord.[[Iterator]], « »).
        const $result = operations_js_1.$Call(ctx, iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], intrinsics.undefined);
        if ($result.isAbrupt) {
            return $result;
        }
        result = $result;
    }
    // 2. Else,
    else {
        // 2. a. Let result be ? Call(iteratorRecord.[[NextMethod]], iteratorRecord.[[Iterator]], « value »).
        const $result = operations_js_1.$Call(ctx, iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], new list_js_1.$List(value));
        if ($result.isAbrupt) {
            return $result;
        }
        result = $result;
    }
    // 3. If Type(result) is not Object, throw a TypeError exception.
    if (!result.isObject) {
        return new error_js_1.$TypeError(ctx.Realm, `The iterator next result is ${result}, but expected an object`);
    }
    // 4. Return result.
    return result;
}
exports.$IteratorNext = $IteratorNext;
// http://www.ecma-international.org/ecma-262/#sec-iteratorcomplete
function $IteratorComplete(ctx, iterResult) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(iterResult) is Object.
    // 2. Return ToBoolean(? Get(iterResult, "done")).
    return iterResult['[[Get]]'](ctx, intrinsics.$done, iterResult).ToBoolean(ctx);
}
exports.$IteratorComplete = $IteratorComplete;
// http://www.ecma-international.org/ecma-262/#sec-iteratorvalue
function $IteratorValue(ctx, iterResult) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(iterResult) is Object.
    // 2. Return ? Get(iterResult, "value").
    return iterResult['[[Get]]'](ctx, intrinsics.$value, iterResult);
}
exports.$IteratorValue = $IteratorValue;
// http://www.ecma-international.org/ecma-262/#sec-iteratorstep
function $IteratorStep(ctx, iteratorRecord) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let result be ? IteratorNext(iteratorRecord).
    const result = $IteratorNext(ctx, iteratorRecord);
    if (result.isAbrupt) {
        return result;
    }
    // 2. Let done be ? IteratorComplete(result).
    const done = $IteratorComplete(ctx, result);
    if (done.isAbrupt) {
        return done;
    }
    // 3. If done is true, return false.
    if (done.isTruthy) {
        return intrinsics.false;
    }
    // 4. Return result.
    return result;
}
exports.$IteratorStep = $IteratorStep;
// http://www.ecma-international.org/ecma-262/#sec-iteratorclose
function $IteratorClose(ctx, iteratorRecord, completion) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(iteratorRecord.[[Iterator]]) is Object.
    // 2. Assert: completion is a Completion Record.
    // 3. Let iterator be iteratorRecord.[[Iterator]].
    const iterator = iteratorRecord['[[Iterator]]'];
    // 4. Let return be ? GetMethod(iterator, "return").
    const $return = iterator.GetMethod(ctx, intrinsics.$return);
    if ($return.isAbrupt) {
        return $return;
    }
    // 5. If return is undefined, return Completion(completion).
    if ($return.isUndefined) {
        return completion;
    }
    // 6. Let innerResult be Call(return, iterator, « »).
    const innerResult = operations_js_1.$Call(ctx, $return, iterator, intrinsics.undefined);
    // 7. If completion.[[Type]] is throw, return Completion(completion).
    if (completion['[[Type]]'] === 5 /* throw */) {
        return completion;
    }
    // 8. If innerResult.[[Type]] is throw, return Completion(innerResult).
    if (innerResult['[[Type]]'] === 5 /* throw */) {
        return innerResult;
    }
    // 9. If Type(innerResult.[[Value]]) is not Object, throw a TypeError exception.
    if (!innerResult.isObject) {
        return new error_js_1.$TypeError(realm, `The iterator close innerResult is ${innerResult}, but expected an object`);
    }
    // 10. Return Completion(completion).
    return completion;
}
exports.$IteratorClose = $IteratorClose;
// http://www.ecma-international.org/ecma-262/#sec-asynciteratorclose
function $AsyncIteratorClose(ctx, iteratorRecord, completion) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(iteratorRecord.[[Iterator]]) is Object.
    // 2. Assert: completion is a Completion Record.
    // 3. Let iterator be iteratorRecord.[[Iterator]].
    const iterator = iteratorRecord['[[Iterator]]'];
    // 4. Let return be ? GetMethod(iterator, "return").
    const $return = iterator.GetMethod(ctx, intrinsics.$return);
    if ($return.isAbrupt) {
        return $return;
    }
    // 5. If return is undefined, return Completion(completion).
    if ($return.isUndefined) {
        return completion;
    }
    // 6. Let innerResult be Call(return, iterator, « »).
    const innerResult = operations_js_1.$Call(ctx, $return, iterator, intrinsics.undefined);
    // 7. If innerResult.[[Type]] is normal, set innerResult to Await(innerResult.[[Value]]).
    if (innerResult['[[Type]]'] === 1 /* normal */) {
        // TODO: implement await
        // http://www.ecma-international.org/ecma-262/#await
        // 6.2.3.1 Await
    }
    // 8. If completion.[[Type]] is throw, return Completion(completion).
    if (completion['[[Type]]'] === 5 /* throw */) {
        return completion;
    }
    // 9. If innerResult.[[Type]] is throw, return Completion(innerResult).
    if (innerResult['[[Type]]'] === 5 /* throw */) {
        return innerResult;
    }
    // 10. If Type(innerResult.[[Value]]) is not Object, throw a TypeError exception.
    if (!innerResult.isObject) {
        return new error_js_1.$TypeError(realm, `The async iterator close innerResult is ${innerResult}, but expected an object`);
    }
    // 11. Return Completion(completion).
    return completion;
}
exports.$AsyncIteratorClose = $AsyncIteratorClose;
// http://www.ecma-international.org/ecma-262/#sec-createiterresultobject
function $CreateIterResultObject(ctx, value, done) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: Type(done) is Boolean.
    // 2. Let obj be ObjectCreate(%ObjectPrototype%).
    const obj = object_js_1.$Object.ObjectCreate(ctx, 'IterResultObject', intrinsics['%ObjectPrototype%']);
    // 3. Perform CreateDataProperty(obj, "value", value).
    operations_js_1.$CreateDataProperty(ctx, obj, intrinsics.$value, value);
    // 4. Perform CreateDataProperty(obj, "done", done).
    operations_js_1.$CreateDataProperty(ctx, obj, intrinsics.$done, done);
    // 5. Return obj.
    return obj;
}
exports.$CreateIterResultObject = $CreateIterResultObject;
// http://www.ecma-international.org/ecma-262/#sec-createlistiteratorRecord
function $CreateListIteratorRecord(ctx, list) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let iterator be ObjectCreate(%IteratorPrototype%, « [[IteratedList]], [[ListIteratorNextIndex]] »).
    // 4. Let steps be the algorithm steps defined in ListIterator next (7.4.9.1).
    // 5. Let next be CreateBuiltinFunction(steps, « »).
    // 6. Return Record { [[Iterator]]: iterator, [[NextMethod]]: next, [[Done]]: false }.
    return new $IteratorRecord(
    /* [[Iterator]] */ new $ListIterator(realm, list), 
    /* [[NextMethod]] */ new $ListIterator_next(realm), 
    /* [[Done]] */ intrinsics.false);
}
exports.$CreateListIteratorRecord = $CreateListIteratorRecord;
// http://www.ecma-international.org/ecma-262/#sec-listiterator-next
class $ListIterator_next extends function_js_1.$BuiltinFunction {
    constructor(realm) {
        super(realm, 'ListIterator_next', realm['[[Intrinsics]]']['%FunctionPrototype%']);
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let O be the this value.
        const O = thisArgument;
        // 2. Assert: Type(O) is Object.
        // 3. Assert: O has an [[IteratedList]] internal slot.
        // 4. Let list be O.[[IteratedList]].
        const list = O['[[IteratedList]]'];
        // 5. Let index be O.[[ListIteratorNextIndex]].
        const index = O['[[ListIteratorNextIndex]]'];
        // 6. Let len be the number of elements of list.
        const len = list.length;
        // 7. If index ≥ len, then
        if (index['[[Value]]'] >= len) {
            // 7. a. Return CreateIterResultObject(undefined, true).
            return $CreateIterResultObject(ctx, intrinsics.undefined, intrinsics.true);
        }
        // 8. Set O.[[ListIteratorNextIndex]] to index + 1.
        O['[[ListIteratorNextIndex]]'] = new number_js_1.$Number(realm, index['[[Value]]'] + 1);
        // 9. Return CreateIterResultObject(list[index], false).
        return $CreateIterResultObject(ctx, list[index['[[Value]]']], intrinsics.false);
    }
}
exports.$ListIterator_next = $ListIterator_next;
class $ListIterator extends object_js_1.$Object {
    constructor(realm, list) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, 'ListIterator', intrinsics['%IteratorPrototype%'], 1 /* normal */, intrinsics.empty);
        this['[[IteratedList]]'] = list;
        this['[[ListIteratorNextIndex]]'] = new number_js_1.$Number(realm, 0);
    }
    get isAbrupt() { return false; }
}
exports.$ListIterator = $ListIterator;
class $IteratorRecord {
    constructor(iterator, next, done) {
        this['[[Iterator]]'] = iterator;
        this['[[NextMethod]]'] = next;
        this['[[Done]]'] = done;
    }
    get isAbrupt() { return false; }
}
exports.$IteratorRecord = $IteratorRecord;
class $AsyncFromSyncIterator extends object_js_1.$Object {
    constructor(realm, syncIteratorRecord) {
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let asyncIterator be ! ObjectCreate(%AsyncFromSyncIteratorPrototype%, « [[SyncIteratorRecord]] »).
        super(realm, 'AsyncFromSyncIterator', intrinsics['%AsyncFromSyncIteratorPrototype%'], 1 /* normal */, intrinsics.empty);
        // 2. Set asyncIterator.[[SyncIteratorRecord]] to syncIteratorRecord.
        this['[[SyncIteratorRecord]]'] = syncIteratorRecord;
    }
}
exports.$AsyncFromSyncIterator = $AsyncFromSyncIterator;
// http://www.ecma-international.org/ecma-262/#sec-%iteratorprototype%-@@iterator
// 25.1.2.1 %IteratorPrototype% [ @@iterator ] ( )
class $Symbol_Iterator extends function_js_1.$BuiltinFunction {
    constructor(realm) {
        super(realm, '[Symbol.iterator]', realm['[[Intrinsics]]']['%FunctionPrototype%']);
        this.SetFunctionName(realm.stack.top, new string_js_1.$String(realm, '[Symbol.iterator]'));
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Return the this value.
        return thisArgument;
    }
}
exports.$Symbol_Iterator = $Symbol_Iterator;
// http://www.ecma-international.org/ecma-262/#sec-asynciteratorprototype-asynciterator
// 25.1.3.1 %AsyncIteratorPrototype% [ @@asyncIterator ] ( )
class $Symbol_AsyncIterator extends function_js_1.$BuiltinFunction {
    constructor(realm) {
        super(realm, '[Symbol.asyncIterator]', realm['[[Intrinsics]]']['%FunctionPrototype%']);
        this.SetFunctionName(realm.stack.top, new string_js_1.$String(realm, '[Symbol.asyncIterator]'));
    }
    performSteps(ctx, thisArgument, argumentsList, NewTarget) {
        // 1. Return the this value.
        return thisArgument;
    }
}
exports.$Symbol_AsyncIterator = $Symbol_AsyncIterator;
// http://www.ecma-international.org/ecma-262/#sec-%iteratorprototype%-object
// 25.1.2 The %IteratorPrototype% Object
class $IteratorPrototype extends object_js_1.$Object {
    constructor(realm, proto) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%IteratorPrototype%', proto, 1 /* normal */, intrinsics.empty);
        operations_js_1.$DefinePropertyOrThrow(realm.stack.top, this, intrinsics['@@iterator'], new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics['@@iterator'], {
            '[[Value]]': new $Symbol_Iterator(realm),
        }));
    }
}
exports.$IteratorPrototype = $IteratorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-asynciteratorprototype
// 25.1.3 The %AsyncIteratorPrototype% Object
class $AsyncIteratorPrototype extends object_js_1.$Object {
    constructor(realm, proto) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%AsyncIteratorPrototype%', proto, 1 /* normal */, intrinsics.empty);
        operations_js_1.$DefinePropertyOrThrow(realm.stack.top, this, intrinsics['@@asyncIterator'], new property_descriptor_js_1.$PropertyDescriptor(realm, intrinsics['@@asyncIterator'], {
            '[[Value]]': new $Symbol_AsyncIterator(realm),
        }));
    }
}
exports.$AsyncIteratorPrototype = $AsyncIteratorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-async-from-sync-iterator-objects
// #region 25.1.4 Async-from-Sync Iterator Objects
// http://www.ecma-international.org/ecma-262/#sec-createasyncfromsynciterator
// 25.1.4.1 CreateAsyncFromSyncIterator ( syncIteratorRecord )
function $CreateAsyncFromSyncIterator(ctx, syncIteratorRecord) {
    const realm = ctx.Realm;
    // 1. Let asyncIterator be ! ObjectCreate(%AsyncFromSyncIteratorPrototype%, « [[SyncIteratorRecord]] »).
    // 2. Set asyncIterator.[[SyncIteratorRecord]] to syncIteratorRecord.
    const asyncIterator = new $AsyncFromSyncIterator(realm, syncIteratorRecord);
    // 3. Return ? GetIterator(asyncIterator, async).
    return $GetIterator(ctx, asyncIterator, 'async');
}
exports.$CreateAsyncFromSyncIterator = $CreateAsyncFromSyncIterator;
// http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%-object
// 25.1.4.2 The %AsyncFromSyncIteratorPrototype% Object
class $AsyncFromSyncIteratorPrototype extends object_js_1.$Object {
    // http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%.next
    // 25.1.4.2.1 %AsyncFromSyncIteratorPrototype%.next ( value )
    get next() {
        return this.getProperty(this.realm['[[Intrinsics]]'].next)['[[Value]]'];
    }
    set next(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].next, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%.return
    // 25.1.4.2.2 %AsyncFromSyncIteratorPrototype%.return ( value )
    get return() {
        return this.getProperty(this.realm['[[Intrinsics]]'].return)['[[Value]]'];
    }
    set return(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].return, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%.throw
    // 25.1.4.2.3 %AsyncFromSyncIteratorPrototype%.throw ( value )
    get throw() {
        return this.getProperty(this.realm['[[Intrinsics]]'].throw)['[[Value]]'];
    }
    set throw(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]'].throw, value);
    }
    // http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%-@@tostringtag
    // 25.1.4.2.4 %AsyncFromSyncIteratorPrototype% [ @@toStringTag ]
    get '@@toStringTag'() {
        return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'];
    }
    set '@@toStringTag'(value) {
        this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
    }
    constructor(realm, proto) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, '%AsyncFromSyncIteratorPrototype%', proto, 1 /* normal */, intrinsics.empty);
    }
}
exports.$AsyncFromSyncIteratorPrototype = $AsyncFromSyncIteratorPrototype;
// http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%.next
// 25.1.4.2.1 %AsyncFromSyncIteratorPrototype%.next ( value )
class $AsyncFromSyncIteratorPrototype_next extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%AsyncFromSyncIteratorPrototype%.next', proto);
    }
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (value === void 0) {
            value = intrinsics.undefined;
        }
        // 1. Let O be the this value.
        const O = thisArgument;
        // 2. Let promiseCapability be ! NewPromiseCapability(%Promise%).
        const promiseCapability = promise_js_1.$NewPromiseCapability(ctx, intrinsics['%Promise%']);
        // 3. If Type(O) is not Object, or if O does not have a [[SyncIteratorRecord]] internal slot, then
        if (!(O instanceof $AsyncFromSyncIterator)) {
            // 3. a. Let invalidIteratorError be a newly created TypeError object.
            const invalidIteratorError = new error_js_1.$TypeError(realm, `Expected AsyncFromSyncIterator, but got: ${O}`);
            // 3. b. Perform ! Call(promiseCapability.[[Reject]], undefined, « invalidIteratorError »).
            operations_js_1.$Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new list_js_1.$List(invalidIteratorError));
            // 3. c. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 4. Let syncIteratorRecord be O.[[SyncIteratorRecord]].
        const syncIteratorRecord = O['[[SyncIteratorRecord]]'];
        // 5. Let result be IteratorNext(syncIteratorRecord, value).
        const result = $IteratorNext(ctx, syncIteratorRecord, value);
        // 6. IfAbruptRejectPromise(result, promiseCapability).
        const $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, result, promiseCapability);
        if ($IfAbruptRejectPromiseResult.isAbrupt) {
            return $IfAbruptRejectPromiseResult;
        }
        // 7. Return ! AsyncFromSyncIteratorContinuation(result, promiseCapability).
        return $AsyncFromSyncIteratorContinuation(ctx, result, promiseCapability);
    }
}
exports.$AsyncFromSyncIteratorPrototype_next = $AsyncFromSyncIteratorPrototype_next;
// http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%.return
// 25.1.4.2.2 %AsyncFromSyncIteratorPrototype%.return ( value )
class $AsyncFromSyncIteratorPrototype_return extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%AsyncFromSyncIteratorPrototype%.return', proto);
    }
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (value === void 0) {
            value = intrinsics.undefined;
        }
        // 1. Let O be the this value.
        const O = thisArgument;
        // 2. Let promiseCapability be ! NewPromiseCapability(%Promise%).
        const promiseCapability = promise_js_1.$NewPromiseCapability(ctx, intrinsics['%Promise%']);
        // 3. If Type(O) is not Object, or if O does not have a [[SyncIteratorRecord]] internal slot, then
        if (!(O instanceof $AsyncFromSyncIterator)) {
            // 3. a. Let invalidIteratorError be a newly created TypeError object.
            const invalidIteratorError = new error_js_1.$TypeError(realm, `Expected AsyncFromSyncIterator, but got: ${O}`);
            // 3. b. Perform ! Call(promiseCapability.[[Reject]], undefined, « invalidIteratorError »).
            operations_js_1.$Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new list_js_1.$List(invalidIteratorError));
            // 3. c. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 4. Let syncIterator be O.[[SyncIteratorRecord]].[[Iterator]].
        const syncIterator = O['[[SyncIteratorRecord]]']['[[Iterator]]'];
        // 5. Let return be GetMethod(syncIterator, "return").
        const $return = operations_js_1.$GetMethod(ctx, syncIterator, intrinsics.return);
        // 6. IfAbruptRejectPromise(return, promiseCapability).
        let $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, $return, promiseCapability);
        if ($IfAbruptRejectPromiseResult.isAbrupt) {
            return $IfAbruptRejectPromiseResult;
        }
        // 7. If return is undefined, then
        if ($return.isUndefined) {
            // 7. a. Let iterResult be ! CreateIterResultObject(value, true).
            const iterResult = $CreateIterResultObject(ctx, value, intrinsics.true);
            // 7. b. Perform ! Call(promiseCapability.[[Resolve]], undefined, « iterResult »).
            operations_js_1.$Call(ctx, promiseCapability['[[Resolve]]'], intrinsics.undefined, new list_js_1.$List(iterResult));
            // 7. c. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 8. Let result be Call(return, syncIterator, « value »).
        const result = operations_js_1.$Call(ctx, $return, syncIterator, new list_js_1.$List(value));
        // 9. IfAbruptRejectPromise(result, promiseCapability).
        $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, result, promiseCapability);
        if ($IfAbruptRejectPromiseResult.isAbrupt) {
            return $IfAbruptRejectPromiseResult;
        }
        // 10. If Type(result) is not Object, then
        if (!result.isObject) {
            // 10. a. Perform ! Call(promiseCapability.[[Reject]], undefined, « a newly created TypeError object »).
            const err = new error_js_1.$TypeError(realm, `Expected syncIterator return result to be an object, but got: ${result}`);
            operations_js_1.$Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new list_js_1.$List(err));
            // 10. b. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 11. Return ! AsyncFromSyncIteratorContinuation(result, promiseCapability).
        return $AsyncFromSyncIteratorContinuation(ctx, result, promiseCapability);
    }
}
exports.$AsyncFromSyncIteratorPrototype_return = $AsyncFromSyncIteratorPrototype_return;
// http://www.ecma-international.org/ecma-262/#sec-%asyncfromsynciteratorprototype%.throw
// 25.1.4.2.3 %AsyncFromSyncIteratorPrototype%.throw ( value )
class $AsyncFromSyncIteratorPrototype_throw extends function_js_1.$BuiltinFunction {
    constructor(realm, proto) {
        super(realm, '%AsyncFromSyncIteratorPrototype%.throw', proto);
    }
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (value === void 0) {
            value = intrinsics.undefined;
        }
        // 1. Let O be the this value.
        const O = thisArgument;
        // 2. Let promiseCapability be ! NewPromiseCapability(%Promise%).
        const promiseCapability = promise_js_1.$NewPromiseCapability(ctx, intrinsics['%Promise%']);
        // 3. If Type(O) is not Object, or if O does not have a [[SyncIteratorRecord]] internal slot, then
        if (!(O instanceof $AsyncFromSyncIterator)) {
            // 3. a. Let invalidIteratorError be a newly created TypeError object.
            const invalidIteratorError = new error_js_1.$TypeError(realm, `Expected AsyncFromSyncIterator, but got: ${O}`);
            // 3. b. Perform ! Call(promiseCapability.[[Reject]], undefined, « invalidIteratorError »).
            operations_js_1.$Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new list_js_1.$List(invalidIteratorError));
            // 3. c. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 4. Let syncIterator be O.[[SyncIteratorRecord]].[[Iterator]].
        const syncIterator = O['[[SyncIteratorRecord]]']['[[Iterator]]'];
        // 5. Let throw be GetMethod(syncIterator, "throw").
        const $throw = operations_js_1.$GetMethod(ctx, syncIterator, intrinsics.throw);
        // 6. IfAbruptRejectPromise(throw, promiseCapability).
        let $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, $throw, promiseCapability);
        if ($IfAbruptRejectPromiseResult.isAbrupt) {
            return $IfAbruptRejectPromiseResult;
        }
        // 7. If throw is undefined, then
        if ($throw.isUndefined) {
            // 7. a. Perform ! Call(promiseCapability.[[Reject]], undefined, « value »).
            operations_js_1.$Call(ctx, promiseCapability['[[Resolve]]'], intrinsics.undefined, new list_js_1.$List(value));
            // 7. b. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 8. Let result be Call(throw, syncIterator, « value »).
        const result = operations_js_1.$Call(ctx, $throw, syncIterator, new list_js_1.$List(value));
        // 9. IfAbruptRejectPromise(result, promiseCapability).
        $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, result, promiseCapability);
        if ($IfAbruptRejectPromiseResult.isAbrupt) {
            return $IfAbruptRejectPromiseResult;
        }
        // 10. If Type(result) is not Object, then
        if (!result.isObject) {
            // 10. a. Perform ! Call(promiseCapability.[[Reject]], undefined, « a newly created TypeError object »).
            const err = new error_js_1.$TypeError(realm, `Expected syncIterator return result to be an object, but got: ${result}`);
            operations_js_1.$Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new list_js_1.$List(err));
            // 10. b. Return promiseCapability.[[Promise]].
            return promiseCapability['[[Promise]]'];
        }
        // 11. Return ! AsyncFromSyncIteratorContinuation(result, promiseCapability).
        return $AsyncFromSyncIteratorContinuation(ctx, result, promiseCapability);
    }
}
exports.$AsyncFromSyncIteratorPrototype_throw = $AsyncFromSyncIteratorPrototype_throw;
// http://www.ecma-international.org/ecma-262/#sec-async-from-sync-iterator-value-unwrap-functions
// 25.1.4.2.5 Async-from-Sync Iterator Value Unwrap Functions
class $AsyncFromSyncIterator_Value_Unwrap extends function_js_1.$BuiltinFunction {
    constructor(realm, done) {
        const intrinsics = realm['[[Intrinsics]]'];
        super(realm, 'Async-from-Sync Iterator Value Unwrap', intrinsics['%FunctionPrototype%']);
        this['[[Done]]'] = done;
    }
    performSteps(ctx, thisArgument, [value], NewTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        if (value === void 0) {
            value = intrinsics.undefined;
        }
        // 1. Let F be the active function object.
        const F = this;
        // 2. Return ! CreateIterResultObject(value, F.[[Done]]).
        return $CreateIterResultObject(ctx, value, F['[[Done]]']);
    }
}
exports.$AsyncFromSyncIterator_Value_Unwrap = $AsyncFromSyncIterator_Value_Unwrap;
// http://www.ecma-international.org/ecma-262/#sec-properties-of-async-from-sync-iterator-instances
// 25.1.4.3 Properties of Async-from-Sync Iterator Instances
// http://www.ecma-international.org/ecma-262/#sec-asyncfromsynciteratorcontinuation
// 25.1.4.4 AsyncFromSyncIteratorContinuation ( result , promiseCapability )
function $AsyncFromSyncIteratorContinuation(ctx, result, promiseCapability) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let done be IteratorComplete(result).
    const done = $IteratorComplete(ctx, result);
    // 2. IfAbruptRejectPromise(done, promiseCapability).
    let $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, done, promiseCapability);
    if ($IfAbruptRejectPromiseResult.isAbrupt) {
        return $IfAbruptRejectPromiseResult;
    }
    // 3. Let value be IteratorValue(result).
    const value = $IteratorValue(ctx, result);
    // 4. IfAbruptRejectPromise(value, promiseCapability).
    $IfAbruptRejectPromiseResult = promise_js_1.$IfAbruptRejectPromise(ctx, value, promiseCapability);
    if ($IfAbruptRejectPromiseResult.isAbrupt) {
        return $IfAbruptRejectPromiseResult;
    }
    // 5. Let valueWrapper be ? PromiseResolve(%Promise%, « value »).
    const valueWrapper = promise_js_1.$PromiseResolve(ctx, intrinsics['%Promise%'], new list_js_1.$List(value)); // TODO: fix types
    if (valueWrapper.isAbrupt) {
        return valueWrapper;
    }
    // 6. Let steps be the algorithm steps defined in Async-from-Sync Iterator Value Unwrap Functions.
    // 7. Let onFulfilled be CreateBuiltinFunction(steps, « [[Done]] »).
    // 8. Set onFulfilled.[[Done]] to done.
    const onFulfilled = new $AsyncFromSyncIterator_Value_Unwrap(realm, done);
    // 9. Perform ! PerformPromiseThen(valueWrapper, onFulfilled, undefined, promiseCapability).
    promise_js_1.$PerformPromiseThen(ctx, valueWrapper, onFulfilled, intrinsics.undefined, promiseCapability);
    // 10. Return promiseCapability.[[Promise]].
    return promiseCapability['[[Promise]]'];
}
exports.$AsyncFromSyncIteratorContinuation = $AsyncFromSyncIteratorContinuation;
// #endregion
//# sourceMappingURL=iteration.js.map