import { $Object, } from './object.js';
import { $FunctionEnvRec, } from './environment-record.js';
import { $String, } from './string.js';
import { $PropertyDescriptor, } from './property-descriptor.js';
import { $Number, } from './number.js';
import { $DefinePropertyOrThrow, } from '../operations.js';
import { $Undefined, } from './undefined.js';
import { ExecutionContext, } from '../realm.js';
import { $TypeError, } from './error.js';
import { getLineAndCharacterOfPosition } from 'typescript';
// http://www.ecma-international.org/ecma-262/#table-6
// http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects
export class $Function extends $Object {
    constructor(realm, IntrinsicName, proto) {
        super(realm, IntrinsicName, proto, 1 /* normal */, realm['[[Intrinsics]]'].empty);
    }
    get isFunction() { return true; }
    // For error stack trace
    toString() {
        const code = this['[[ECMAScriptCode]]'];
        const sourceFile = code.mos.node;
        const node = code.node;
        const path = code.path;
        const text = this['[[SourceText]]']['[[Value]]'];
        const firstLine = text.split(/\r?\n/)[0];
        let line = -1;
        let character = -1;
        if (node.pos > -1) {
            ({ line, character } = getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile)));
        }
        return `${firstLine}:${line + 1}:${character} (${path})`;
    }
    // http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects-call-thisargument-argumentslist
    // 9.2.1 [[Call]] ( thisArgument , argumentsList )
    '[[Call]]'(ctx, thisArgument, argumentsList) {
        // 1. Assert: F is an ECMAScript function object.
        const F = this;
        const realm = F['[[Realm]]'];
        const intrinsics = realm['[[Intrinsics]]'];
        // 2. If F.[[FunctionKind]] is "classConstructor", throw a TypeError exception.
        if (F['[[FunctionKind]]'] === 2 /* classConstructor */) {
            return new $TypeError(realm, `Cannot call classConstructor (${F.propertyMap.has('name') ? F.propertyDescriptors[F.propertyMap.get('name')]['[[Value]]'] : 'anonymous'}) as a function`);
        }
        // 3. Let callerContext be the running execution context.
        // 4. Let calleeContext be PrepareForOrdinaryCall(F, undefined).
        const calleeContext = $PrepareForOrdinaryCall(ctx, F, intrinsics.undefined);
        // 5. Assert: calleeContext is now the running execution context.
        // 6. Perform OrdinaryCallBindThis(F, calleeContext, thisArgument).
        $OrdinaryCallBindThis(ctx, F, calleeContext, thisArgument);
        // 7. Let result be OrdinaryCallEvaluateBody(F, argumentsList).
        const result = F['[[ECMAScriptCode]]'].EvaluateBody(calleeContext, F, argumentsList);
        // 8. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
        realm.stack.pop();
        ctx.resume();
        // 9. If result.[[Type]] is return, return NormalCompletion(result.[[Value]]).
        if (result['[[Type]]'] === 4 /* return */) {
            return result.ToCompletion(1 /* normal */, intrinsics.empty);
        }
        // 10. ReturnIfAbrupt(result).
        if (result.isAbrupt) {
            return result;
        }
        // 11. Return NormalCompletion(undefined).
        return new $Undefined(realm, 1 /* normal */, intrinsics.empty);
    }
    // http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects-construct-argumentslist-newtarget
    // 9.2.2 [[Construct]] ( argumentsList , newTarget )
    '[[Construct]]'(ctx, argumentsList, newTarget) {
        // 1. Assert: F is an ECMAScript function object.
        const F = this;
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        const stack = realm.stack;
        // 2. Assert: Type(newTarget) is Object.
        // 3. Let callerContext be the running execution context.
        // 4. Let kind be F.[[ConstructorKind]].
        const kind = F['[[ConstructorKind]]'];
        let thisArgument;
        // 5. If kind is "base", then
        if (kind === 'base') {
            // 5. a. Let thisArgument be ? OrdinaryCreateFromConstructor(newTarget, "%ObjectPrototype%").
            const $thisArgument = $OrdinaryCreateFromConstructor(ctx, newTarget, '%ObjectPrototype%');
            if ($thisArgument.isAbrupt) {
                return $thisArgument;
            }
            thisArgument = $thisArgument;
        }
        else {
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
        const result = F['[[ECMAScriptCode]]'].EvaluateBody(calleeContext, F, argumentsList);
        // 12. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
        stack.pop();
        ctx.resume();
        // 13. If result.[[Type]] is return, then
        if (result['[[Type]]'] === 4 /* return */) {
            // 13. a. If Type(result.[[Value]]) is Object, return NormalCompletion(result.[[Value]]).
            if (result.isObject) {
                return result.ToCompletion(1 /* normal */, intrinsics.empty);
            }
            // 13. b. If kind is "base", return NormalCompletion(thisArgument).
            if (kind === 'base') {
                return thisArgument.ToCompletion(1 /* normal */, intrinsics.empty);
            }
            // 13. c. If result.[[Value]] is not undefined, throw a TypeError exception.
            if (!result.isUndefined) {
                return new $TypeError(realm, `base constructor for ${F.propertyMap.has('name') ? F.propertyDescriptors[F.propertyMap.get('name')]['[[Value]]'] : 'anonymous'} returned ${result}, but expected undefined`);
            }
        }
        // 14. Else, ReturnIfAbrupt(result).
        else {
            if (result.isAbrupt) {
                return result;
            }
        }
        // 15. Return ? envRec.GetThisBinding().
        return envRec.GetThisBinding(ctx);
    }
    // http://www.ecma-international.org/ecma-262/#sec-functionallocate
    // 9.2.3 FunctionAllocate ( functionPrototype , strict , functionKind )
    static FunctionAllocate(ctx, functionPrototype, strict, functionKind) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Assert: Type(functionPrototype) is Object.
        // 2. Assert: functionKind is either "normal", "non-constructor", "generator", "async", or "async generator".
        // 3. If functionKind is "normal", let needsConstruct be true.
        // 4. Else, let needsConstruct be false.
        const needsConstruct = functionKind === 0 /* normal */;
        // 5. If functionKind is "non-constructor", set functionKind to "normal".
        if (functionKind === 1 /* nonConstructor */) {
            functionKind = 0 /* normal */;
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
    // 9.2.4 FunctionInitialize ( F , kind , ParameterList , Body , Scope )
    static FunctionInitialize(ctx, F, kind, code, Scope) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let len be the ExpectedArgumentCount of ParameterList.
        const len = code.$parameters.ExpectedArgumentCount;
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
        F['[[ECMAScriptCode]]'] = code;
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
    // 9.2.5 FunctionCreate ( kind , ParameterList , Body , Scope , Strict [ , prototype ] )
    static FunctionCreate(ctx, kind, code, Scope, Strict, prototype) {
        code.logger.debug(`$Function.FunctionCreate(#${ctx.id}, ${JSON.stringify(kind)})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. If prototype is not present, then
        if (prototype === void 0) {
            // 1. a. Set prototype to the intrinsic object %FunctionPrototype%.
            prototype = intrinsics['%FunctionPrototype%'];
        }
        let allocKind;
        // 2. If kind is not Normal, let allocKind be "non-constructor".
        if (kind !== 'normal') {
            allocKind = 1 /* nonConstructor */;
        }
        // 3. Else, let allocKind be "normal".
        else {
            allocKind = 0 /* normal */;
        }
        // 4. Let F be FunctionAllocate(prototype, Strict, allocKind).
        const F = this.FunctionAllocate(ctx, prototype, Strict, allocKind);
        // 5. Return FunctionInitialize(F, kind, ParameterList, Body, Scope).
        return this.FunctionInitialize(ctx, F, kind, code, Scope);
    }
    // http://www.ecma-international.org/ecma-262/#sec-generatorfunctioncreate
    // 9.2.6 GeneratorFunctionCreate ( kind , ParameterList , Body , Scope , Strict )
    static GeneratorFunctionCreate(ctx, kind, code, Scope, Strict) {
        code.logger.debug(`$Function.GeneratorFunctionCreate(#${ctx.id}, ${JSON.stringify(kind)})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let functionPrototype be the intrinsic object %Generator%.
        const functionPrototype = intrinsics['%Generator%'];
        // 2. Let F be FunctionAllocate(functionPrototype, Strict, "generator").
        const F = this.FunctionAllocate(ctx, functionPrototype, Strict, 4 /* generator */);
        // 3. Return FunctionInitialize(F, kind, ParameterList, Body, Scope).
        return this.FunctionInitialize(ctx, F, kind, code, Scope);
    }
    // http://www.ecma-international.org/ecma-262/#sec-asyncgeneratorfunctioncreate
    // 9.2.7 AsyncGeneratorFunctionCreate ( kind , ParameterList , Body , Scope , Strict )
    static AsyncGeneratorFunctionCreate(ctx, kind, code, Scope, Strict) {
        code.logger.debug(`$Function.AsyncGeneratorFunctionCreate(#${ctx.id}, ${JSON.stringify(kind)})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let functionPrototype be the intrinsic object %AsyncGenerator%.
        const functionPrototype = intrinsics['%AsyncGenerator%'];
        // 2. Let F be ! FunctionAllocate(functionPrototype, Strict, "generator").
        const F = this.FunctionAllocate(ctx, functionPrototype, Strict, 4 /* generator */);
        // 3. Return ! FunctionInitialize(F, kind, ParameterList, Body, Scope).
        return this.FunctionInitialize(ctx, F, kind, code, Scope);
    }
    // http://www.ecma-international.org/ecma-262/#sec-async-functions-abstract-operations-async-function-create
    // 9.2.8 AsyncFunctionCreate ( kind , parameters , body , Scope , Strict )
    static AsyncFunctionCreate(ctx, kind, code, Scope, Strict) {
        code.logger.debug(`$Function.AsyncFunctionCreate(#${ctx.id}, ${JSON.stringify(kind)})`);
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let functionPrototype be the intrinsic object %AsyncFunctionPrototype%.
        const functionPrototype = intrinsics['%AsyncFunctionPrototype%'];
        // 2. Let F be ! FunctionAllocate(functionPrototype, Strict, "async").
        const F = this.FunctionAllocate(ctx, functionPrototype, Strict, 8 /* async */);
        // 3. Return ! FunctionInitialize(F, kind, parameters, body, Scope).
        return this.FunctionInitialize(ctx, F, kind, code, Scope);
    }
    // http://www.ecma-international.org/ecma-262/#sec-makeconstructor
    // 9.2.10 MakeConstructor ( F [ , writablePrototype [ , prototype ] ] )
    MakeConstructor(ctx, writablePrototype, prototype) {
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
        return intrinsics.undefined;
    }
    // http://www.ecma-international.org/ecma-262/#sec-setfunctionname
    // 9.2.13 SetFunctionName ( F , name [ , prefix ] )
    SetFunctionName(ctx, name, prefix) {
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
        const Desc = new $PropertyDescriptor(realm, intrinsics.$name);
        Desc['[[Value]]'] = name;
        Desc['[[Writable]]'] = intrinsics.false;
        Desc['[[Enumerable]]'] = intrinsics.false;
        Desc['[[Configurable]]'] = intrinsics.true;
        return $DefinePropertyOrThrow(ctx, this, intrinsics.$name, Desc);
    }
}
// http://www.ecma-international.org/ecma-262/#sec-ordinarycreatefromconstructor
export function $OrdinaryCreateFromConstructor(ctx, constructor, intrinsicDefaultProto, internalSlotsList) {
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
    // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
    const proto = $GetPrototypeFromConstructor(ctx, constructor, intrinsicDefaultProto);
    if (proto.isAbrupt) {
        return proto;
    }
    // 3. Return ObjectCreate(proto, internalSlotsList).
    return $Object.ObjectCreate(ctx, intrinsicDefaultProto, proto, internalSlotsList);
}
// http://www.ecma-international.org/ecma-262/#sec-getprototypefromconstructor
export function $GetPrototypeFromConstructor(ctx, constructor, intrinsicDefaultProto) {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
    // 2. Assert: IsCallable(constructor) is true.
    // 3. Let proto be ? Get(constructor, "prototype").
    let proto = constructor['[[Get]]'](ctx, intrinsics.$prototype, constructor);
    if (proto.isAbrupt) {
        return proto;
    }
    // 4. If Type(proto) is not Object, then
    if (!proto.isObject) {
        // 4. a. Let realm be ? GetFunctionRealm(constructor).
        // 4. b. Set proto to realm's intrinsic object named intrinsicDefaultProto.
        proto = intrinsics[intrinsicDefaultProto];
    }
    // 5. Return proto.
    return proto;
}
// http://www.ecma-international.org/ecma-262/#sec-prepareforordinarycall
function $PrepareForOrdinaryCall(ctx, F, newTarget) {
    // 1. Assert: Type(newTarget) is Undefined or Object.
    // 2. Let callerContext be the running execution context.
    const callerContext = ctx;
    // 3. Let calleeContext be a new ECMAScript code execution context.
    const calleeRealm = F['[[Realm]]'];
    const calleeContext = new ExecutionContext(calleeRealm);
    // 4. Set the Function of calleeContext to F.
    calleeContext.Function = F;
    // 5. Let calleeRealm be F.[[Realm]].
    // 6. Set the Realm of calleeContext to calleeRealm.
    // 7. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
    calleeContext.ScriptOrModule = F['[[ScriptOrModule]]'];
    // 8. Let localEnv be NewFunctionEnvironment(F, newTarget).
    const localEnv = new $FunctionEnvRec(F['[[ECMAScriptCode]]'].logger, calleeRealm, F, newTarget);
    // 9. Set the LexicalEnvironment of calleeContext to localEnv.
    calleeContext.LexicalEnvironment = localEnv;
    // 10. Set the VariableEnvironment of calleeContext to localEnv.
    calleeContext.VariableEnvironment = localEnv;
    // 11. If callerContext is not already suspended, suspend callerContext.
    if (!callerContext.suspended) {
        callerContext.suspend();
    }
    // 12. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
    calleeRealm.stack.push(calleeContext);
    // 13. NOTE: Any exception objects produced after this point are associated with calleeRealm.
    // 14. Return calleeContext.
    return calleeContext;
}
// http://www.ecma-international.org/ecma-262/#sec-ordinarycallbindthis
function $OrdinaryCallBindThis(ctx, F, calleeContext, thisArgument) {
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
    let thisValue;
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
    const envRec = localEnv;
    // 8. Assert: envRec is a function Environment Record.
    // 9. Assert: The next step never returns an abrupt completion because envRec.[[ThisBindingStatus]] is not "initialized".
    // 10. Return envRec.BindThisValue(thisValue).
    return envRec.BindThisValue(ctx, thisValue);
}
// http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects
export class $BuiltinFunction extends $Function {
    // http://www.ecma-international.org/ecma-262/#sec-createbuiltinfunction
    // 9.3.3 CreateBuiltinFunction ( steps , internalSlotsList [ , realm [ , prototype ] ] )
    constructor(realm, IntrinsicName, proto) {
        super(realm, IntrinsicName, proto);
        // 1. Assert: steps is either a set of algorithm steps or other definition of a function's behaviour provided in this specification.
        // 2. If realm is not present, set realm to the current Realm Record.
        // 3. Assert: realm is a Realm Record.
        // 4. If prototype is not present, set prototype to realm.[[Intrinsics]].[[%FunctionPrototype%]].
        // 5. Let func be a new built-in function object that when called performs the action described by steps. The new function object has internal slots whose names are the elements of internalSlotsList. The initial value of each of those internal slots is undefined.
        // 6. Set func.[[Realm]] to realm.
        this['[[Realm]]'] = realm;
        // 7. Set func.[[Prototype]] to prototype. // done by $Object
        // 8. Set func.[[Extensible]] to true. // done by $Object
        // 9. Set func.[[ScriptOrModule]] to null.
        this['[[ScriptOrModule]]'] = realm['[[Intrinsics]]'].null;
        // 10. Return func.
    }
    // http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects-call-thisargument-argumentslist
    // 9.3.1 [[Call]] ( thisArgument , argumentsList )
    '[[Call]]'(ctx, thisArgument, argumentsList) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let callerContext be the running execution context.
        const callerContext = ctx;
        // 2. If callerContext is not already suspended, suspend callerContext.
        if (!callerContext.suspended) {
            callerContext.suspend();
        }
        // 3. Let calleeContext be a new ECMAScript code execution context.
        const calleeRealm = this['[[Realm]]'];
        const calleeContext = new ExecutionContext(calleeRealm);
        // 4. Set the Function of calleeContext to F.
        calleeContext.Function = this;
        // 5. Let calleeRealm be F.[[Realm]].
        // 6. Set the Realm of calleeContext to calleeRealm.
        // 7. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
        calleeContext.ScriptOrModule = this['[[ScriptOrModule]]'];
        // 8. Perform any necessary implementation-defined initialization of calleeContext.
        // 9. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
        realm.stack.push(calleeContext);
        // 10. Let result be the Completion Record that is the result of evaluating F in an implementation-defined manner that conforms to the specification of F. thisArgument is the this value, argumentsList provides the named parameters, and the NewTarget value is undefined.
        const result = this.performSteps(calleeContext, thisArgument, argumentsList, intrinsics.undefined);
        // 11. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
        realm.stack.pop();
        callerContext.resume();
        // 12. Return result.
        return result;
    }
    // http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects-construct-argumentslist-newtarget
    // 9.3.2 [[Construct]] ( argumentsList , newTarget )
    '[[Construct]]'(ctx, argumentsList, newTarget) {
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // 1. Let callerContext be the running execution context.
        const callerContext = ctx;
        // 2. If callerContext is not already suspended, suspend callerContext.
        if (!callerContext.suspended) {
            callerContext.suspend();
        }
        // 3. Let calleeContext be a new ECMAScript code execution context.
        const calleeRealm = this['[[Realm]]'];
        const calleeContext = new ExecutionContext(calleeRealm);
        // 4. Set the Function of calleeContext to F.
        calleeContext.Function = this;
        // 5. Let calleeRealm be F.[[Realm]].
        // 6. Set the Realm of calleeContext to calleeRealm.
        // 7. Set the ScriptOrModule of calleeContext to F.[[ScriptOrModule]].
        calleeContext.ScriptOrModule = this['[[ScriptOrModule]]'];
        // 8. Perform any necessary implementation-defined initialization of calleeContext.
        // 9. Push calleeContext onto the execution context stack; calleeContext is now the running execution context.
        realm.stack.push(calleeContext);
        // 10. Let result be the Completion Record that is the result of evaluating F in an implementation-defined manner that conforms to the specification of F. The this value is uninitialized, argumentsList provides the named parameters, and newTarget provides the NewTarget value.
        const result = this.performSteps(calleeContext, intrinsics.undefined, argumentsList, newTarget);
        // 11. Remove calleeContext from the execution context stack and restore callerContext as the running execution context.
        realm.stack.pop();
        callerContext.resume();
        // 12. Return result.
        return result;
    }
}
//# sourceMappingURL=function.js.map