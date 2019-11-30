import {
  ExecutionContext,
  Realm,
} from '../realm';
import {
  $Object,
} from '../types/object';
import {
  $Function,
  $BuiltinFunction,
} from '../types/function';
import {
  $Boolean,
} from '../types/boolean';
import {
  $AnyNonError,
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
  CompletionType,
  $AnyObject,
} from '../types/_shared';
import {
  $CreateDataProperty,
  $Call,
  $DefinePropertyOrThrow,
  $GetMethod,
} from '../operations';
import {
  $Number,
} from '../types/number';
import {
  $Undefined,
} from '../types/undefined';
import {
  $TypeError,
  $Error,
} from '../types/error';
import {
  $String,
} from '../types/string';
import {
  $PropertyDescriptor,
} from '../types/property-descriptor';
import {
  $List
} from '../types/list';

// http://www.ecma-international.org/ecma-262/#sec-getiterator
export function $GetIterator(
  ctx: ExecutionContext,
  obj: $AnyNonEmptyNonError,
  hint?: 'sync' | 'async',
  method?: $Function | $Undefined,
): $IteratorRecord | $Error {
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
      const $method = $GetMethod(ctx, obj, intrinsics['@@asyncIterator']);
      if ($method.isAbrupt) { return $method; }
      method = $method;

      // 3. a. ii. If method is undefined, then
      if (method.isUndefined) {
        // 3. a. ii. 1. Let syncMethod be ? GetMethod(obj, @@iterator).
        const syncMethod = $GetMethod(ctx, obj, intrinsics['@@iterator']);
        if (syncMethod.isAbrupt) { return syncMethod; }

        // 3. a. ii. 2. Let syncIteratorRecord be ? GetIterator(obj, sync, syncMethod).
        const syncIteratorRecord = $GetIterator(ctx, obj, 'sync', syncMethod);
        if (syncIteratorRecord.isAbrupt) { return syncIteratorRecord; }

        // 3. a. ii. 3. Return ? CreateAsyncFromSyncIterator(syncIteratorRecord).
        return $CreateAsyncFromSyncIterator(ctx, syncIteratorRecord);
      }
    } else {
      // 3. b. Otherwise, set method to ? GetMethod(obj, @@iterator).
      const $method = $GetMethod(ctx, obj, intrinsics['@@iterator']);
      if ($method.isAbrupt) { return $method; }
      method = $method;
    }
  }

  // 4. Let iterator be ? Call(method, obj).
  const iterator = $Call(ctx, method as $Function, obj, intrinsics.undefined);
  if (iterator.isAbrupt) { return iterator; }

  // 5. If Type(iterator) is not Object, throw a TypeError exception.
  if (!iterator.isObject) {
    return new $TypeError(realm, `The iterator is ${iterator}, but expected an object`);
  }

  // 6. Let nextMethod be ? GetV(iterator, "next").
  const nextMethod = iterator['[[Get]]'](ctx, intrinsics.next, iterator) as $Function | $Error;
  if (nextMethod.isAbrupt) { return nextMethod; }

  // 7. Let iteratorRecord be Record { [[Iterator]]: iterator, [[NextMethod]]: nextMethod, [[Done]]: false }.
  const iteratorRecord = new $IteratorRecord(
    /* [[Iterator]] */iterator,
    /* [[NextMethod]] */nextMethod,
    /* [[Done]] */intrinsics.false,
  );

  // 8. Return iteratorRecord.
  return iteratorRecord;
}

