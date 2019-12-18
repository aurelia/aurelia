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
} from '../types/_shared';
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
} from './promise';
import {
  $Call,
} from '../operations';

// http://www.ecma-international.org/ecma-262/#sec-async-function-objects
// 25.7 AsyncFunction Objects

// http://www.ecma-international.org/ecma-262/#sec-async-function-constructor
// 25.7.1 The AsyncFunction Constructor
export class $AsyncFunctionConstructor extends $BuiltinFunction<'%AsyncFunction%'> {
  // http://www.ecma-international.org/ecma-262/#sec-async-function-constructor-prototype
  // 25.7.2.2 AsyncFunction.prototype
  public get $prototype(): $AsyncFunctionPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $AsyncFunctionPrototype;
  }
  public set $prototype(value: $AsyncFunctionPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  // http://www.ecma-international.org/ecma-262/#sec-async-function-constructor-length
  // 25.7.2.1 AsyncFunction.length
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
    super(realm, '%AsyncFunction%', functionConstructor);
  }

  // http://www.ecma-international.org/ecma-262/#sec-async-function-constructor-arguments
  // 25.7.1.1 AsyncFunction ( p1 , p2 , … , pn , body )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    // 1. Let C be the active function object.
    // 2. Let args be the argumentsList that was passed to this function by [[Call]] or [[Construct]].
    // 3. Return CreateDynamicFunction(C, NewTarget, "async", args).
    return $CreateDynamicFunction(ctx, this, NewTarget, FunctionKind.async, argumentsList);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-async-function-prototype-properties
// 25.7.3 Properties of the AsyncFunction Prototype Object
export class $AsyncFunctionPrototype extends $Object<'%AsyncFunctionPrototype%'> {
  // http://www.ecma-international.org/ecma-262/#sec-async-function-prototype-properties-constructor
  // 25.7.3.1 AsyncFunction.prototype.constructor
  public get $constructor(): $AsyncFunctionConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $AsyncFunctionConstructor;
  }
  public set $constructor(value: $AsyncFunctionConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-async-function-prototype-properties-toStringTag
  // 25.7.3.2 AsyncFunction.prototype [ @@toStringTag ]
  public get '@@toStringTag'(): $String<'AsyncFunction'> {
    return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'] as $String<'AsyncFunction'>;
  }
  public set '@@toStringTag'(value: $String<'AsyncFunction'>) {
    this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%AsyncFunctionPrototype%', functionPrototype, CompletionType.normal, intrinsics.empty);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-async-function-instances
// 25.7.4 AsyncFunction Instances

// http://www.ecma-international.org/ecma-262/#sec-async-function-instances-length
// 25.7.4.1 length

// http://www.ecma-international.org/ecma-262/#sec-async-function-instances-name
// 25.7.4.2 name

// http://www.ecma-international.org/ecma-262/#sec-async-functions-abstract-operations
// 25.7.5 Async Functions Abstract Operations

// http://www.ecma-international.org/ecma-262/#sec-async-functions-abstract-operations-async-function-start
// 25.7.5.1 AsyncFunctionStart ( promiseCapability , asyncFunctionBody )
export function $AsyncFunctionStart(
  ctx: ExecutionContext,
  promiseCapability: $PromiseCapability,
  asyncFunctionBody: $Block,
): $Undefined {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];
  const stack = realm.stack;

  // 1. Let runningContext be the running execution context.
  const runningContext = ctx;

  // 2. Let asyncContext be a copy of runningContext.
  const asyncContext = runningContext.makeCopy();

  // 3. Set the code evaluation state of asyncContext such that when evaluation is resumed for that execution context the following steps will be performed:
  asyncContext.onResume = function (resumptionValue): $AnyNonEmpty {
    // 3. a. Let result be the result of evaluating asyncFunctionBody.
    const result = asyncFunctionBody.Evaluate(asyncContext);
    if (result.isAbrupt) { return result; }

    // 3. b. Assert: If we return here, the async function either threw an exception or performed an implicit or explicit return; all awaiting is done.
    // 3. c. Remove asyncContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
    stack.pop();

    // 3. d. If result.[[Type]] is normal, then
    if (result['[[Type]]'] === CompletionType.normal) {
      // 3. d. i. Perform ! Call(promiseCapability.[[Resolve]], undefined, « undefined »).
      $Call(asyncContext, promiseCapability['[[Resolve]]'], intrinsics.undefined, new $List(intrinsics.undefined));
    }
    // 3. e. Else if result.[[Type]] is return, then
    else if (result['[[Type]]'] === CompletionType.return) {
      // 3. e. i. Perform ! Call(promiseCapability.[[Resolve]], undefined, « result.[[Value]] »).
      $Call(asyncContext, promiseCapability['[[Resolve]]'], intrinsics.undefined, new $List(result));
    }
    // 3. f. Else,
    else {
      // 3. f. i. Assert: result.[[Type]] is throw.
      // 3. f. ii. Perform ! Call(promiseCapability.[[Reject]], undefined, « result.[[Value]] »).
      $Call(asyncContext, promiseCapability['[[Reject]]'], intrinsics.undefined, new $List(result as $AnyNonEmpty)); // TODO: is this cast safe?
    }

    // 3. g. Return.
    return intrinsics.undefined;
  };

  // 4. Push asyncContext onto the execution context stack; asyncContext is now the running execution context.
  stack.push(asyncContext);

  // 5. Resume the suspended evaluation of asyncContext. Let result be the value returned by the resumed computation.
  asyncContext.resume();
  const result = asyncContext.onResume!(intrinsics.undefined); // TODO: sure about this?

  // 6. Assert: When we return here, asyncContext has already been removed from the execution context stack and runningContext is the currently running execution context.
  // 7. Assert: result is a normal completion with a value of undefined. The possible sources of completion values are Await or, if the async function doesn't await anything, the step 3.g above.
  // 8. Return.
  return intrinsics.undefined;
}
