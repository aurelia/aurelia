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
  CompletionType,
} from '../types/_shared';
import {
  $Error,
} from '../types/error';
import {
  $Undefined,
} from '../types/undefined';
import {
  $Object,
} from '../types/object';
import {
  $ObjectPrototype,
} from './object';


// http://www.ecma-international.org/ecma-262/#sec-function-constructor
export class $FunctionConstructor extends $BuiltinFunction<'%Function%'> {
  public get $prototype(): $FunctionPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $FunctionPrototype;
  }
  public set $prototype(value: $FunctionPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Function%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-function-p1-p2-pn-body
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    // 1. Let C be the active function object.
    // 2. Let args be the argumentsList that was passed to this function by [[Call]] or [[Construct]].
    // 3. Return ? CreateDynamicFunction(C, NewTarget, "normal", args).
    return $CreateDynamicFunction(ctx, this, NewTarget, 'normal', argumentsList);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-function-prototype-object
export class $FunctionPrototype extends $Object<'%FunctionPrototype%'> {
  public get $constructor(): $FunctionConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $FunctionConstructor;
  }
  public set $constructor(value: $FunctionConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%FunctionPrototype%', objectPrototype, CompletionType.normal, intrinsics.empty);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-createdynamicfunction
export function $CreateDynamicFunction(
  ctx: ExecutionContext,
  constructor: $Function,
  newTarget: $Function | $Undefined,
  kind: 'normal' | 'generator' | 'async' | 'async generator',
  args: readonly $AnyNonEmpty[],
): $Function | $Error {
  // TODO: implement this
  return null as any;

  // 1. Assert: The execution context stack has at least two elements.
  // 2. Let callerContext be the second to top element of the execution context stack.
  // 3. Let callerRealm be callerContext's Realm.
  // 4. Let calleeRealm be the current Realm Record.
  // 5. Perform ? HostEnsureCanCompileStrings(callerRealm, calleeRealm).
  // 6. If newTarget is undefined, set newTarget to constructor.
  // 7. If kind is "normal", then
    // 7. a. Let goal be the grammar symbol FunctionBody[~Yield, ~Await].
    // 7. b. Let parameterGoal be the grammar symbol FormalParameters[~Yield, ~Await].
    // 7. c. Let fallbackProto be "%FunctionPrototype%".
  // 8. Else if kind is "generator", then
    // 8. a. Let goal be the grammar symbol GeneratorBody.
    // 8. b. Let parameterGoal be the grammar symbol FormalParameters[+Yield, ~Await].
    // 8. c. Let fallbackProto be "%Generator%".
  // 9. Else if kind is "async", then
    // 9. a. Let goal be the grammar symbol AsyncFunctionBody.
    // 9. b. Let parameterGoal be the grammar symbol FormalParameters[~Yield, +Await].
    // 9. c. Let fallbackProto be "%AsyncFunctionPrototype%".
  // 10. Else,
    // 10. a. Assert: kind is "async generator".
    // 10. b. Let goal be the grammar symbol AsyncGeneratorBody.
    // 10. c. Let parameterGoal be the grammar symbol FormalParameters[+Yield, +Await].
    // 10. d. Let fallbackProto be "%AsyncGenerator%".
  // 11. Let argCount be the number of elements in args.
  // 12. Let P be the empty String.
  // 13. If argCount = 0, let bodyText be the empty String.
  // 14. Else if argCount = 1, let bodyText be args[0].
  // 15. Else argCount > 1,
    // 15. a. Let firstArg be args[0].
    // 15. b. Set P to ? ToString(firstArg).
    // 15. c. Let k be 1.
    // 15. d. Repeat, while k < argCount - 1
      // 15. d. i. Let nextArg be args[k].
      // 15. d. ii. Let nextArgString be ? ToString(nextArg).
      // 15. d. iii. Set P to the string-concatenation of the previous value of P, "," (a comma), and nextArgString.
      // 15. d. iv. Increase k by 1.
    // 15. e. Let bodyText be args[k].
  // 16. Set bodyText to ? ToString(bodyText).
  // 17. Let parameters be the result of parsing P, interpreted as UTF-16 encoded Unicode text as described in 6.1.4, using parameterGoal as the goal symbol. Throw a SyntaxError exception if the parse fails.
  // 18. Let body be the result of parsing bodyText, interpreted as UTF-16 encoded Unicode text as described in 6.1.4, using goal as the goal symbol. Throw a SyntaxError exception if the parse fails.
  // 19. Let strict be ContainsUseStrict of body.
  // 20. If any static semantics errors are detected for parameters or body, throw a SyntaxError or a ReferenceError exception, depending on the type of the error. If strict is true, the Early Error rules for UniqueFormalParameters:FormalParameters are applied. Parsing and early error detection may be interweaved in an implementation-dependent manner.
  // 21. If strict is true and IsSimpleParameterList of parameters is false, throw a SyntaxError exception.
  // 22. If any element of the BoundNames of parameters also occurs in the LexicallyDeclaredNames of body, throw a SyntaxError exception.
  // 23. If body Contains SuperCall is true, throw a SyntaxError exception.
  // 24. If parameters Contains SuperCall is true, throw a SyntaxError exception.
  // 25. If body Contains SuperProperty is true, throw a SyntaxError exception.
  // 26. If parameters Contains SuperProperty is true, throw a SyntaxError exception.
  // 27. If kind is "generator" or "async generator", then
    // 27. a. If parameters Contains YieldExpression is true, throw a SyntaxError exception.
  // 28. If kind is "async" or "async generator", then
    // 28. a. If parameters Contains AwaitExpression is true, throw a SyntaxError exception.
  // 29. If strict is true, then
    // 29. a. If BoundNames of parameters contains any duplicate elements, throw a SyntaxError exception.
  // 30. Let proto be ? GetPrototypeFromConstructor(newTarget, fallbackProto).
  // 31. Let F be FunctionAllocate(proto, strict, kind).
  // 32. Let realmF be F.[[Realm]].
  // 33. Let scope be realmF.[[GlobalEnv]].
  // 34. Perform FunctionInitialize(F, Normal, parameters, body, scope).
  // 35. If kind is "generator", then
    // 35. a. Let prototype be ObjectCreate(%GeneratorPrototype%).
    // 35. b. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
  // 36. Else if kind is "async generator", then
    // 36. a. Let prototype be ObjectCreate(%AsyncGeneratorPrototype%).
    // 36. b. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
  // 37. Else if kind is "normal", perform MakeConstructor(F).
  // 38. NOTE: Async functions are not constructable and do not have a [[Construct]] internal method or a "prototype" property.
  // 39. Perform SetFunctionName(F, "anonymous").
  // 40. Let prefix be the prefix associated with kind in Table 47.
  // 41. Let sourceText be the string-concatenation of prefix, " anonymous(", P, 0x000A (LINE FEED), ") {", 0x000A (LINE FEED), bodyText, 0x000A (LINE FEED), and "}".
  // 42. Set F.[[SourceText]] to sourceText.
  // 43. Return F.
}