// http://www.ecma-international.org/ecma-262/#sec-iteratornext
export function $IteratorNext(
  ctx: ExecutionContext,
  iteratorRecord: $IteratorRecord,
  value?: $AnyNonEmpty,
): $AnyObject | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  let result: $AnyNonEmpty;

  // 1. If value is not present, then
  if (value === void 0) {
    // 1. a. Let result be ? Call(iteratorRecord.[[NextMethod]], iteratorRecord.[[Iterator]], « »).
    const $result = $Call(ctx, iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], intrinsics.undefined);
    if ($result.isAbrupt) { return $result; }
    result = $result;
  }
  // 2. Else,
  else {
    // 2. a. Let result be ? Call(iteratorRecord.[[NextMethod]], iteratorRecord.[[Iterator]], « value »).
    const $result = $Call(ctx, iteratorRecord['[[NextMethod]]'], iteratorRecord['[[Iterator]]'], new $List(value));
    if ($result.isAbrupt) { return $result; }
    result = $result;
  }

  // 3. If Type(result) is not Object, throw a TypeError exception.
  if (!result.isObject) {
    return new $TypeError(ctx.Realm, `The iterator next result is ${result}, but expected an object`);
  }

  // 4. Return result.
  return result;
}

// http://www.ecma-international.org/ecma-262/#sec-iteratorcomplete
export function $IteratorComplete(
  ctx: ExecutionContext,
  iterResult: $AnyObject,
): $Boolean | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(iterResult) is Object.
  // 2. Return ToBoolean(? Get(iterResult, "done")).
  return iterResult['[[Get]]'](ctx, intrinsics.$done, iterResult).ToBoolean(ctx);
}

// http://www.ecma-international.org/ecma-262/#sec-iteratorvalue
export function $IteratorValue(
  ctx: ExecutionContext,
  iterResult: $AnyObject,
): $AnyNonEmpty  {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(iterResult) is Object.
  // 2. Return ? Get(iterResult, "value").
  return iterResult['[[Get]]'](ctx, intrinsics.$value, iterResult);
}

// http://www.ecma-international.org/ecma-262/#sec-iteratorstep
export function $IteratorStep(
  ctx: ExecutionContext,
  iteratorRecord: $IteratorRecord,
): $AnyObject | $Boolean<false> | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Let result be ? IteratorNext(iteratorRecord).
  const result = $IteratorNext(ctx, iteratorRecord);
  if (result.isAbrupt) { return result; }

  // 2. Let done be ? IteratorComplete(result).
  const done = $IteratorComplete(ctx, result);
  if (done.isAbrupt) { return done; }

  // 3. If done is true, return false.
  if (done.isTruthy) {
    return intrinsics.false;
  }

  // 4. Return result.
  return result;
}

// http://www.ecma-international.org/ecma-262/#sec-iteratorclose
export function $IteratorClose(
  ctx: ExecutionContext,
  iteratorRecord: $IteratorRecord,
  completion: $AnyNonError,
): $AnyNonError | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(iteratorRecord.[[Iterator]]) is Object.
  // 2. Assert: completion is a Completion Record.
  // 3. Let iterator be iteratorRecord.[[Iterator]].
  const iterator = iteratorRecord['[[Iterator]]'];

  // 4. Let return be ? GetMethod(iterator, "return").
  const $return = iterator.GetMethod(ctx, intrinsics.$return);
  if ($return.isAbrupt) { return $return; }

  // 5. If return is undefined, return Completion(completion).
  if ($return.isUndefined) {
    return completion;
  }

  // 6. Let innerResult be Call(return, iterator, « »).
  const innerResult = $Call(ctx, $return, iterator, intrinsics.undefined);

  // 7. If completion.[[Type]] is throw, return Completion(completion).
  if (completion['[[Type]]'] === CompletionType.throw) {
    return completion;
  }

  // 8. If innerResult.[[Type]] is throw, return Completion(innerResult).
  if (innerResult['[[Type]]'] === CompletionType.throw) {
    return innerResult;
  }

  // 9. If Type(innerResult.[[Value]]) is not Object, throw a TypeError exception.
  if (!innerResult.isObject) {
    return new $TypeError(realm, `The iterator close innerResult is ${innerResult}, but expected an object`);
  }

  // 10. Return Completion(completion).
  return completion;
}

