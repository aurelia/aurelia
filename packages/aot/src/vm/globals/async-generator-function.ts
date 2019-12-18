import {
  $BuiltinFunction,
  $Function,
} from '../types/function';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
  CompletionType,
  $Any,
} from '../types/_shared';
import {
  $Error,
  $TypeError,
} from '../types/error';
import {
  $Undefined,
} from '../types/undefined';
import {
  $Object,
} from '../types/object';
import {
  $String,
} from '../types/string';
import {
  FunctionKind,
} from '../ast/_shared';
import {
  $CreateDynamicFunction,
  $FunctionPrototype,
  $FunctionConstructor,
} from './function';
import {
  $IteratorPrototype,
  $CreateIterResultObject,
} from './iteration';
import {
  $Number,
} from '../types/number';
import {
  $Block,
} from '../ast/statements';
import {
  $List,
} from '../types/list';
import {
  $PromiseCapability,
  $PromiseResolve,
  $PerformPromiseThen,
  $NewPromiseCapability,
  $PromiseInstance,
} from './promise';
import {
  $Boolean,
} from '../types/boolean';
import {
  $Call,
} from '../operations';
import {
  $Await,
} from '../types/await';

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-objects
// 25.3 AsyncGeneratorFunction Objects

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-constructor
// #region 25.3.1 The AsyncGeneratorFunction Constructor
export class $AsyncGeneratorFunctionConstructor extends $BuiltinFunction<'%AsyncGeneratorFunction%'> {
  // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-prototype
  // 25.3.2.2 AsyncGeneratorFunction.prototype
  public get $prototype(): $AsyncGeneratorFunctionPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $AsyncGeneratorFunctionPrototype;
  }
  public set $prototype(value: $AsyncGeneratorFunctionPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-length
  // 25.3.2.1 AsyncGeneratorFunction.length
  public get length(): $Number<1> {
    return this.getProperty(this.realm['[[Intrinsics]]'].length)['[[Value]]'] as $Number<1>;
  }
  public set length(value: $Number<1>) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].length, value, false, false, true);
  }

  public constructor(
    realm: Realm,
    functionConstructor: $FunctionConstructor,
  ) {
    super(realm, '%AsyncGeneratorFunction%', functionConstructor);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction
  // 25.3.1.1 AsyncGeneratorFunction ( p1 , p2 , ..., pn , body )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    // 1. Let C be the active function object.
    // 2. Let args be the argumentsList that was passed to this function by [[Call]] or [[Construct]].
    // 3. Return ? CreateDynamicFunction(C, NewTarget, "async generator", args).
    return $CreateDynamicFunction(ctx, this, NewTarget, FunctionKind.asyncGenerator, argumentsList);
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-asyncgeneratorfunction-prototype
// #region 25.3.3 Properties of the AsyncGeneratorFunction Prototype Object
export class $AsyncGeneratorFunctionPrototype extends $Object<'%AsyncGenerator%'> {
  // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-prototype-constructor
  // 25.3.3.1 AsyncGeneratorFunction.prototype.constructor
  public get $constructor(): $AsyncGeneratorFunctionConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $AsyncGeneratorFunctionConstructor;
  }
  public set $constructor(value: $AsyncGeneratorFunctionConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-prototype-prototype
  // 25.3.3.2 AsyncGeneratorFunction.prototype.prototype
  public get $prototype(): $AsyncGeneratorPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $AsyncGeneratorPrototype;
  }
  public set $prototype(value: $AsyncGeneratorPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-prototype-tostringtag
  // 25.3.3.3 AsyncGeneratorFunction.prototype [ @@toStringTag ]
  public get '@@toStringTag'(): $String<'AsyncGeneratorFunction'> {
    return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'] as $String<'AsyncGeneratorFunction'>;
  }
  public set '@@toStringTag'(value: $String<'AsyncGeneratorFunction'>) {
    this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%AsyncGenerator%', functionPrototype, CompletionType.normal, intrinsics.empty);
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-instances
// #region 25.3.4 AsyncGeneratorFunction Instances

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-instance-length
// 25.3.4.1 length

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-instance-name
// 25.3.4.2 name

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunction-instance-prototype
// 25.3.4.3 prototype

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-objects
// 25.5 AsyncGenerator Objects

// http://www.ecma-international.org/ecma-262/#sec-properties-of-asyncgenerator-prototype
// #region 25.5.1 Properties of the AsyncGenerator Prototype Object
export class $AsyncGeneratorPrototype extends $Object<'%AsyncGeneratorPrototype%'> {
  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-constructor
  // 25.5.1.1 AsyncGenerator.prototype.constructor
  public get $constructor(): $AsyncGeneratorFunctionPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $AsyncGeneratorFunctionPrototype;
  }
  public set $constructor(value: $AsyncGeneratorFunctionPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-next
  // 25.5.1.2 AsyncGenerator.prototype.next ( value )
  public get next(): $AsyncGeneratorPrototype_next {
    return this.getProperty(this.realm['[[Intrinsics]]'].next)['[[Value]]'] as $AsyncGeneratorPrototype_next;
  }
  public set next(value: $AsyncGeneratorPrototype_next) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].next, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-return
  // 25.5.1.3 AsyncGenerator.prototype.return ( value )
  public get return(): $AsyncGeneratorPrototype_return {
    return this.getProperty(this.realm['[[Intrinsics]]'].return)['[[Value]]'] as $AsyncGeneratorPrototype_return;
  }
  public set return(value: $AsyncGeneratorPrototype_return) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].return, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-throw
  // 25.5.1.4 AsyncGenerator.prototype.throw ( exception )
  public get throw(): $AsyncGeneratorPrototype_throw {
    return this.getProperty(this.realm['[[Intrinsics]]'].throw)['[[Value]]'] as $AsyncGeneratorPrototype_throw;
  }
  public set throw(value: $AsyncGeneratorPrototype_throw) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].throw, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-tostringtag
  // 25.5.1.5 AsyncGenerator.prototype [ @@toStringTag ]
  public get '@@toStringTag'(): $String<'AsyncGenerator'> {
    return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'] as $String<'AsyncGenerator'>;
  }
  public set '@@toStringTag'(value: $String<'AsyncGenerator'>) {
    this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
  }

  public constructor(
    realm: Realm,
    iteratorPrototype: $IteratorPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%AsyncGeneratorPrototype%', iteratorPrototype, CompletionType.normal, intrinsics.empty);
  }
}

