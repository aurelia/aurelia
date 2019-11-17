/* eslint-disable */
import { $Object } from './object';
import { $EnvRec, $FunctionEnvRec } from './environment-record';
import { $FunctionDeclaration, $MethodDeclaration, $ArrowFunction, $SourceFile } from '../ast';
import { $Boolean } from './boolean';
import { $String } from './string';
import { $Any, $AnyNonEmpty, CompletionType } from './_shared';
import { $PropertyDescriptor } from './property-descriptor';
import { $Number } from './number';
import { $DefinePropertyOrThrow, $Get } from '../operations';
import { $Symbol } from './symbol';
import { Intrinsics } from '../intrinsics';
import { $Undefined } from './undefined';
import { ExecutionContext, Realm } from '../realm';

// http://www.ecma-international.org/ecma-262/#table-6
// http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects
export class $Function<
  T extends string = string,
> extends $Object<T> {
  public readonly '<$Function>': unknown;

  public get isFunction(): true { return true; }

  public ['[[Environment]]']: $EnvRec;
  public ['[[FunctionKind]]']: FunctionKind;
  public ['[[ECMAScriptCode]]']: $FunctionDeclaration | $MethodDeclaration | $ArrowFunction;
  public ['[[ConstructorKind]]']: ConstructorKind;
  public ['[[Realm]]']: Realm;
  public ['[[ScriptOrModule]]']: $SourceFile;
  public ['[[ThisMode]]']: ThisMode;
  public ['[[Strict]]']: $Boolean;
  public ['[[HomeObject]]']: $Object;
  public ['[[SourceText]]']: $String;

  public constructor(
    realm: Realm,
    IntrinsicName: T,
    proto: $Object,
  ) {
    super(realm, IntrinsicName, proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects-call-thisargument-argumentslist
  public '[[Call]]'(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
  ): $AnyNonEmpty {
    // 1. Assert: F is an ECMAScript function object.
    const F = this;
    const realm = F['[[Realm]]'];
    const intrinsics = realm['[[Intrinsics]]'];

    // 2. If F.[[FunctionKind]] is "classConstructor", throw a TypeError exception.
    if (F['[[FunctionKind]]'] === 'classConstructor') {
      throw new TypeError('2. If F.[[FunctionKind]] is "classConstructor", throw a TypeError exception.');
    }

    // 3. Let callerContext be the running execution context.
    // 4. Let calleeContext be PrepareForOrdinaryCall(F, undefined).
    const calleeContext = $PrepareForOrdinaryCall(ctx, F, intrinsics.undefined);

    // 5. Assert: calleeContext is now the running execution context.
    // 6. Perform OrdinaryCallBindThis(F, calleeContext, thisArgument).
    $OrdinaryCallBindThis(ctx, F, calleeContext, thisArgument);

    // 7. Let result be OrdinaryCallEvaluateBody(F, argumentsList).
    const result = (F['[[ECMAScriptCode]]'] as $FunctionDeclaration).EvaluateBody(calleeContext, F, argumentsList);

    // 8. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
    realm.stack.pop();

    // 9. If result.[[Type]] is return, return NormalCompletion(result.[[Value]]).
    if (result['[[Type]]'] === CompletionType.return) {
      return result.ToCompletion(CompletionType.normal, intrinsics.empty);
    }

    // 10. ReturnIfAbrupt(result).
    if (result.isAbrupt) {
      return result as $AnyNonEmpty; // TODO: ensure we don't need to cast this. Need to squeeze $Empty out of the union in a normal way somehow. Can StatementList guarantee that it never returns $Empty? In that case we can return $AnyNonEmpty from EvaluateBody
    }

    // 11. Return NormalCompletion(undefined).
    return new $Undefined(realm, CompletionType.normal, intrinsics.empty);
  }

  // http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects-construct-argumentslist-newtarget
  public '[[Construct]]'(
    ctx: ExecutionContext,
    argumentsList: readonly $AnyNonEmpty[],
    newTarget: $Object,
  ): $Object {
    // 1. Assert: F is an ECMAScript function object.
    const F = this;
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const stack = realm.stack;

    // 2. Assert: Type(newTarget) is Object.
    // 3. Let callerContext be the running execution context.
    // 4. Let kind be F.[[ConstructorKind]].
    const kind = F['[[ConstructorKind]]'];

    let thisArgument: $AnyNonEmpty;
    // 5. If kind is "base", then
    if (kind === 'base') {
      // 5. a. Let thisArgument be ? OrdinaryCreateFromConstructor(newTarget, "%ObjectPrototype%").
      thisArgument = $OrdinaryCreateFromConstructor(ctx, newTarget, '%ObjectPrototype%');
    } else {
      thisArgument = intrinsics.undefined;
    }

    // 6. Let calleeContext be PrepareForOrdinaryCall(F, newTarget).
    const calleeContext = $PrepareForOrdinaryCall(ctx, F, newTarget);

    // 7. Assert: calleeContext is now the running execution context.
    // 8. If kind is "base", perform OrdinaryCallBindThis(F, calleeContext, thisArgument).
    if (kind === 'base') {
      $OrdinaryCallBindThis(ctx, F, calleeContext, thisArgument);
    }

    // 9. Let constructorEnv be the LexicalEnvironment of calleeContext.
    // 10. Let envRec be constructorEnv's EnvironmentRecord.
    const envRec = calleeContext.LexicalEnvironment;

    // 11. Let result be OrdinaryCallEvaluateBody(F, argumentsList).
    const result = (F['[[ECMAScriptCode]]'] as $FunctionDeclaration).EvaluateBody(calleeContext, F, argumentsList);

    // 12. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
    stack.pop();

    // 13. If result.[[Type]] is return, then
    if (result['[[Type]]'] === CompletionType.return) {
      // 13. a. If Type(result.[[Value]]) is Object, return NormalCompletion(result.[[Value]]).
      if (result.isObject) {
        return result.ToCompletion(CompletionType.normal, intrinsics.empty);
      }

      // 13. b. If kind is "base", return NormalCompletion(thisArgument).
      if (kind === 'base') {
        return (thisArgument as $Object).ToCompletion(CompletionType.normal, intrinsics.empty);
      }

      // 13. c. If result.[[Value]] is not undefined, throw a TypeError exception.
      if (!result.isUndefined) {
        throw new TypeError();
      }
    }
    // 14. Else, ReturnIfAbrupt(result).
    else {
      if (result.isAbrupt) {
        return result as $Object;
      }
    }

    // 15. Return ? envRec.GetThisBinding().
    return (envRec as $FunctionEnvRec).GetThisBinding(ctx) as $Object;
  }

  // http://www.ecma-international.org/ecma-262/#sec-functionallocate
  public static FunctionAllocate(
    ctx: ExecutionContext,
    functionPrototype: $Object,
    strict: $Boolean,
    functionKind: 'normal' | 'non-constructor' | 'generator' | 'async' | 'async generator',
  ): $Function {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Assert: Type(functionPrototype) is Object.
    // 2. Assert: functionKind is either "normal", "non-constructor", "generator", "async", or "async generator".
    // 3. If functionKind is "normal", let needsConstruct be true.
    // 4. Else, let needsConstruct be false.
    const needsConstruct = functionKind === 'normal';

    // 5. If functionKind is "non-constructor", set functionKind to "normal".
    if (functionKind === 'non-constructor') {
      functionKind = 'normal';
    }

    // 6. Let F be a newly created ECMAScript function object with the internal slots listed in Table 27. All of those internal slots are initialized to undefined.
    const F = new $Function(realm, 'function', functionPrototype);

    // 7. Set F's essential internal methods to the default ordinary object definitions specified in 9.1.
    // 8. Set F.[[Call]] to the definition specified in 9.2.1.
    // 9. If needsConstruct is true, then
    if (needsConstruct) {
      // 9. a. Set F.[[Construct]] to the definition specified in 9.2.2.
      // 9. b. Set F.[[ConstructorKind]] to "base".
      F['[[ConstructorKind]]'] = 'base';
    }

    // 10. Set F.[[Strict]] to strict.
    F['[[Strict]]'] = strict;

    // 11. Set F.[[FunctionKind]] to functionKind.
    F['[[FunctionKind]]'] = functionKind;

    // 12. Set F.[[Prototype]] to functionPrototype.
    F['[[Prototype]]'] = functionPrototype;

    // 13. Set F.[[Extensible]] to true.
    F['[[Extensible]]'] = intrinsics.true;

    // 14. Set F.[[Realm]] to the current Realm Record.
    F['[[Realm]]'] = realm;

    // 15. Return F.
    return F;
  }

  // http://www.ecma-international.org/ecma-262/#sec-functioninitialize
  public static FunctionInitialize(
    ctx: ExecutionContext,
    F: $Function,
    kind: 'normal' | 'method' | 'arrow',
    node: $FunctionDeclaration | $MethodDeclaration | $ArrowFunction,
    Scope: $EnvRec,
  ): $Function {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let len be the ExpectedArgumentCount of ParameterList.
    const len = node.ExpectedArgumentCount;

    // 2. Perform ! SetFunctionLength(F, len).
    const Desc = new $PropertyDescriptor(realm, intrinsics.length);
    Desc['[[Value]]'] = new $Number(realm, len);
    Desc['[[Writable]]'] = intrinsics.false;
    Desc['[[Enumerable]]'] = intrinsics.false;
    Desc['[[Configurable]]'] = intrinsics.true;
    $DefinePropertyOrThrow(ctx, F, intrinsics.length, Desc);

    // 3. Let Strict be F.[[Strict]].
    const Strict = F['[[Strict]]'];

    // 4. Set F.[[Environment]] to Scope.
    F['[[Environment]]'] = Scope;

    // 5. Set F.[[FormalParameters]] to ParameterList.
    // 6. Set F.[[ECMAScriptCode]] to Body.
    F['[[ECMAScriptCode]]'] = node;

    // 7. Set F.[[ScriptOrModule]] to GetActiveScriptOrModule().
    F['[[ScriptOrModule]]'] = realm.GetActiveScriptOrModule();

    // 8. If kind is Arrow, set F.[[ThisMode]] to lexical.
    if (kind === 'arrow') {
      F['[[ThisMode]]'] = 'lexical';
    }
    // 9. Else if Strict is true, set F.[[ThisMode]] to strict.
    else if (Strict.isTruthy) {
      F['[[ThisMode]]'] = 'strict';
    }
    // 10. Else, set F.[[ThisMode]] to global.
    else {
      F['[[ThisMode]]'] = 'global';
    }

    // 11. Return F.
    return F;
  }


  // http://www.ecma-international.org/ecma-262/#sec-functioncreate
  public static FunctionCreate(
    ctx: ExecutionContext,
    kind: 'normal' | 'method' | 'arrow',
    node: $FunctionDeclaration | $MethodDeclaration | $ArrowFunction,
    Scope: $EnvRec,
    Strict: $Boolean,
    prototype?: $Object,
  ) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If prototype is not present, then
    if (prototype === void 0) {
      // 1. a. Set prototype to the intrinsic object %FunctionPrototype%.
      prototype = intrinsics['%FunctionPrototype%'];
    }

    let allocKind: 'normal' | 'non-constructor';
    // 2. If kind is not Normal, let allocKind be "non-constructor".
    if (kind !== 'normal') {
      allocKind = 'non-constructor';
    }
    // 3. Else, let allocKind be "normal".
    else {
      allocKind = 'normal';
    }

    // 4. Let F be FunctionAllocate(prototype, Strict, allocKind).
    const F = this.FunctionAllocate(ctx, prototype!, Strict, allocKind);

    // 5. Return FunctionInitialize(F, kind, ParameterList, Body, Scope).
    return this.FunctionInitialize(ctx, F, kind, node, Scope);
  }

  // http://www.ecma-international.org/ecma-262/#sec-makeconstructor
  public MakeConstructor(
    ctx: ExecutionContext,
    writablePrototype?: $Boolean,
    prototype?: $Object,
  ): void {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const F = this;

    // 1. Assert: F is an ECMAScript function object.
    // 2. Assert: IsConstructor(F) is true.
    // 3. Assert: F is an extensible object that does not have a prototype own property.
    // 4. If writablePrototype is not present, set writablePrototype to true.
    if (writablePrototype === void 0) {
      writablePrototype = intrinsics.true;
    }

    // 5. If prototype is not present, then
    if (prototype === void 0) {
      // 5. a. Set prototype to ObjectCreate(%ObjectPrototype%).
      prototype = $Object.ObjectCreate(ctx, 'constructor', intrinsics['%ObjectPrototype%']);

      // 5. b. Perform ! DefinePropertyOrThrow(prototype, "constructor", PropertyDescriptor { [[Value]]: F, [[Writable]]: writablePrototype, [[Enumerable]]: false, [[Configurable]]: true }).
      const Desc = new $PropertyDescriptor(realm, intrinsics.$constructor);
      Desc['[[Value]]'] = F;
      Desc['[[Writable]]'] = writablePrototype;
      Desc['[[Enumerable]]'] = intrinsics.false;
      Desc['[[Configurable]]'] = intrinsics.true;

      $DefinePropertyOrThrow(ctx, prototype, intrinsics.$constructor, Desc);
    }

    // 6. Perform ! DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: writablePrototype, [[Enumerable]]: false, [[Configurable]]: false }).
    const Desc = new $PropertyDescriptor(realm, intrinsics.$prototype);
    Desc['[[Value]]'] = prototype;
    Desc['[[Writable]]'] = writablePrototype;
    Desc['[[Enumerable]]'] = intrinsics.false;
    Desc['[[Configurable]]'] = intrinsics.false;

    $DefinePropertyOrThrow(ctx, F, intrinsics.$prototype, Desc);

    // 7. Return NormalCompletion(undefined).
  }

  // http://www.ecma-international.org/ecma-262/#sec-setfunctionname
  public SetFunctionName(
    ctx: ExecutionContext,
    name: $String | $Symbol,
    prefix?: $String,
  ): $Boolean {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Assert: F is an extensible object that does not have a name own property.
    // 2. Assert: Type(name) is either Symbol or String.
    // 3. Assert: If prefix is present, then Type(prefix) is String.
    // 4. If Type(name) is Symbol, then
    if (name.isSymbol) {
      // 4. a. Let description be name's [[Description]] value.
      const description = name.Description;

      // 4. b. If description is undefined, set name to the empty String.
      if (description.isUndefined) {
        name = intrinsics[''];
      }
      // 4. c. Else, set name to the string-concatenation of "[", description, and "]".
      else {
        name = new $String(realm, `[${description['[[Value]]']}]`);
      }
    }

    // 5. If prefix is present, then
    if (prefix !== void 0) {
      // 5. a. Set name to the string-concatenation of prefix, the code unit 0x0020 (SPACE), and name.
      name = new $String(realm, `${prefix['[[Value]]']} ${name['[[Value]]']}`);
    }

    // 6. Return ! DefinePropertyOrThrow(F, "name", PropertyDescriptor { [[Value]]: name, [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: true }).
    const Desc = new $PropertyDescriptor(realm, intrinsics.$prototype);
    Desc['[[Value]]'] = name;
    Desc['[[Writable]]'] = intrinsics.false;
    Desc['[[Enumerable]]'] = intrinsics.false;
    Desc['[[Configurable]]'] = intrinsics.true;

    return $DefinePropertyOrThrow(ctx, this, intrinsics.$name, Desc);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-ordinarycreatefromconstructor
function $OrdinaryCreateFromConstructor<T extends keyof Intrinsics = keyof Intrinsics, TSlots extends {} = {}>(
  ctx: ExecutionContext,
  constructor: $Object,
  intrinsicDefaultProto: T,
  internalSlotsList?: TSlots,
): $Object<T> & TSlots {
  // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
  // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
  const proto = $GetPrototypeFromConstructor(ctx, constructor, intrinsicDefaultProto);

  // 3. Return ObjectCreate(proto, internalSlotsList).
  return $Object.ObjectCreate(ctx, intrinsicDefaultProto, proto, internalSlotsList);
}


// http://www.ecma-international.org/ecma-262/#sec-getprototypefromconstructor
function $GetPrototypeFromConstructor<T extends keyof Intrinsics = keyof Intrinsics>(
  ctx: ExecutionContext,
  constructor: $Object,
  intrinsicDefaultProto: T,
): $Object {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
  // 2. Assert: IsCallable(constructor) is true.
  // 3. Let proto be ? Get(constructor, "prototype").
  let proto = $Get(ctx, constructor, intrinsics.$prototype);

  // 4. If Type(proto) is not Object, then
  if (!proto.isObject) {
    // 4. a. Let realm be ? GetFunctionRealm(constructor).
    // 4. b. Set proto to realm's intrinsic object named intrinsicDefaultProto.
    proto = intrinsics[intrinsicDefaultProto] as $AnyNonEmpty;
  }

  // 5. Return proto.
  return proto as $Object;
}

// http://www.ecma-international.org/ecma-262/#sec-prepareforordinarycall
function $PrepareForOrdinaryCall(
  ctx: ExecutionContext,
  F: $Function,
  newTarget: $Object | $Undefined,
): ExecutionContext {
  // 1. Assert: Type(newTarget) is Undefined or Object.
  // 2. Let callerContext be the running execution context.
  const callerContext = ctx;

  // 3. Let calleeContext be a new ECMAScript code execution context.
  const calleeContext = new ExecutionContext();

  // 4. Set the Function of calleeContext to F.
  calleeContext.Function = F;

  // 5. Let calleeRealm be F.[[Realm]].
  const calleeRealm = F['[[Realm]]'];

  // 6. Set the Realm of calleeContext to calleeRealm.
  calleeContext.Realm = calleeRealm;

  // 7. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
  callerContext.ScriptOrModule = F['[[ScriptOrModule]]'];

  // 8. Let localEnv be NewFunctionEnvironment(F, newTarget).
  const localEnv = new $FunctionEnvRec(F['[[ECMAScriptCode]]'].logger, calleeRealm, F, newTarget);

  // 9. Set the LexicalEnvironment of calleeContext to localEnv.
  calleeContext.LexicalEnvironment = localEnv;

  // 10. Set the VariableEnvironment of calleeContext to localEnv.
  callerContext.VariableEnvironment = localEnv;

  // 11. If callerContext is not already suspended, suspend callerContext.
  callerContext.suspend();

  // 12. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
  calleeRealm.stack.push(calleeContext);

  // 13. NOTE: Any exception objects produced after this point are associated with calleeRealm.
  // 14. Return calleeContext.
  return calleeContext;
}


// http://www.ecma-international.org/ecma-262/#sec-ordinarycallbindthis
function $OrdinaryCallBindThis(
  ctx: ExecutionContext,
  F: $Function,
  calleeContext: ExecutionContext,
  thisArgument: $AnyNonEmpty,
): $AnyNonEmpty {
  // 1. Let thisMode be F.[[ThisMode]].
  const thisMode = F['[[ThisMode]]'];

  // 2. If thisMode is lexical, return NormalCompletion(undefined).
  if (thisMode === 'lexical') {
    return new $Undefined(ctx.Realm);
  }

  // 3. Let calleeRealm be F.[[Realm]].'];
  const calleeRealm = F['[[Realm]]'];

  // 4. Let localEnv be the LexicalEnvironment of calleeContext.
  const localEnv = calleeContext.LexicalEnvironment;

  let thisValue: $AnyNonEmpty;
  // 5. If thisMode is strict, let thisValue be thisArgument.
  if (thisMode === 'strict') {
    thisValue = thisArgument;
  }
  // 6. Else,
  else {
    // 6. a. If thisArgument is undefined or null, then
    if (thisArgument.isNil) {
      // 6. a. i. Let globalEnv be calleeRealm.[[GlobalEnv]].
      // 6. a. ii. Let globalEnvRec be globalEnv's EnvironmentRecord.
      const globalEnvRec = calleeRealm['[[GlobalEnv]]'];

      // 6. a. iii. Assert: globalEnvRec is a global Environment Record.
      // 6. a. iv. Let thisValue be globalEnvRec.[[GlobalThisValue]].
      thisValue = globalEnvRec['[[GlobalThisValue]]'];
    }
    // 6. b. Else,
    else {
      // 6. b. i. Let thisValue be ! ToObject(thisArgument).
      thisValue = thisArgument.ToObject(ctx);

      // 6. b. ii. NOTE: ToObject produces wrapper objects using calleeRealm.
    }
  }

  // 7. Let envRec be localEnv's EnvironmentRecord.
  const envRec = localEnv as $FunctionEnvRec;

  // 8. Assert: envRec is a function Environment Record.
  // 9. Assert: The next step never returns an abrupt completion because envRec.[[ThisBindingStatus]] is not "initialized".

  // 10. Return envRec.BindThisValue(thisValue).
  return envRec.BindThisValue(ctx, thisValue);
}

export type FunctionKind = 'normal' | 'classConstructor' | 'generator' | 'async' | 'async generator';
export type ConstructorKind = 'base' | 'derived';
export type ThisMode = 'lexical' | 'strict' | 'global';

// http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects
export abstract class $BuiltinFunction<
  T extends string = string,
> extends $Function<T> {
  public readonly '<$BuiltinFunction>': unknown;

  public constructor(
    realm: Realm,
    IntrinsicName: T,
    proto: $Object = realm['[[Intrinsics]]']['%FunctionPrototype%'],
  ) {
    super(realm, IntrinsicName, proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects-call-thisargument-argumentslist
  public '[[Call]]'(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let callerContext be the running execution context.
    // 2. If callerContext is not already suspended, suspend callerContext.
    // 3. Let calleeContext be a new ECMAScript code execution context.
    const calleeContext = new ExecutionContext();

    // 4. Set the Function of calleeContext to F.
    calleeContext.Function = this;

    // 5. Let calleeRealm be F.[[Realm]].
    // 6. Set the Realm of calleeContext to calleeRealm.
    calleeContext.Realm = this['[[Realm]]'];;

    // 7. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
    calleeContext.ScriptOrModule = this['[[ScriptOrModule]]'];

    // 8. Perform any necessary implementation-defined initialization of calleeContext.
    // 9. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
    realm.stack.push(calleeContext);

    // 10. Let result be the Completion Record that is the result of evaluating F in an implementation-defined manner that conforms to the specification of F. thisArgument is the this value, argumentsList provides the named parameters, and the NewTarget value is undefined.
    const result = this.performSteps(calleeContext, thisArgument, argumentsList, intrinsics.undefined);

    // 11. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
    realm.stack.pop();

    // 12. Return result.
    return result;
  }

  // http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects-construct-argumentslist-newtarget
  public '[[Construct]]'(
    ctx: ExecutionContext,
    argumentsList: readonly $AnyNonEmpty[],
    newTarget: $Object,
  ): $Object {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let callerContext be the running execution context.
    // 2. If callerContext is not already suspended, suspend callerContext.
    // 3. Let calleeContext be a new ECMAScript code execution context.
    const calleeContext = new ExecutionContext();

    // 4. Set the Function of calleeContext to F.
    calleeContext.Function = this;

    // 5. Let calleeRealm be F.[[Realm]].
    // 6. Set the Realm of calleeContext to calleeRealm.
    calleeContext.Realm = this['[[Realm]]'];;

    // 7. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
    calleeContext.ScriptOrModule = this['[[ScriptOrModule]]'];

    // 8. Perform any necessary implementation-defined initialization of calleeContext.
    // 9. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
    realm.stack.push(calleeContext);

    // 10. Let result be the Completion Record that is the result of evaluating F in an implementation-defined manner that conforms to the specification of F. The this value is uninitialized, argumentsList provides the named parameters, and newTarget provides the NewTarget value.
    const result = this.performSteps(calleeContext, intrinsics.undefined, argumentsList, newTarget) as $Object;

    // 11. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
    realm.stack.pop();

    // 12. Return result.
    return result;
  }

  public abstract performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $AnyNonEmpty,
  ): $AnyNonEmpty;
}