// http://www.ecma-international.org/ecma-262/#sec-asynciteratorclose
export function $AsyncIteratorClose(
  ctx: ExecutionContext,
  iteratorRecord: $IteratorRecord,
  completion: $AnyNonError,
): $AnyNonError | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(iteratorRecord.[[Iterator]]) is Object.
  // 2. Assert: completion is a Completion Record.
  // 3. Let iterator be iteratorRecord.[[Iterator]].
  const iterator = iteratorRecord['[[Iterator]]'];

  // 4. Let return be ? GetMethod(iterator, "return").
  const $return = iterator.GetMethod(ctx, intrinsics.$return);
  if ($return.isAbrupt) { return $return; }

  // 5. If return is undefined, return Completion(completion).
  if ($return.isUndefined) {
    return completion;
  }

  // 6. Let innerResult be Call(return, iterator, « »).
  let innerResult = $Call(ctx, $return, iterator, intrinsics.undefined);

  // 7. If innerResult.[[Type]] is normal, set innerResult to Await(innerResult.[[Value]]).
  if (innerResult['[[Type]]'] === CompletionType.normal) {
    // TODO: implement await
    // http://www.ecma-international.org/ecma-262/#await
    // 6.2.3.1 Await
  }

  // 8. If completion.[[Type]] is throw, return Completion(completion).
  if (completion['[[Type]]'] === CompletionType.throw) {
    return completion;
  }

  // 9. If innerResult.[[Type]] is throw, return Completion(innerResult).
  if (innerResult['[[Type]]'] === CompletionType.throw) {
    return innerResult;
  }

  // 10. If Type(innerResult.[[Value]]) is not Object, throw a TypeError exception.
  if (!innerResult.isObject) {
    return new $TypeError(realm, `The async iterator close innerResult is ${innerResult}, but expected an object`);
  }

  // 11. Return Completion(completion).
  return completion;
}

// http://www.ecma-international.org/ecma-262/#sec-createiterresultobject
export function $CreateIterResultObject(
  ctx: ExecutionContext,
  value: $AnyNonEmpty,
  done: $Boolean,
) {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: Type(done) is Boolean.
  // 2. Let obj be ObjectCreate(%ObjectPrototype%).
  const obj = $Object.ObjectCreate(ctx, 'IterResultObject', intrinsics['%ObjectPrototype%']);

  // 3. Perform CreateDataProperty(obj, "value", value).
  $CreateDataProperty(ctx, obj, intrinsics.$value, value);

  // 4. Perform CreateDataProperty(obj, "done", done).
  $CreateDataProperty(ctx, obj, intrinsics.$done, done);

  // 5. Return obj.
  return obj;
}

// http://www.ecma-international.org/ecma-262/#sec-createlistiteratorRecord
export function $CreateListIteratorRecord(
  ctx: ExecutionContext,
  list: $List<$AnyNonEmpty>,
) {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Let iterator be ObjectCreate(%IteratorPrototype%, « [[IteratedList]], [[ListIteratorNextIndex]] »).
  // 4. Let steps be the algorithm steps defined in ListIterator next (7.4.9.1).
  // 5. Let next be CreateBuiltinFunction(steps, « »).
  // 6. Return Record { [[Iterator]]: iterator, [[NextMethod]]: next, [[Done]]: false }.
  return new $IteratorRecord(
    /* [[Iterator]] */new $ListIterator(realm, list),
    /* [[NextMethod]] */new $ListIterator_next(realm),
    /* [[Done]] */intrinsics.false,
  );
}