export class $AsyncGeneratorPrototype_next extends $BuiltinFunction<'AsyncGenerator.prototype.next'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'AsyncGenerator.prototype.next', proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-next
  // 25.5.1.2 AsyncGenerator.prototype.next ( value )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (value === void 0) {
      value = intrinsics.undefined;
    }

    // 1. Let generator be the this value.
    const generator = thisArgument as $AsyncGeneratorInstance;

    // 2. Let completion be NormalCompletion(value).
    const completion = value;

    // 3. Return ! AsyncGeneratorEnqueue(generator, completion).
    return $AsyncGeneratorEnqueue(ctx, generator, completion);
  }
}

export class $AsyncGeneratorPrototype_return extends $BuiltinFunction<'AsyncGenerator.prototype.return'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'AsyncGenerator.prototype.return', proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-return
  // 25.5.1.3 AsyncGenerator.prototype.return ( value )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (value === void 0) {
      value = intrinsics.undefined;
    }

    // 1. Let generator be the this value.
    const generator = thisArgument as $AsyncGeneratorInstance;

    // 2. Let completion be Completion { [[Type]]: return, [[Value]]: value, [[Target]]: empty }.
    const completion = value.ToCompletion(CompletionType.return, intrinsics.empty);

    // 3. Return ! AsyncGeneratorEnqueue(generator, completion).
    return $AsyncGeneratorEnqueue(ctx, generator, completion);
  }
}

