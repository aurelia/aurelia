import {
  $BuiltinFunction,
  $Function,
  $GetPrototypeFromConstructor,
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
  $Error, $TypeError,
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
import {
  $List,
} from '../types/list';
import {
  $Call,
  $HostEnsureCanCompileStrings,
  $DefinePropertyOrThrow,
} from '../operations';
import {
  $String,
} from '../types/string';
import {
  createSourceFile,
  ScriptTarget,
  FunctionDeclaration,
} from 'typescript';
import {
  $FunctionDeclaration,
} from '../ast/functions';
import {
  $SourceFile,
} from '../ast/modules';
import {
  Context,
} from '../ast/_shared';
import {
  $Boolean,
} from '../types/boolean';
import { $PropertyDescriptor } from '../types/property-descriptor';


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
  // 19.2.1.1 Function ( p1 , p2 , … , pn , body )
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

  public get $call(): $FunctionPrototype_call {
    return this.getProperty(this.realm['[[Intrinsics]]'].call)['[[Value]]'] as $FunctionPrototype_call;
  }
  public set $call(value: $FunctionPrototype_call) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].call, value);
  }

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%FunctionPrototype%', objectPrototype, CompletionType.normal, intrinsics.empty);
  }
}

export class $FunctionPrototype_call extends $BuiltinFunction<'Function.prototype.call'> {
  // http://www.ecma-international.org/ecma-262/#sec-function.prototype.call
  // 19.2.3.3 Function.prototype.call ( thisArg , ... args )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [thisArg, ...args]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (thisArg === void 0) {
      thisArg = intrinsics.undefined;
    }

    // 1. Let func be the this value.
    const func = thisArgument;

    // 2. If IsCallable(func) is false, throw a TypeError exception.
    if (!func.isFunction) {
      return new $TypeError(realm, `Function.prototype.call called on ${func}, but expected a callable function`);
    }

    // 3. Let argList be a new empty List.
    const argList = new $List<$AnyNonEmpty>();

    // 4. If this method was called with more than one argument, then in left to right order, starting with the second argument, append each argument as the last element of argList.
    if (args.length > 0) {
      argList.push(...args);
    }

    // 5. Perform PrepareForTailCall().
    ctx.suspend();
    realm.stack.pop();

    // 6. Return ? Call(func, thisArg, argList).
    return $Call(realm.stack.top, func as $Function, thisArg, argList);
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
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];
  const stack = realm.stack;

  // 1. Assert: The execution context stack has at least two elements.
  // 2. Let callerContext be the second to top element of the execution context stack.
  const callerContext = stack[stack.length - 2];

  // 3. Let callerRealm be callerContext's Realm.
  const callerRealm = callerContext.Realm;

  // 4. Let calleeRealm be the current Realm Record.
  const calleeRealm = realm;

  // 5. Perform ? HostEnsureCanCompileStrings(callerRealm, calleeRealm).
  const $HostEnsureCanCompileStringsResult = $HostEnsureCanCompileStrings(ctx, callerRealm, calleeRealm);
  if ($HostEnsureCanCompileStringsResult.isAbrupt) { return $HostEnsureCanCompileStringsResult; }

  // 6. If newTarget is undefined, set newTarget to constructor.
  if (newTarget.isUndefined) {
    newTarget = constructor;
  }

  let $yield: boolean;
  let $await: boolean;
  let prefix: 'function' | 'function*' | 'async function' | 'async function*';
  let fallbackProto: '%FunctionPrototype%' | '%Generator%' | '%AsyncFunctionPrototype%' | '%AsyncGenerator%';

  switch (kind) {
    // 7. If kind is "normal", then
    case 'normal':
      // 7. a. Let goal be the grammar symbol FunctionBody[~Yield, ~Await].
      // 7. b. Let parameterGoal be the grammar symbol FormalParameters[~Yield, ~Await].
      prefix = 'function';

      // 7. c. Let fallbackProto be "%FunctionPrototype%".
      fallbackProto = '%FunctionPrototype%';
      break;
    // 8. Else if kind is "generator", then
    case 'generator':
      // 8. a. Let goal be the grammar symbol GeneratorBody.
      // 8. b. Let parameterGoal be the grammar symbol FormalParameters[+Yield, ~Await].
      prefix = 'function*';

      // 8. c. Let fallbackProto be "%Generator%".
      fallbackProto = '%Generator%';
      break;
    // 9. Else if kind is "async", then
    case 'async':
      // 9. a. Let goal be the grammar symbol AsyncFunctionBody.
      // 9. b. Let parameterGoal be the grammar symbol FormalParameters[~Yield, +Await].
      prefix = 'async function';

      // 9. c. Let fallbackProto be "%AsyncFunctionPrototype%".
      fallbackProto = '%AsyncFunctionPrototype%';
      break;
    // 10. Else,
    case 'async generator':
      // 10. a. Assert: kind is "async generator".
      // 10. b. Let goal be the grammar symbol AsyncGeneratorBody.
      // 10. c. Let parameterGoal be the grammar symbol FormalParameters[+Yield, +Await].
      prefix = 'async function*';

      // 10. d. Let fallbackProto be "%AsyncGenerator%".
      fallbackProto = '%AsyncGenerator%';
      break;
  }

  // 11. Let argCount be the number of elements in args.
  const argCount = args.length;

  // 12. Let P be the empty String.
  let P: $String = intrinsics[''];

  let $bodyText: $AnyNonEmpty | $Error;
  let bodyText: $String;

  // 13. If argCount = 0, let bodyText be the empty String.
  if (argCount === 0) {
    $bodyText = intrinsics[''];
  }
  // 14. Else if argCount = 1, let bodyText be args[0].
  else if (argCount === 1) {
    $bodyText = args[0];
  }
  // 15. Else argCount > 1,
  else {
    // 15. a. Let firstArg be args[0].
    const firstArg = args[0];

    // 15. b. Set P to ? ToString(firstArg).
    const $P = firstArg.ToString(ctx);
    if ($P.isAbrupt) { return $P; }
    P = $P;

    // 15. c. Let k be 1.
    let k = 1;

    // 15. d. Repeat, while k < argCount - 1
    while (k < argCount - 1) {
      // 15. d. i. Let nextArg be args[k].
      const nextArg = args[k];

      // 15. d. ii. Let nextArgString be ? ToString(nextArg).
      const nextArgString = nextArg.ToString(ctx);
      if (nextArgString.isAbrupt) { return nextArgString; }

      // 15. d. iii. Set P to the string-concatenation of the previous value of P, "," (a comma), and nextArgString.
      P = new $String(realm, `${P['[[Value]]']},${nextArgString['[[Value]]']}`);

      // 15. d. iv. Increase k by 1.
      ++k;
    }

    // 15. e. Let bodyText be args[k].
    $bodyText = args[k];
  }

  // 16. Set bodyText to ? ToString(bodyText).
  $bodyText = $bodyText.ToString(ctx);
  if ($bodyText.isAbrupt) { return $bodyText; }
  bodyText = $bodyText;

  // 41. Let sourceText be the string-concatenation of prefix, " anonymous(", P, 0x000A (LINE FEED), ") {", 0x000A (LINE FEED), bodyText, 0x000A (LINE FEED), and "}".
  // NOTE: we bring this step up here for parsing a proper function with TS (since TS doesn't expose an api for parsing just functions).
  //    The exact same text is then later set as [[SourceText]]
  const sourceText = `${prefix} anonymous(${P['[[Value]]']}\n) {\n${bodyText['[[Value]]']}\n}`;

  // 17. Let parameters be the result of parsing P, interpreted as UTF-16 encoded Unicode text as described in 6.1.4, using parameterGoal as the goal symbol. Throw a SyntaxError exception if the parse fails.
  // 18. Let body be the result of parsing bodyText, interpreted as UTF-16 encoded Unicode text as described in 6.1.4, using goal as the goal symbol. Throw a SyntaxError exception if the parse fails.
  const node = createSourceFile(
    '',
    sourceText,
    ScriptTarget.Latest,
  ).statements[0] as FunctionDeclaration;
  const ScriptOrModule = callerContext.ScriptOrModule as $SourceFile;

  const $functionDeclaration = new $FunctionDeclaration(
    node,
    ScriptOrModule,
    Context.Dynamic,
    -1,
    ScriptOrModule,
    calleeRealm,
    1,
    ScriptOrModule.logger,
    `${ScriptOrModule.path}[Dynamic].FunctionDeclaration`,
  );

  // 19. Let strict be ContainsUseStrict of body.
  const strict = $functionDeclaration.ContainsUseStrict;

  // TODO: revisit whether we need to implement these early errors. See what 262 tests fail, if any, etc.

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
  const proto = $GetPrototypeFromConstructor(ctx, newTarget, fallbackProto);
  if (proto.isAbrupt) { return proto; }

  // 31. Let F be FunctionAllocate(proto, strict, kind).
  const F = $Function.FunctionAllocate(ctx, proto, new $Boolean(realm, strict), kind);

  // 32. Let realmF be F.[[Realm]].
  const realmF = F['[[Realm]]'];

  // 33. Let scope be realmF.[[GlobalEnv]].
  const scope = realmF['[[GlobalEnv]]'];

  // 34. Perform FunctionInitialize(F, Normal, parameters, body, scope).
  $Function.FunctionInitialize(ctx, F, 'normal', $functionDeclaration, scope);

  // 35. If kind is "generator", then
  if (kind === 'generator') {
    // 35. a. Let prototype be ObjectCreate(%GeneratorPrototype%).
    const prototype = new $Object(
      realm,
      'anonymous generator',
      intrinsics['%GeneratorPrototype%'],
      CompletionType.normal,
      intrinsics.empty,
    );

    // 35. b. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
    $DefinePropertyOrThrow(
      ctx,
      F,
      intrinsics.$prototype,
      new $PropertyDescriptor(
        realm,
        intrinsics.$prototype,
        {
          '[[Value]]': prototype,
          '[[Writable]]': intrinsics.true,
          '[[Enumerable]]': intrinsics.false,
          '[[Configurable]]': intrinsics.false,
        },
      ),
    );
  }
  // 36. Else if kind is "async generator", then
  else if (kind === 'async generator') {
    // 36. a. Let prototype be ObjectCreate(%AsyncGeneratorPrototype%).
    const prototype = new $Object(
      realm,
      'anonymous async generator',
      intrinsics['%AsyncGeneratorPrototype%'],
      CompletionType.normal,
      intrinsics.empty,
    );

    // 36. b. Perform DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: false }).
    $DefinePropertyOrThrow(
      ctx,
      F,
      intrinsics.$prototype,
      new $PropertyDescriptor(
        realm,
        intrinsics.$prototype,
        {
          '[[Value]]': prototype,
          '[[Writable]]': intrinsics.true,
          '[[Enumerable]]': intrinsics.false,
          '[[Configurable]]': intrinsics.false,
        },
      ),
    );
  }
  // 37. Else if kind is "normal", perform MakeConstructor(F).
  else if (kind === 'normal') {
    F.MakeConstructor(ctx);
  }

  // 38. NOTE: Async functions are not constructable and do not have a [[Construct]] internal method or a "prototype" property.
  // 39. Perform SetFunctionName(F, "anonymous").
  F.SetFunctionName(ctx, new $String(realm, 'anonymous'));

  // 40. Let prefix be the prefix associated with kind in Table 47.
  // 41. Let sourceText be the string-concatenation of prefix, " anonymous(", P, 0x000A (LINE FEED), ") {", 0x000A (LINE FEED), bodyText, 0x000A (LINE FEED), and "}".
  // 42. Set F.[[SourceText]] to sourceText.
  F['[[SourceText]]'] = new $String(realm, sourceText);

  // 43. Return F.
  return F;
}