// http://www.ecma-international.org/ecma-262/#sec-listiterator-next
export class $ListIterator_next extends $BuiltinFunction<'ListIterator_next'> {
  public constructor(
    realm: Realm,
  ) {
    super(realm, 'ListIterator_next', realm['[[Intrinsics]]']['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let O be the this value.
    const O = thisArgument as $ListIterator;

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
    O['[[ListIteratorNextIndex]]'] = new $Number(realm, index['[[Value]]'] + 1);

    // 9. Return CreateIterResultObject(list[index], false).
    return $CreateIterResultObject(ctx, list[index['[[Value]]']], intrinsics.false);
  }
}

export class $ListIterator extends $Object<'ListIterator'> {
  public readonly '[[IteratedList]]': $List<$AnyNonEmpty>;
  public '[[ListIteratorNextIndex]]': $Number;

  public get isAbrupt(): false { return false; }

  public constructor(
    realm: Realm,
    list: $List<$AnyNonEmpty>,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    super(realm, 'ListIterator', intrinsics['%IteratorPrototype%'], CompletionType.normal, intrinsics.empty);

    this['[[IteratedList]]'] = list;
    this['[[ListIteratorNextIndex]]'] = new $Number(realm, 0);
  }
}

export class $IteratorRecord {
  public readonly '[[Iterator]]': $AnyObject;
  public readonly '[[NextMethod]]': $Function;
  public '[[Done]]': $Boolean;

  public get isAbrupt(): false { return false; }

  public constructor(
    iterator: $AnyObject,
    next: $Function,
    done: $Boolean,
  ) {
    this['[[Iterator]]'] = iterator;
    this['[[NextMethod]]'] = next;
    this['[[Done]]'] = done;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-createasyncfromsynciterator
export function $CreateAsyncFromSyncIterator(
  ctx: ExecutionContext,
  syncIteratorRecord: $IteratorRecord,
): $IteratorRecord | $Error {
  const realm = ctx.Realm;

  // 1. Let asyncIterator be ! ObjectCreate(%AsyncFromSyncIteratorPrototype%, « [[SyncIteratorRecord]] »).
  // 2. Set asyncIterator.[[SyncIteratorRecord]] to syncIteratorRecord.
  const asyncIterator = new $AsyncFromSyncIterator(realm, syncIteratorRecord);

  // 3. Return ? GetIterator(asyncIterator, async).
  return $GetIterator(ctx, asyncIterator, 'async');
}

export class $AsyncFromSyncIterator extends $Object<'AsyncFromSyncIterator'> {
  public readonly '[[SyncIteratorRecord]]': $IteratorRecord;

  public constructor(
    realm: Realm,
    syncIteratorRecord: $IteratorRecord,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Let asyncIterator be ! ObjectCreate(%AsyncFromSyncIteratorPrototype%, « [[SyncIteratorRecord]] »).
    super(realm, 'AsyncFromSyncIterator', intrinsics['%AsyncFromSyncIteratorPrototype%'], CompletionType.normal, intrinsics.empty);

    // 2. Set asyncIterator.[[SyncIteratorRecord]] to syncIteratorRecord.
    this['[[SyncIteratorRecord]]'] = syncIteratorRecord;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-%iteratorprototype%-@@iterator
export class $Symbol_Iterator extends $BuiltinFunction<'[Symbol.iterator]'> {
  public constructor(
    realm: Realm,
  ) {
    super(realm, '[Symbol.iterator]', realm['[[Intrinsics]]']['%FunctionPrototype%']);
    this.SetFunctionName(realm.stack.top, new $String(realm, '[Symbol.iterator]'));
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    return thisArgument;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-%iteratorprototype%-object
export class $IteratorPrototype extends $Object<'%IteratorPrototype%'> {
  public constructor(
    realm: Realm,
  ) {
    super(realm, '%IteratorPrototype%', realm['[[Intrinsics]]']['%ObjectPrototype%'], CompletionType.normal, realm['[[Intrinsics]]'].empty);

    $DefinePropertyOrThrow(
      realm.stack.top,
      this,
      realm['[[Intrinsics]]']['@@iterator'],
      new $PropertyDescriptor(
        realm,
        realm['[[Intrinsics]]']['@@iterator'],
        {
          '[[Value]]': new $Symbol_Iterator(realm),
        },
      ),
    );
  }
}