export class $AsyncGeneratorPrototype_throw extends $BuiltinFunction<'AsyncGenerator.prototype.throw'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'AsyncGenerator.prototype.throw', proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-prototype-throw
  // 25.5.1.4 AsyncGenerator.prototype.throw ( exception )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [exception]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (exception === void 0) {
      exception = intrinsics.undefined;
    }

    // 1. Let generator be the this value.
    const generator = thisArgument as $AsyncGeneratorInstance;

    // 2. Let completion be ThrowCompletion(exception).
    const completion = exception.ToCompletion(CompletionType.throw, intrinsics.empty);

    // 3. Return ! AsyncGeneratorEnqueue(generator, completion).
    return $AsyncGeneratorEnqueue(ctx, generator, completion);
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-asyncgenerator-intances
// #region 25.5.2 Properties of AsyncGenerator Instances
export const enum AsyncGeneratorState {
  none           = 0,
  suspendedStart = 1,
  suspendedYield = 2,
  executing      = 3,
  awaitingReturn = 4,
  completed      = 5,
}

export class $AsyncGeneratorInstance extends $Object<'AsyncGeneratorInstance'> {
  public '[[AsyncGeneratorState]]': AsyncGeneratorState;
  public '[[AsyncGeneratorContext]]': ExecutionContext | undefined;
  public '[[AsyncGeneratorQueue]]': $List<$AsyncGeneratorRequest>;

  public constructor(
    realm: Realm,
    proto: $AsyncGeneratorPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'AsyncGeneratorInstance', proto, CompletionType.normal, intrinsics.empty);

    this['[[AsyncGeneratorState]]'] = AsyncGeneratorState.none;
    this['[[AsyncGeneratorContext]]'] = void 0;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgenerator-abstract-operations
// 25.5.3 AsyncGenerator Abstract Operations

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorrequest-records
// 25.5.3.1 AsyncGeneratorRequest Records
export class $AsyncGeneratorRequest {
  public readonly '[[Completion]]': $Any;
  public readonly '[[Capability]]': $PromiseCapability;

  public constructor(
    completion: $Any,
    capability: $PromiseCapability,
  ) {
    this['[[Completion]]'] = completion;
    this['[[Capability]]'] = capability;
  }

