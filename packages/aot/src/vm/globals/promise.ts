import {
  $Object,
} from '../types/object';
import {
  $Function,
  $BuiltinFunction,
} from '../types/function';
import {
  ExecutionContext,
  Realm,
} from '../realm';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
  $AnyObject,
  CompletionType,
} from '../types/_shared';
import {
  $Undefined,
} from '../types/undefined';
import {
  $IteratorRecord,
} from './iteration';
import {
  $Error,
} from '../types/error';
import { $Call } from '../operations';

// http://www.ecma-international.org/ecma-262/#sec-promise-abstract-operations
// #region 25.6.1 Promise Abstract Operation

// http://www.ecma-international.org/ecma-262/#sec-promisecapability-records
// 25.6.1.1 PromiseCapability Records
export class $PromiseCapability {
  public readonly '[[Promise]]': $PromiseInstance | $Undefined;
  public readonly '[[Resolve]]': $Function | $Undefined;
  public readonly '[[Reject]]': $Function | $Undefined;

  public constructor(
    promise: $PromiseInstance | $Undefined,
    resolve: $Function | $Undefined,
    reject: $Function | $Undefined,
  ) {
    this['[[Promise]]'] = promise;
    this['[[Resolve]]'] = resolve;
    this['[[Reject]]'] = reject;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-ifabruptrejectpromise
// 25.6.1.1.1 IfAbruptRejectPromise ( value , capability )
export function $IfAbruptRejectPromise(
  ctx: ExecutionContext,
  value: $AnyNonEmpty ,
  capability: $PromiseCapability,
): $AnyNonEmpty  {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. If value is an abrupt completion, then
  if (value.isAbrupt) {
    // 1. a. Perform ? Call(capability.[[Reject]], undefined, « value.[[Value]] »).
    const $CallResult = $Call(ctx, capability['[[Reject]]'], intrinsics.undefined, [value]);
    if ($CallResult.isAbrupt) { return $CallResult; }

    // 1. b. Return capability.[[Promise]].
    return capability['[[Promise]]'];

  }

  // 2. Else if value is a Completion Record, set value to value.[[Value]].
  return value;
}

export const enum PromiseReactionType {
  Fulfill = 1,
  Reject = 2,
}

// http://www.ecma-international.org/ecma-262/#sec-promisereaction-records
// 25.6.1.2 PromiseReaction Records
export class $PromiseReaction {
  public readonly '[[Capability]]': $PromiseCapability | $Undefined;
  public readonly '[[Type]]': PromiseReactionType;
  public readonly '[[Handler]]': $Function | $Undefined;

  public constructor(
    capability: $PromiseCapability | $Undefined,
    type: PromiseReactionType,
    handler: $Function | $Undefined,
  ) {
    this['[[Capability]]'] = capability;
    this['[[Type]]'] = type;
    this['[[Handler]]'] = handler;
  }
}

export class $AlreadyResolved {
  public '[[Value]]': boolean = false;
}

// http://www.ecma-international.org/ecma-262/#sec-createresolvingfunctions
// 25.6.1.3 CreateResolvingFunctions ( promise )
export class $PromiseResolvingFunctions {
  public readonly '[[Resolve]]': $PromiseResolveFunction;
  public readonly '[[Reject]]': $PromiseRejectFunction;

  public constructor(
    realm: Realm,
    promise: $PromiseInstance,
  ) {
    // 1. Let alreadyResolved be a new Record { [[Value]]: false }.
    const alreadyResolved = new $AlreadyResolved();

    // 2. Let stepsResolve be the algorithm steps defined in Promise Resolve Functions (25.6.1.3.2).
    // 3. Let resolve be CreateBuiltinFunction(stepsResolve, « [[Promise]], [[AlreadyResolved]] »).
    // 4. Set resolve.[[Promise]] to promise.
    // 5. Set resolve.[[AlreadyResolved]] to alreadyResolved.
    this['[[Resolve]]'] = new $PromiseResolveFunction(realm, promise, alreadyResolved);

    // 6. Let stepsReject be the algorithm steps defined in Promise Reject Functions (25.6.1.3.1).
    // 7. Let reject be CreateBuiltinFunction(stepsReject, « [[Promise]], [[AlreadyResolved]] »).
    // 8. Set reject.[[Promise]] to promise.
    // 9. Set reject.[[AlreadyResolved]] to alreadyResolved.
    this['[[Reject]]'] = new $PromiseRejectFunction(realm, promise, alreadyResolved);

    // 10. Return a new Record { [[Resolve]]: resolve, [[Reject]]: reject }.
  }
}

// http://www.ecma-international.org/ecma-262/#sec-promise-reject-functions
// 25.6.1.3.1 Promise Reject Functions
export class $PromiseRejectFunction extends $BuiltinFunction<'PromiseRejectFunction'> {
  public '[[Promise]]': $PromiseInstance;
  public '[[AlreadyResolved]]': $AlreadyResolved;

  public constructor(
    realm: Realm,
    promise: $PromiseInstance,
    alreadyResolved: $AlreadyResolved,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'PromiseRejectFunction', intrinsics['%FunctionPrototype%']);

    this['[[Promise]]'] = promise;
    this['[[AlreadyResolved]]'] = alreadyResolved;
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let F be the active function object.
    // 2. Assert: F has a [[Promise]] internal slot whose value is an Object.
    // 3. Let promise be F.[[Promise]].
    // 4. Let alreadyResolved be F.[[AlreadyResolved]].
    // 5. If alreadyResolved.[[Value]] is true, return undefined.
    // 6. Set alreadyResolved.[[Value]] to true.
    // 7. Return RejectPromise(promise, reason).
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-promise-resolve-functions
// 25.6.1.3.2 Promise Resolve Functions
export class $PromiseResolveFunction extends $BuiltinFunction<'PromiseResolveFunction'> {
  public '[[Promise]]': $PromiseInstance;
  public '[[AlreadyResolved]]': $AlreadyResolved;

  public constructor(
    realm: Realm,
    promise: $PromiseInstance,
    alreadyResolved: $AlreadyResolved,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'PromiseResolveFunction', intrinsics['%FunctionPrototype%']);

    this['[[Promise]]'] = promise;
    this['[[AlreadyResolved]]'] = alreadyResolved;
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let F be the active function object.
    // 2. Assert: F has a [[Promise]] internal slot whose value is an Object.
    // 3. Let promise be F.[[Promise]].
    // 4. Let alreadyResolved be F.[[AlreadyResolved]].
    // 5. If alreadyResolved.[[Value]] is true, return undefined.
    // 6. Set alreadyResolved.[[Value]] to true.
    // 7. If SameValue(resolution, promise) is true, then
      // 7. a. Let selfResolutionError be a newly created TypeError object.
      // 7. b. Return RejectPromise(promise, selfResolutionError).
    // 8. If Type(resolution) is not Object, then
      // 8. a. Return FulfillPromise(promise, resolution).
    // 9. Let then be Get(resolution, "then").
    // 10. If then is an abrupt completion, then
      // 10. a. Return RejectPromise(promise, then.[[Value]]).
    // 11. Let thenAction be then.[[Value]].
    // 12. If IsCallable(thenAction) is false, then
      // 12. a. Return FulfillPromise(promise, resolution).
    // 13. Perform EnqueueJob("PromiseJobs", PromiseResolveThenableJob, « promise, resolution, thenAction »).
    // 14. Return undefined.
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-fulfillpromise
// 25.6.1.4 FulfillPromise ( promise , value )
export function $FulfillPromise(
  ctx: ExecutionContext,
  promise: $PromiseInstance,
  value: $AnyNonEmpty,
) {
  // 1. Assert: The value of promise.[[PromiseState]] is "pending".
  // 2. Let reactions be promise.[[PromiseFulfillReactions]].
  // 3. Set promise.[[PromiseResult]] to value.
  // 4. Set promise.[[PromiseFulfillReactions]] to undefined.
  // 5. Set promise.[[PromiseRejectReactions]] to undefined.
  // 6. Set promise.[[PromiseState]] to "fulfilled".
  // 7. Return TriggerPromiseReactions(reactions, value).
  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-newpromisecapability
// 25.6.1.5 NewPromiseCapability ( C )
export function $NewPromiseCapability(
  ctx: ExecutionContext,
  C: $Function,
) {
  // 1. If IsConstructor(C) is false, throw a TypeError exception.
  // 2. NOTE: C is assumed to be a constructor function that supports the parameter conventions of the Promise constructor (see 25.6.3.1).
  // 3. Let promiseCapability be a new PromiseCapability { [[Promise]]: undefined, [[Resolve]]: undefined, [[Reject]]: undefined }.
  // 4. Let steps be the algorithm steps defined in GetCapabilitiesExecutor Functions.
  // 5. Let executor be CreateBuiltinFunction(steps, « [[Capability]] »).
  // 6. Set executor.[[Capability]] to promiseCapability.
  // 7. Let promise be ? Construct(C, « executor »).
  // 8. If IsCallable(promiseCapability.[[Resolve]]) is false, throw a TypeError exception.
  // 9. If IsCallable(promiseCapability.[[Reject]]) is false, throw a TypeError exception.
  // 10. Set promiseCapability.[[Promise]] to promise.
  // 11. Return promiseCapability.
  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-getcapabilitiesexecutor-functions
// 25.6.1.5.1 GetCapabilitiesExecutor Functions
export class $GetCapabilitiesExecutor extends $BuiltinFunction<'GetCapabilitiesExecutor'> {
  public '[[Capability]]': $PromiseCapability;

  public constructor(
    realm: Realm,
    capability: $PromiseCapability,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'GetCapabilitiesExecutor', intrinsics['%FunctionPrototype%']);

    this['[[Capability]]'] = capability;
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let F be the active function object.
    // 2. Assert: F has a [[Capability]] internal slot whose value is a PromiseCapability Record.
    // 3. Let promiseCapability be F.[[Capability]].
    // 4. If promiseCapability.[[Resolve]] is not undefined, throw a TypeError exception.
    // 5. If promiseCapability.[[Reject]] is not undefined, throw a TypeError exception.
    // 6. Set promiseCapability.[[Resolve]] to resolve.
    // 7. Set promiseCapability.[[Reject]] to reject.
    // 8. Return undefined.
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-rejectpromise
// 25.6.1.7 RejectPromise ( promise , reason )
export function $RejectPromise(
  ctx: ExecutionContext,
  promise: $PromiseInstance,
  reason: $AnyNonEmpty,
) {
  // 1. Assert: The value of promise.[[PromiseState]] is "pending".
  // 2. Let reactions be promise.[[PromiseRejectReactions]].
  // 3. Set promise.[[PromiseResult]] to reason.
  // 4. Set promise.[[PromiseFulfillReactions]] to undefined.
  // 5. Set promise.[[PromiseRejectReactions]] to undefined.
  // 6. Set promise.[[PromiseState]] to "rejected".
  // 7. If promise.[[PromiseIsHandled]] is false, perform HostPromiseRejectionTracker(promise, "reject").
  // 8. Return TriggerPromiseReactions(reactions, reason).
  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-triggerpromisereactions
// 25.6.1.8 TriggerPromiseReactions ( reactions , argument )
export function $TriggerPromiseReactions(
  ctx: ExecutionContext,
  reactions: readonly $PromiseReaction[],
  argument: $AnyNonEmpty,
) {
  // 1. For each reaction in reactions, in original insertion order, do
    // 1. a. Perform EnqueueJob("PromiseJobs", PromiseReactionJob, « reaction, argument »).
  // 2. Return undefined.
  throw new Error('Method not implemented.');
}

export const enum PromiseRejectionOperation {
  reject = 1,
  handle = 2,
}

// http://www.ecma-international.org/ecma-262/#sec-host-promise-rejection-tracker
// 25.6.1.9 HostPromiseRejectionTracker ( promise , operation )
export function $HostPromiseRejectionTracker(
  ctx: ExecutionContext,
  promise: $PromiseInstance,
  operation: PromiseRejectionOperation,
) {
  throw new Error('Method not implemented.');
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-promise-jobs
// 25.6.2 Promise Jobs

  // http://www.ecma-international.org/ecma-262/#sec-promisereactionjob
  // 25.6.2.1 PromiseReactionJob ( reaction , argument )

    // 1. Assert: reaction is a PromiseReaction Record.
    // 2. Let promiseCapability be reaction.[[Capability]].
    // 3. Let type be reaction.[[Type]].
    // 4. Let handler be reaction.[[Handler]].
    // 5. If handler is undefined, then
      // 5. a. If type is "Fulfill", let handlerResult be NormalCompletion(argument).
      // 5. b. Else,
        // 5. b. i. Assert: type is "Reject".
        // 5. b. ii. Let handlerResult be ThrowCompletion(argument).
    // 6. Else, let handlerResult be Call(handler, undefined, « argument »).
    // 7. If promiseCapability is undefined, then
      // 7. a. Assert: handlerResult is not an abrupt completion.
      // 7. b. Return NormalCompletion(empty).
    // 8. If handlerResult is an abrupt completion, then
      // 8. a. Let status be Call(promiseCapability.[[Reject]], undefined, « handlerResult.[[Value]] »).
    // 9. Else,
      // 9. a. Let status be Call(promiseCapability.[[Resolve]], undefined, « handlerResult.[[Value]] »).
    // 10. Return Completion(status).

  // http://www.ecma-international.org/ecma-262/#sec-promiseresolvethenablejob
  // 25.6.2.2 PromiseResolveThenableJob ( promiseToResolve , thenable , then )

    // 1. Let resolvingFunctions be CreateResolvingFunctions(promiseToResolve).
    // 2. Let thenCallResult be Call(then, thenable, « resolvingFunctions.[[Resolve]], resolvingFunctions.[[Reject]] »).
    // 3. If thenCallResult is an abrupt completion, then
      // 3. a. Let status be Call(resolvingFunctions.[[Reject]], undefined, « thenCallResult.[[Value]] »).
      // 3. b. Return Completion(status).
    // 4. Return Completion(thenCallResult).

// http://www.ecma-international.org/ecma-262/#sec-promise-constructor
// #region 25.6.3 The Promise Constructor
export class $PromiseConstructor extends $BuiltinFunction<'%Promise%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Promise%', intrinsics['%FunctionPrototype%']);
  }

  // http://www.ecma-international.org/ecma-262/#sec-promise-executor
  // 25.6.3.1 Promise ( executor )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty {
    // 1. If NewTarget is undefined, throw a TypeError exception.
    // 2. If IsCallable(executor) is false, throw a TypeError exception.
    // 3. Let promise be ? OrdinaryCreateFromConstructor(NewTarget, "%PromisePrototype%", « [[PromiseState]], [[PromiseResult]], [[PromiseFulfillReactions]], [[PromiseRejectReactions]], [[PromiseIsHandled]] »).
    // 4. Set promise.[[PromiseState]] to "pending".
    // 5. Set promise.[[PromiseFulfillReactions]] to a new empty List.
    // 6. Set promise.[[PromiseRejectReactions]] to a new empty List.
    // 7. Set promise.[[PromiseIsHandled]] to false.
    // 8. Let resolvingFunctions be CreateResolvingFunctions(promise).
    // 9. Let completion be Call(executor, undefined, « resolvingFunctions.[[Resolve]], resolvingFunctions.[[Reject]] »).
    // 10. If completion is an abrupt completion, then
      // 10. a. Perform ? Call(resolvingFunctions.[[Reject]], undefined, « completion.[[Value]] »).
    // 11. Return promise.
    throw new Error('Method not implemented.');
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-promise-constructor
// #region 25.6.4 Properties of the Promise Constructor

// http://www.ecma-international.org/ecma-262/#sec-promise.all
// 25.6.4.1 Promise.all ( iterable )
export class $Promise_all extends $BuiltinFunction<'%Promise_all%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Promise_all%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let C be the this value.
    // 2. If Type(C) is not Object, throw a TypeError exception.
    // 3. Let promiseCapability be ? NewPromiseCapability(C).
    // 4. Let iteratorRecord be GetIterator(iterable).
    // 5. IfAbruptRejectPromise(iteratorRecord, promiseCapability).
    // 6. Let result be PerformPromiseAll(iteratorRecord, C, promiseCapability).
    // 7. If result is an abrupt completion, then
      // 7. a. If iteratorRecord.[[Done]] is false, set result to IteratorClose(iteratorRecord, result).
      // 7. b. IfAbruptRejectPromise(result, promiseCapability).
    // 8. Return Completion(result).
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-performpromiseall
// 25.6.4.1.1 Runtime Semantics: PerformPromiseAll ( iteratorRecord , constructor , resultCapability )

  // 1. Assert: IsConstructor(constructor) is true.
  // 2. Assert: resultCapability is a PromiseCapability Record.
  // 3. Let values be a new empty List.
  // 4. Let remainingElementsCount be a new Record { [[Value]]: 1 }.
  // 5. Let index be 0.
  // 6. Repeat,
    // 6. a. Let next be IteratorStep(iteratorRecord).
    // 6. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
    // 6. c. ReturnIfAbrupt(next).
    // 6. d. If next is false, then
      // 6. d. i. Set iteratorRecord.[[Done]] to true.
      // 6. d. ii. Set remainingElementsCount.[[Value]] to remainingElementsCount.[[Value]] - 1.
      // 6. d. iii. If remainingElementsCount.[[Value]] is 0, then
        // 6. d. iii. 1. Let valuesArray be CreateArrayFromList(values).
        // 6. d. iii. 2. Perform ? Call(resultCapability.[[Resolve]], undefined, « valuesArray »).
      // 6. d. iv. Return resultCapability.[[Promise]].
    // 6. e. Let nextValue be IteratorValue(next).
    // 6. f. If nextValue is an abrupt completion, set iteratorRecord.[[Done]] to true.
    // 6. g. ReturnIfAbrupt(nextValue).
    // 6. h. Append undefined to values.
    // 6. i. Let nextPromise be ? Invoke(constructor, "resolve", « nextValue »).
    // 6. j. Let steps be the algorithm steps defined in Promise.all Resolve Element Functions.
    // 6. k. Let resolveElement be CreateBuiltinFunction(steps, « [[AlreadyCalled]], [[Index]], [[Values]], [[Capability]], [[RemainingElements]] »).
    // 6. l. Set resolveElement.[[AlreadyCalled]] to a new Record { [[Value]]: false }.
    // 6. m. Set resolveElement.[[Index]] to index.
    // 6. n. Set resolveElement.[[Values]] to values.
    // 6. o. Set resolveElement.[[Capability]] to resultCapability.
    // 6. p. Set resolveElement.[[RemainingElements]] to remainingElementsCount.
    // 6. q. Set remainingElementsCount.[[Value]] to remainingElementsCount.[[Value]] + 1.
    // 6. r. Perform ? Invoke(nextPromise, "then", « resolveElement, resultCapability.[[Reject]] »).
    // 6. s. Increase index by 1.

// http://www.ecma-international.org/ecma-262/#sec-promise.all-resolve-element-functions
// 25.6.4.1.2 Promise.all Resolve Element Functions

  // 1. Let F be the active function object.
  // 2. Let alreadyCalled be F.[[AlreadyCalled]].
  // 3. If alreadyCalled.[[Value]] is true, return undefined.
  // 4. Set alreadyCalled.[[Value]] to true.
  // 5. Let index be F.[[Index]].
  // 6. Let values be F.[[Values]].
  // 7. Let promiseCapability be F.[[Capability]].
  // 8. Let remainingElementsCount be F.[[RemainingElements]].
  // 9. Set values[index] to x.
  // 10. Set remainingElementsCount.[[Value]] to remainingElementsCount.[[Value]] - 1.
  // 11. If remainingElementsCount.[[Value]] is 0, then
    // 11. a. Let valuesArray be CreateArrayFromList(values).
    // 11. b. Return ? Call(promiseCapability.[[Resolve]], undefined, « valuesArray »).
  // 12. Return undefined.

// http://www.ecma-international.org/ecma-262/#sec-promise.prototype
// 25.6.4.2 Promise.prototype

// http://www.ecma-international.org/ecma-262/#sec-promise.race
// 25.6.4.3 Promise.race ( iterable )
export class $Promise_race extends $BuiltinFunction<'%Promise_race%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Promise_race%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let C be the this value.
    // 2. If Type(C) is not Object, throw a TypeError exception.
    // 3. Let promiseCapability be ? NewPromiseCapability(C).
    // 4. Let iteratorRecord be GetIterator(iterable).
    // 5. IfAbruptRejectPromise(iteratorRecord, promiseCapability).
    // 6. Let result be PerformPromiseAll(iteratorRecord, C, promiseCapability).
    // 7. If result is an abrupt completion, then
      // 7. a. If iteratorRecord.[[Done]] is false, set result to IteratorClose(iteratorRecord, result).
      // 7. b. IfAbruptRejectPromise(result, promiseCapability).
    // 8. Return Completion(result).
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-performpromiserace
// 25.6.4.3.1 Runtime Semantics: PerformPromiseRace ( iteratorRecord , constructor , resultCapability )
export function $PerformPromiseRace(
  ctx: ExecutionContext,
  iteratorRecord: $IteratorRecord,
  constructor: $Function,
  resultCapability: $PromiseCapability,
): $AnyNonEmpty {
  // 1. Assert: IsConstructor(constructor) is true.
  // 2. Assert: resultCapability is a PromiseCapability Record.
  // 3. Repeat,
    // 3. a. Let next be IteratorStep(iteratorRecord).
    // 3. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
    // 3. c. ReturnIfAbrupt(next).
    // 3. d. If next is false, then
      // 3. d. i. Set iteratorRecord.[[Done]] to true.
      // 3. d. ii. Return resultCapability.[[Promise]].
    // 3. e. Let nextValue be IteratorValue(next).
    // 3. f. If nextValue is an abrupt completion, set iteratorRecord.[[Done]] to true.
    // 3. g. ReturnIfAbrupt(nextValue).
    // 3. h. Let nextPromise be ? Invoke(constructor, "resolve", « nextValue »).
    // 3. i. Perform ? Invoke(nextPromise, "then", « resultCapability.[[Resolve]], resultCapability.[[Reject]] »).
  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-promise.reject
// 25.6.4.4 Promise.reject ( r )
export class $Promise_reject extends $BuiltinFunction<'%Promise_reject%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Promise_reject%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let C be the this value.
    // 2. If Type(C) is not Object, throw a TypeError exception.
    // 3. Let promiseCapability be ? NewPromiseCapability(C).
    // 4. Perform ? Call(promiseCapability.[[Reject]], undefined, « r »).
    // 5. Return promiseCapability.[[Promise]].
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-promise.resolve
// 25.6.4.5 Promise.resolve ( x )
export class $Promise_resolve extends $BuiltinFunction<'%Promise_resolve%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Promise_resolve%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let C be the this value.
    // 2. If Type(C) is not Object, throw a TypeError exception.
    // 3. Return ? PromiseResolve(C, x).


    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-promise-resolve
// 25.6.4.5.1 PromiseResolve ( C , x )
export function $PromiseResolve(
  ctx: ExecutionContext,
  C: $AnyObject,
  x: $AnyNonEmpty,
): $PromiseInstance {
  // 1. Assert: Type(C) is Object.
  // 2. If IsPromise(x) is true, then
    // 2. a. Let xConstructor be ? Get(x, "constructor").
    // 2. b. If SameValue(xConstructor, C) is true, return x.
  // 3. Let promiseCapability be ? NewPromiseCapability(C).
  // 4. Perform ? Call(promiseCapability.[[Resolve]], undefined, « x »).
  // 5. Return promiseCapability.[[Promise]].
  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-get-promise-@@species
// 25.6.4.6 get Promise [ @@species ]

  // 1. Return the this value.

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-promise-prototype-object
// #region 25.6.5 Properties of the Promise Prototype Object

// http://www.ecma-international.org/ecma-262/#sec-promise.prototype.constructor
// 25.6.5.2 Promise.prototype.constructor

// http://www.ecma-international.org/ecma-262/#sec-promise.prototype-@@tostringtag
// 25.6.5.5 Promise.prototype [ @@toStringTag ]

export class $PromisePrototype extends $Object<'%PromisePrototype%'> {

}

// http://www.ecma-international.org/ecma-262/#sec-promise.prototype.catch
// 25.6.5.1 Promise.prototype.catch ( onRejected )
export class $PromiseProto_catch extends $BuiltinFunction<'%PromiseProto_catch%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%PromiseProto_catch%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let promise be the this value.
    // 2. Return ? Invoke(promise, "then", « undefined, onRejected »).
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-promise.prototype.finally
// 25.6.5.3 Promise.prototype.finally ( onFinally )
export class $PromiseProto_finally extends $BuiltinFunction<'%PromiseProto_finally%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%PromiseProto_finally%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let promise be the this value.
    // 2. If Type(promise) is not Object, throw a TypeError exception.
    // 3. Let C be ? SpeciesConstructor(promise, %Promise%).
    // 4. Assert: IsConstructor(C) is true.
    // 5. If IsCallable(onFinally) is false, then
      // 5. a. Let thenFinally be onFinally.
      // 5. b. Let catchFinally be onFinally.
    // 6. Else,
      // 6. a. Let stepsThenFinally be the algorithm steps defined in Then Finally Functions.
      // 6. b. Let thenFinally be CreateBuiltinFunction(stepsThenFinally, « [[Constructor]], [[OnFinally]] »).
      // 6. c. Set thenFinally.[[Constructor]] to C.
      // 6. d. Set thenFinally.[[OnFinally]] to onFinally.
      // 6. e. Let stepsCatchFinally be the algorithm steps defined in Catch Finally Functions.
      // 6. f. Let catchFinally be CreateBuiltinFunction(stepsCatchFinally, « [[Constructor]], [[OnFinally]] »).
      // 6. g. Set catchFinally.[[Constructor]] to C.
      // 6. h. Set catchFinally.[[OnFinally]] to onFinally.
    // 7. Return ? Invoke(promise, "then", « thenFinally, catchFinally »).
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-thenfinallyfunctions
// 25.6.5.3.1 Then Finally Functions

  // 1. Let F be the active function object.
  // 2. Let onFinally be F.[[OnFinally]].
  // 3. Assert: IsCallable(onFinally) is true.
  // 4. Let result be ? Call(onFinally, undefined).
  // 5. Let C be F.[[Constructor]].
  // 6. Assert: IsConstructor(C) is true.
  // 7. Let promise be ? PromiseResolve(C, result).
  // 8. Let valueThunk be equivalent to a function that returns value.
  // 9. Return ? Invoke(promise, "then", « valueThunk »).

// http://www.ecma-international.org/ecma-262/#sec-catchfinallyfunctions
// 25.6.5.3.2 Catch Finally Functions

  // 1. Let F be the active function object.
  // 2. Let onFinally be F.[[OnFinally]].
  // 3. Assert: IsCallable(onFinally) is true.
  // 4. Let result be ? Call(onFinally, undefined).
  // 5. Let C be F.[[Constructor]].
  // 6. Assert: IsConstructor(C) is true.
  // 7. Let promise be ? PromiseResolve(C, result).
  // 8. Let thrower be equivalent to a function that throws reason.
  // 9. Return ? Invoke(promise, "then", « thrower »).

// http://www.ecma-international.org/ecma-262/#sec-promise.prototype.then
// 25.6.5.4 Promise.prototype.then ( onFulfilled , onRejected )
export class $PromiseProto_then extends $BuiltinFunction<'%PromiseProto_then%'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%PromiseProto_then%', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty  {
    // 1. Let promise be the this value.
    // 2. If IsPromise(promise) is false, throw a TypeError exception.
    // 3. Let C be ? SpeciesConstructor(promise, %Promise%).
    // 4. Let resultCapability be ? NewPromiseCapability(C).
    // 5. Return PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability).
    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-performpromisethen
// 25.6.5.4.1 PerformPromiseThen ( promise , onFulfilled , onRejected [ , resultCapability ] )
export function $PerformPromiseThen(
  ctx: ExecutionContext,
  promise: $PromiseInstance,
  onFulfilled: $AnyNonEmpty,
  onRejected: $AnyNonEmpty,
  resultCapability?: $PromiseCapability,
): $PromiseInstance | $Undefined {
  // 1. Assert: IsPromise(promise) is true.
  // 2. If resultCapability is present, then
    // 2. a. Assert: resultCapability is a PromiseCapability Record.
  // 3. Else,
    // 3. a. Set resultCapability to undefined.
  // 4. If IsCallable(onFulfilled) is false, then
    // 4. a. Set onFulfilled to undefined.
  // 5. If IsCallable(onRejected) is false, then
    // 5. a. Set onRejected to undefined.
  // 6. Let fulfillReaction be the PromiseReaction { [[Capability]]: resultCapability, [[Type]]: "Fulfill", [[Handler]]: onFulfilled }.
  // 7. Let rejectReaction be the PromiseReaction { [[Capability]]: resultCapability, [[Type]]: "Reject", [[Handler]]: onRejected }.
  // 8. If promise.[[PromiseState]] is "pending", then
    // 8. a. Append fulfillReaction as the last element of the List that is promise.[[PromiseFulfillReactions]].
    // 8. b. Append rejectReaction as the last element of the List that is promise.[[PromiseRejectReactions]].
  // 9. Else if promise.[[PromiseState]] is "fulfilled", then
    // 9. a. Let value be promise.[[PromiseResult]].
    // 9. b. Perform EnqueueJob("PromiseJobs", PromiseReactionJob, « fulfillReaction, value »).
  // 10. Else,
    // 10. a. Assert: The value of promise.[[PromiseState]] is "rejected".
    // 10. b. Let reason be promise.[[PromiseResult]].
    // 10. c. If promise.[[PromiseIsHandled]] is false, perform HostPromiseRejectionTracker(promise, "handle").
    // 10. d. Perform EnqueueJob("PromiseJobs", PromiseReactionJob, « rejectReaction, reason »).
  // 11. Set promise.[[PromiseIsHandled]] to true.
  // 12. If resultCapability is undefined, then
    // 12. a. Return undefined.
  // 13. Else,
    // 13. a. Return resultCapability.[[Promise]].
  throw new Error('Method not implemented.');
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-promise-instances
// #region 25.6.6 Properties of Promise Instances

export const enum PromiseState {
  pending = 1,
  fulfilled = 2,
  rejected = 3,
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-promise-instances
// 25.6.6 Properties of Promise Instances
export class $PromiseInstance extends $Object<'PromiseInstance'> {
  public '[[PromiseState]]': PromiseState;
  public '[[PromiseResult]]': $AnyNonEmpty | null;
  public '[[PromiseFulfillReactions]]': $PromiseReaction[];
  public '[[PromiseRejectReactions]]': $PromiseReaction[];
  public '[[PromiseIsHandled]]': boolean;

  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'PromiseInstance', intrinsics['%PromisePrototype%'], CompletionType.normal, intrinsics.empty);
  }
}

// #endregion