  public is(other: $AsyncGeneratorRequest): boolean {
    return this === other;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorstart
// 25.5.3.2 AsyncGeneratorStart ( generator , generatorBody )
export function $AsyncGeneratorStart(
  ctx: ExecutionContext,
  generator: $AsyncGeneratorInstance,
  generatorBody: $Block,
): $Undefined {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];
  const stack = realm.stack;

  // 1. Assert: generator is an AsyncGenerator instance.
  // 2. Assert: generator.[[AsyncGeneratorState]] is undefined.
  // 3. Let genContext be the running execution context.
  const genContext = ctx;

  // 4. Set the Generator component of genContext to generator.
  genContext.Generator = generator;

  // 5. Set the code evaluation state of genContext such that when evaluation is resumed for that execution context the following steps will be performed:
  genContext.onResume = function (resumptionValue: $AnyNonEmpty): $AnyNonEmpty  { // TODO: do we need to do something with resumptionValue?
    // 5. a. Let result be the result of evaluating generatorBody.
    const result = generatorBody.Evaluate(genContext) as $AnyNonEmpty;

    // 5. b. Assert: If we return here, the async generator either threw an exception or performed either an implicit or explicit return.
    // 5. c. Remove genContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
    stack.pop();

    // 5. d. Set generator.[[AsyncGeneratorState]] to "completed".
    generator['[[AsyncGeneratorState]]'] = AsyncGeneratorState.completed;

    let resultValue: $AnyNonEmpty;
    // 5. e. If result is a normal completion, let resultValue be undefined.
    if (result['[[Type]]'] === CompletionType.normal) {
      resultValue = intrinsics.undefined;
    }
    // 5. f. Else,
    else {
      // 5. f. i. Let resultValue be result.[[Value]].
      resultValue = result;

      // 5. f. ii. If result.[[Type]] is not return, then
      if (result['[[Type]]'] !== CompletionType.return) {
        // 5. f. ii. 1. Return ! AsyncGeneratorReject(generator, resultValue).
        return $AsyncGeneratorReject(ctx, generator, resultValue as $Error);
      }
    }

    // 5. g. Return ! AsyncGeneratorResolve(generator, resultValue, true).
    return $AsyncGeneratorResolve(ctx, generator, resultValue, intrinsics.true);
  };

  // 6. Set generator.[[AsyncGeneratorContext]] to genContext.
  generator['[[AsyncGeneratorContext]]'] = genContext;

  // 7. Set generator.[[AsyncGeneratorState]] to "suspendedStart".
  generator['[[AsyncGeneratorState]]'] = AsyncGeneratorState.suspendedStart;

  // 8. Set generator.[[AsyncGeneratorQueue]] to a new empty List.
  generator['[[AsyncGeneratorQueue]]'] = new $List();

  // 9. Return undefined.
  return intrinsics.undefined;
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorresolve
// 25.5.3.3 AsyncGeneratorResolve ( generator , value , done )
export function $AsyncGeneratorResolve(
  ctx: ExecutionContext,
  generator: $AsyncGeneratorInstance,
  value: $AnyNonEmpty,
  done: $Boolean,
): $Undefined {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: generator is an AsyncGenerator instance.
  // 2. Let queue be generator.[[AsyncGeneratorQueue]].
  const queue = generator['[[AsyncGeneratorQueue]]'];

  // 3. Assert: queue is not an empty List.
  // 4. Remove the first element from queue and let next be the value of that element.
  const next = queue.shift()!;

  // 5. Let promiseCapability be next.[[Capability]].
  const promiseCapability = next['[[Capability]]'];

  // 6. Let iteratorResult be ! CreateIterResultObject(value, done).
  const iteratorResult = $CreateIterResultObject(ctx, value, done);

  // 7. Perform ! Call(promiseCapability.[[Resolve]], undefined, « iteratorResult »).
  $Call(ctx, promiseCapability['[[Resolve]]'], intrinsics.undefined, new $List(iteratorResult));

  // 8. Perform ! AsyncGeneratorResumeNext(generator).
  $AsyncGeneratorResumeNext(ctx, generator);

  // 9. Return undefined.
  return intrinsics.undefined;
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorreject
// 25.5.3.4 AsyncGeneratorReject ( generator , exception )
export function $AsyncGeneratorReject(
  ctx: ExecutionContext,
  generator: $AsyncGeneratorInstance,
  exception: $Error,
): $Undefined {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: generator is an AsyncGenerator instance.
  // 2. Let queue be generator.[[AsyncGeneratorQueue]].
  const queue = generator['[[AsyncGeneratorQueue]]'];

  // 3. Assert: queue is not an empty List.
  // 4. Remove the first element from queue and let next be the value of that element.
  const next = queue.shift()!;

  // 5. Let promiseCapability be next.[[Capability]].
  const promiseCapability = next['[[Capability]]'];

  // 6. Perform ! Call(promiseCapability.[[Reject]], undefined, « exception »).
  $Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new $List(exception));

  // 7. Perform ! AsyncGeneratorResumeNext(generator).
  $AsyncGeneratorResumeNext(ctx, generator);

  // 8. Return undefined.
  return intrinsics.undefined;
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorresumenext
// 25.5.3.5 AsyncGeneratorResumeNext ( generator )
export function $AsyncGeneratorResumeNext(
  ctx: ExecutionContext,
  generator: $AsyncGeneratorInstance,
): $Undefined | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];
  const stack = realm.stack;

  // 1. Assert: generator is an AsyncGenerator instance.
  // 2. Let state be generator.[[AsyncGeneratorState]].
  let state = generator['[[AsyncGeneratorState]]'];

  // 3. Assert: state is not "executing".
  // 4. If state is "awaiting-return", return undefined.
  if (state === AsyncGeneratorState.awaitingReturn) {
    return intrinsics.undefined;
  }

  // 5. Let queue be generator.[[AsyncGeneratorQueue]].
  const queue = generator['[[AsyncGeneratorQueue]]'];

  // 6. If queue is an empty List, return undefined.
  if (queue.length === 0) {
    return intrinsics.undefined;
  }

  // 7. Let next be the value of the first element of queue.
  const next = queue[0];

  // 8. Assert: next is an AsyncGeneratorRequest record.
  // 9. Let completion be next.[[Completion]].
  const completion = next['[[Completion]]'] as $AnyNonEmpty; // TODO: is this cast safe?

  // 10. If completion is an abrupt completion, then
  if (completion.isAbrupt) {
    // 10. a. If state is "suspendedStart", then
    if (state === AsyncGeneratorState.suspendedStart) {
      // 10. a. i. Set generator.[[AsyncGeneratorState]] to "completed".
      generator['[[AsyncGeneratorState]]'] = AsyncGeneratorState.completed;

      // 10. a. ii. Set state to "completed".
      state = AsyncGeneratorState.completed;
    }

    // 10. b. If state is "completed", then
    if (state === AsyncGeneratorState.completed) {
      // 10. b. i. If completion.[[Type]] is return, then
      if (
        // TODO: improve the $Error type / isAbrupt interaction
        (completion as $AnyNonEmpty)['[[Type]]'] === CompletionType.return
      ) {
        // 10. b. i. 1. Set generator.[[AsyncGeneratorState]] to "awaiting-return".
        generator['[[AsyncGeneratorState]]'] = AsyncGeneratorState.awaitingReturn;

        // 10. b. i. 2. Let promise be ? PromiseResolve(%Promise%, « completion.[[Value]] »).
        const promise = $PromiseResolve(ctx, intrinsics['%Promise%'], new $List(completion) as unknown as $AnyNonEmpty); // TODO: this cast urgently needs to be addressed with corrected typings
        if (promise.isAbrupt) { return promise; }

        // 10. b. i. 3. Let stepsFulfilled be the algorithm steps defined in AsyncGeneratorResumeNext Return Processor Fulfilled Functions.
        // 10. b. i. 4. Let onFulfilled be CreateBuiltinFunction(stepsFulfilled, « [[Generator]] »).
        // 10. b. i. 5. Set onFulfilled.[[Generator]] to generator.
        const onFulfilled = new $AsyncGeneratorResumeNext_Return_Processor_Fulfilled(realm, generator);

        // 10. b. i. 6. Let stepsRejected be the algorithm steps defined in AsyncGeneratorResumeNext Return Processor Rejected Functions.
        // 10. b. i. 7. Let onRejected be CreateBuiltinFunction(stepsRejected, « [[Generator]] »).
        // 10. b. i. 8. Set onRejected.[[Generator]] to generator.
        const onRejected = new $AsyncGeneratorResumeNext_Return_Processor_Rejected(realm, generator);

        // 10. b. i. 9. Perform ! PerformPromiseThen(promise, onFulfilled, onRejected).
        $PerformPromiseThen(ctx, promise, onFulfilled, onRejected);

        // 10. b. i. 10. Return undefined.
        return intrinsics.undefined;
      }
      // 10. b. ii. Else,
      else {
        // 10. b. ii. 1. Assert: completion.[[Type]] is throw.
        // 10. b. ii. 2. Perform ! AsyncGeneratorReject(generator, completion.[[Value]]).
        $AsyncGeneratorReject(ctx, generator, completion);

        // 10. b. ii. 3. Return undefined.
        return intrinsics.undefined;
      }
    }
  }
  // 11. Else if state is "completed", return ! AsyncGeneratorResolve(generator, undefined, true).
  else if (state === AsyncGeneratorState.completed) {
    return $AsyncGeneratorResolve(ctx, generator, intrinsics.undefined, intrinsics.true);
  }

  // 12. Assert: state is either "suspendedStart" or "suspendedYield".
  // 13. Let genContext be generator.[[AsyncGeneratorContext]].
  const genContext = generator['[[AsyncGeneratorContext]]']!;

  // 14. Let callerContext be the running execution context.
  const callerContext = ctx;

  // 15. Suspend callerContext.
  callerContext.suspend();

  // 16. Set generator.[[AsyncGeneratorState]] to "executing".
  generator['[[AsyncGeneratorState]]'] = AsyncGeneratorState.executing;

  // 17. Push genContext onto the execution context stack; genContext is now the running execution context.
  stack.push(genContext);

  // 18. Resume the suspended evaluation of genContext using completion as the result of the operation that suspended it. Let result be the completion record returned by the resumed computation.
  genContext.resume();
  genContext.onResume!(completion);

  // 19. Assert: result is never an abrupt completion.
  // 20. Assert: When we return here, genContext has already been removed from the execution context stack and callerContext is the currently running execution context.
  // 21. Return undefined.
  return intrinsics.undefined;
}

// http://www.ecma-international.org/ecma-262/#async-generator-resume-next-return-processor-fulfilled
// 25.5.3.5.1 AsyncGeneratorResumeNext Return Processor Fulfilled Functions
export class $AsyncGeneratorResumeNext_Return_Processor_Fulfilled extends $BuiltinFunction<'AsyncGeneratorResumeNext Return Processor Fulfilled'> {
  public '[[Generator]]': $AsyncGeneratorInstance;

  public constructor(
    realm: Realm,
    generator: $AsyncGeneratorInstance,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'AsyncGeneratorResumeNext Return Processor Fulfilled', intrinsics['%FunctionPrototype%']);

    this['[[Generator]]'] = generator;
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (value === void 0) {
      value = intrinsics.undefined;
    }

    // 1. Let F be the active function object.
    const F = this;

    // 2. Set F.[[Generator]].[[AsyncGeneratorState]] to "completed".
    F['[[Generator]]']['[[AsyncGeneratorState]]'] = AsyncGeneratorState.completed;

    // 3. Return ! AsyncGeneratorResolve(F.[[Generator]], value, true).
    return $AsyncGeneratorResolve(ctx, F['[[Generator]]'], value, intrinsics.true);
  }
}

// http://www.ecma-international.org/ecma-262/#async-generator-resume-next-return-processor-rejected
// 25.5.3.5.2 AsyncGeneratorResumeNext Return Processor Rejected Functions
export class $AsyncGeneratorResumeNext_Return_Processor_Rejected extends $BuiltinFunction<'AsyncGeneratorResumeNext Return Processor Rejected'> {
  public '[[Generator]]': $AsyncGeneratorInstance;

  public constructor(
    realm: Realm,
    generator: $AsyncGeneratorInstance,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'AsyncGeneratorResumeNext Return Processor Rejected', intrinsics['%FunctionPrototype%']);

    this['[[Generator]]'] = generator;
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (value === void 0) {
      value = intrinsics.undefined;
    }

    // 1. Let F be the active function object.
    const F = this;

    // 2. Set F.[[Generator]].[[AsyncGeneratorState]] to "completed".
    F['[[Generator]]']['[[AsyncGeneratorState]]'] = AsyncGeneratorState.completed;

    // 3. Return ! AsyncGeneratorResolve(F.[[Generator]], value, true).
    return $AsyncGeneratorResolve(ctx, F['[[Generator]]'], value, intrinsics.true);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorenqueue
// 25.5.3.6 AsyncGeneratorEnqueue ( generator , completion )
export function $AsyncGeneratorEnqueue(
  ctx: ExecutionContext,
  generator: $AsyncGeneratorInstance,
  completion: $Any,
): $PromiseInstance {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: completion is a Completion Record.
  // 2. Let promiseCapability be ! NewPromiseCapability(%Promise%).
  const promiseCapability = $NewPromiseCapability(ctx, intrinsics['%Promise%']) as $PromiseCapability;

  // 3. If Type(generator) is not Object, or if generator does not have an [[AsyncGeneratorState]] internal slot, then
  if (!(generator instanceof $AsyncGeneratorInstance)) {
    // 3. a. Let badGeneratorError be a newly created TypeError object.
    const badGeneratorError = new $TypeError(realm, `Expected generator to be AsyncGeneratorInstance, but got: ${generator}`);

    // 3. b. Perform ! Call(promiseCapability.[[Reject]], undefined, « badGeneratorError »).
    $Call(ctx, promiseCapability['[[Reject]]'], intrinsics.undefined, new $List(badGeneratorError));

    // 3. c. Return promiseCapability.[[Promise]].
    return promiseCapability['[[Promise]]'] as $PromiseInstance; // TODO: is this cast safe?
  }

  // 4. Let queue be generator.[[AsyncGeneratorQueue]].
  const queue = generator['[[AsyncGeneratorQueue]]'];

  // 5. Let request be AsyncGeneratorRequest { [[Completion]]: completion, [[Capability]]: promiseCapability }.
  const request = new $AsyncGeneratorRequest(completion, promiseCapability);

  // 6. Append request to the end of queue.
  queue.push(request);

  // 7. Let state be generator.[[AsyncGeneratorState]].
  const state = generator['[[AsyncGeneratorState]]'];

  // 8. If state is not "executing", then
  if (state !== AsyncGeneratorState.executing) {
    // 8. a. Perform ! AsyncGeneratorResumeNext(generator).
    $AsyncGeneratorResumeNext(ctx, generator);
  }

  // 9. Return promiseCapability.[[Promise]].
  return promiseCapability['[[Promise]]'] as $PromiseInstance; // TODO: is this cast safe?
}

// http://www.ecma-international.org/ecma-262/#sec-asyncgeneratoryield
// 25.5.3.7 AsyncGeneratorYield ( value )
export function $AsyncGeneratorYield(
  ctx: ExecutionContext,
  value: $Any,
): $Any {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];
  const stack = realm.stack;

  // 1. Let genContext be the running execution context.
  const genContext = ctx;

  // 2. Assert: genContext is the execution context of a generator.
  // 3. Let generator be the value of the Generator component of genContext.
  const generator = genContext.Generator as $AsyncGeneratorInstance;

  // 4. Assert: GetGeneratorKind() is async.
  // 5. Set value to ? Await(value).
  value = $Await(ctx, value); // TODO: something is not quite right here w.r.t. value propagation. Need to revisit

  // 6. Set generator.[[AsyncGeneratorState]] to "suspendedYield".
  generator['[[AsyncGeneratorState]]'] = AsyncGeneratorState.suspendedYield;

  // 7. Remove genContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
  stack.pop();

  // 8. Set the code evaluation state of genContext such that when evaluation is resumed with a Completion resumptionValue the following steps will be performed:
  genContext.onResume = function (resumptionValue): $AnyNonEmpty {
    // 8. a. If resumptionValue.[[Type]] is not return, return Completion(resumptionValue).
    if (resumptionValue['[[Type]]'] !== CompletionType.return) {
      return resumptionValue;
    }

    // 8. b. Let awaited be Await(resumptionValue.[[Value]]).
    const awaited = $Await(ctx, resumptionValue);

    // 8. c. If awaited.[[Type]] is throw, return Completion(awaited).
    if (awaited['[[Type]]'] === CompletionType.throw) {
      return awaited;
    }

    // 8. d. Assert: awaited.[[Type]] is normal.
    // 8. e. Return Completion { [[Type]]: return, [[Value]]: awaited.[[Value]], [[Target]]: empty }.
    return awaited.ToCompletion(CompletionType.return, intrinsics.empty); // TODO: we never return the resumptionValue from $Await so need to revisit this

    // 8. f. NOTE: When one of the above steps returns, it returns to the evaluation of the YieldExpression production that originally called this abstract operation.
  };

  // 9. Return ! AsyncGeneratorResolve(generator, value, false).
  return $AsyncGeneratorResolve(ctx, generator, value, intrinsics.false);

  // 10. NOTE: This returns to the evaluation of the operation that had most previously resumed evaluation of genContext.
}

// #endregion

