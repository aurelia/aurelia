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
  $ESModule,
} from '../ast/modules';
import {
  Context,
  FunctionKind,
} from '../ast/_shared';
import {
  $Boolean,
} from '../types/boolean';
import {
  $PropertyDescriptor,
} from '../types/property-descriptor';
import {
  $CreateDynamicFunction,
  $FunctionPrototype,
  $FunctionConstructor,
} from './function';
import {
  $IteratorPrototype,
} from './iteration';
import {
  $Number,
} from '../types/number';

// http://www.ecma-international.org/ecma-262/#sec-generatorfunction-objects
// 25.2 GeneratorFunction Objects

// http://www.ecma-international.org/ecma-262/#sec-generatorfunction-constructor
// #region 25.2.1 The GeneratorFunction Constructor
export class $GeneratorFunctionConstructor extends $BuiltinFunction<'%GeneratorFunction%'> {
  // http://www.ecma-international.org/ecma-262/#sec-generatorfunction.prototype
  // 25.2.2.2 GeneratorFunction.prototype
  public get $prototype(): $GeneratorFunctionPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $GeneratorFunctionPrototype;
  }
  public set $prototype(value: $GeneratorFunctionPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generatorfunction.length
  // 25.2.2.1 GeneratorFunction.length
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
    super(realm, '%GeneratorFunction%', functionConstructor);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generatorfunction
  // 25.2.1.1 GeneratorFunction ( p1 , p2 , … , pn , body )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    // 1. Let C be the active function object.
    // 2. Let args be the argumentsList that was passed to this function by [[Call]] or [[Construct]].
    // 3. Return ? CreateDynamicFunction(C, NewTarget, "generator", args).
    return $CreateDynamicFunction(ctx, this, NewTarget, FunctionKind.generator, argumentsList);
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-generatorfunction-prototype-object
// #region 25.2.3 Properties of the GeneratorFunction Prototype Object
export class $GeneratorFunctionPrototype extends $Object<'%Generator%'> {
  // http://www.ecma-international.org/ecma-262/#sec-generatorfunction.prototype.constructor
  // 25.2.3.1 GeneratorFunction.prototype.constructor
  public get $constructor(): $GeneratorFunctionConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $GeneratorFunctionConstructor;
  }
  public set $constructor(value: $GeneratorFunctionConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generatorfunction.prototype.prototype
  // 25.2.3.2 GeneratorFunction.prototype.prototype
  public get $prototype(): $GeneratorPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $GeneratorPrototype;
  }
  public set $prototype(value: $GeneratorPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generatorfunction.prototype-@@tostringtag
  // 25.2.3.3 GeneratorFunction.prototype [ @@toStringTag ]
  public get '@@toStringTag'(): $String<'GeneratorFunction'> {
    return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'] as $String<'GeneratorFunction'>;
  }
  public set '@@toStringTag'(value: $String<'GeneratorFunction'>) {
    this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%Generator%', functionPrototype, CompletionType.normal, intrinsics.empty);
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-generatorfunction-instances
// #region 25.2.4 GeneratorFunction Instances

// http://www.ecma-international.org/ecma-262/#sec-generatorfunction-instances-length
// 25.2.4.1 length

// http://www.ecma-international.org/ecma-262/#sec-generatorfunction-instances-name
// 25.2.4.2 name

// http://www.ecma-international.org/ecma-262/#sec-generatorfunction-instances-prototype
// 25.2.4.3 prototype

// #endregion


// http://www.ecma-international.org/ecma-262/#sec-generator-objects
// 25.4 Generator Objects

// http://www.ecma-international.org/ecma-262/#sec-properties-of-generator-prototype
// #region 25.4.1 Properties of the Generator Prototype Object
export class $GeneratorPrototype extends $Object<'%GeneratorPrototype%'> {
  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.constructor
  // 25.4.1.1 Generator.prototype.constructor
  public get $constructor(): $GeneratorFunctionPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $GeneratorFunctionPrototype;
  }
  public set $constructor(value: $GeneratorFunctionPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value, false, false, true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.next
  // 25.4.1.2 Generator.prototype.next ( value )
  public get next(): $GeneratorPrototype_next {
    return this.getProperty(this.realm['[[Intrinsics]]'].next)['[[Value]]'] as $GeneratorPrototype_next;
  }
  public set next(value: $GeneratorPrototype_next) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].next, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.return
  // 25.4.1.3 Generator.prototype.return ( value )
  public get return(): $GeneratorPrototype_return {
    return this.getProperty(this.realm['[[Intrinsics]]'].return)['[[Value]]'] as $GeneratorPrototype_return;
  }
  public set return(value: $GeneratorPrototype_return) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].return, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.throw
  // 25.4.1.4 Generator.prototype.throw ( exception )
  public get throw(): $GeneratorPrototype_throw {
    return this.getProperty(this.realm['[[Intrinsics]]'].throw)['[[Value]]'] as $GeneratorPrototype_throw;
  }
  public set throw(value: $GeneratorPrototype_throw) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].throw, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype-@@tostringtag
  // 25.4.1.5 Generator.prototype [ @@toStringTag ]
  public get '@@toStringTag'(): $String<'Generator'> {
    return this.getProperty(this.realm['[[Intrinsics]]']['@@toStringTag'])['[[Value]]'] as $String<'Generator'>;
  }
  public set '@@toStringTag'(value: $String<'Generator'>) {
    this.setDataProperty(this.realm['[[Intrinsics]]']['@@toStringTag'], value, false, false, true);
  }

  public constructor(
    realm: Realm,
    iteratorPrototype: $IteratorPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%GeneratorPrototype%', iteratorPrototype, CompletionType.normal, intrinsics.empty);
  }

}

export class $GeneratorPrototype_next extends $BuiltinFunction<'Generator.prototype.next'> {
  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.next
  // 25.4.1.2 Generator.prototype.next ( value )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [value]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    // 1. Let g be the this value.
    // 2. Return ? GeneratorResume(g, value).
    return null as any;
  }
}

export class $GeneratorPrototype_return extends $BuiltinFunction<'Generator.prototype.return'> {
  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.return
  // 25.4.1.3 Generator.prototype.return ( value )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [value]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    // 1. Let g be the this value.
    // 2. Let C be Completion { [[Type]]: return, [[Value]]: value, [[Target]]: empty }.
    // 3. Return ? GeneratorResumeAbrupt(g, C).
    return null as any;
  }
}

export class $GeneratorPrototype_throw extends $BuiltinFunction<'Generator.prototype.throw'> {
  // http://www.ecma-international.org/ecma-262/#sec-generator.prototype.throw
  // 25.4.1.4 Generator.prototype.throw ( exception )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [exception]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    // 1. Let g be the this value.
    // 2. Let C be ThrowCompletion(exception).
    // 3. Return ? GeneratorResumeAbrupt(g, C).
    return null as any;
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-generator-instances
// 25.4.2 Properties of Generator Instances

// http://www.ecma-international.org/ecma-262/#sec-generator-abstract-operations
// #region 25.4.3 Generator Abstract Operations

// http://www.ecma-international.org/ecma-262/#sec-generatorstart
// 25.4.3.1 GeneratorStart ( generator , generatorBody )
export function $GeneratorStart(
  ctx: ExecutionContext,
  generator: any,
  generatorBody: any,
): any {
  // 1. Assert: The value of generator.[[GeneratorState]] is undefined.
  // 2. Let genContext be the running execution context.
  // 3. Set the Generator component of genContext to generator.
  // 4. Set the code evaluation state of genContext such that when evaluation is resumed for that execution context the following steps will be performed:
    // 4. a. Let result be the result of evaluating generatorBody.
    // 4. b. Assert: If we return here, the generator either threw an exception or performed either an implicit or explicit return.
    // 4. c. Remove genContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
    // 4. d. Set generator.[[GeneratorState]] to "completed".
    // 4. e. Once a generator enters the "completed" state it never leaves it and its associated execution context is never resumed. Any execution state associated with generator can be discarded at this point.
    // 4. f. If result.[[Type]] is normal, let resultValue be undefined.
    // 4. g. Else if result.[[Type]] is return, let resultValue be result.[[Value]].
    // 4. h. Else,
      // 4. h. i. Assert: result.[[Type]] is throw.
      // 4. h. ii. Return Completion(result).
    // 4. i. Return CreateIterResultObject(resultValue, true).
  // 5. Set generator.[[GeneratorContext]] to genContext.
  // 6. Set generator.[[GeneratorState]] to "suspendedStart".
  // 7. Return NormalCompletion(undefined).
}

// http://www.ecma-international.org/ecma-262/#sec-generatorvalidate
// 25.4.3.2 GeneratorValidate ( generator )
export function $GeneratorValidate(
  ctx: ExecutionContext,
  generator: any,
): any {
  // 1. If Type(generator) is not Object, throw a TypeError exception.
  // 2. If generator does not have a [[GeneratorState]] internal slot, throw a TypeError exception.
  // 3. Assert: generator also has a [[GeneratorContext]] internal slot.
  // 4. Let state be generator.[[GeneratorState]].
  // 5. If state is "executing", throw a TypeError exception.
  // 6. Return state.
}

// http://www.ecma-international.org/ecma-262/#sec-generatorresume
// 25.4.3.3 GeneratorResume ( generator , value )
export function $GeneratorResume(
  ctx: ExecutionContext,
  generator: any,
  value: any,
): any {
  // 1. Let state be ? GeneratorValidate(generator).
  // 2. If state is "completed", return CreateIterResultObject(undefined, true).
  // 3. Assert: state is either "suspendedStart" or "suspendedYield".
  // 4. Let genContext be generator.[[GeneratorContext]].
  // 5. Let methodContext be the running execution context.
  // 6. Suspend methodContext.
  // 7. Set generator.[[GeneratorState]] to "executing".
  // 8. Push genContext onto the execution context stack; genContext is now the running execution context.
  // 9. Resume the suspended evaluation of genContext using NormalCompletion(value) as the result of the operation that suspended it. Let result be the value returned by the resumed computation.
  // 10. Assert: When we return here, genContext has already been removed from the execution context stack and methodContext is the currently running execution context.
  // 11. Return Completion(result).
}

// http://www.ecma-international.org/ecma-262/#sec-generatorresumeabrupt
// 25.4.3.4 GeneratorResumeAbrupt ( generator , abruptCompletion )
export function $GeneratorResumeAbrupt(
  ctx: ExecutionContext,
  generator: any,
  abruptCompletion: any,
): any {
  // 1. Let state be ? GeneratorValidate(generator).
  // 2. If state is "suspendedStart", then
    // 2. a. Set generator.[[GeneratorState]] to "completed".
    // 2. b. Once a generator enters the "completed" state it never leaves it and its associated execution context is never resumed. Any execution state associated with generator can be discarded at this point.
    // 2. c. Set state to "completed".
  // 3. If state is "completed", then
    // 3. a. If abruptCompletion.[[Type]] is return, then
      // 3. a. i. Return CreateIterResultObject(abruptCompletion.[[Value]], true).
    // 3. b. Return Completion(abruptCompletion).
  // 4. Assert: state is "suspendedYield".
  // 5. Let genContext be generator.[[GeneratorContext]].
  // 6. Let methodContext be the running execution context.
  // 7. Suspend methodContext.
  // 8. Set generator.[[GeneratorState]] to "executing".
  // 9. Push genContext onto the execution context stack; genContext is now the running execution context.
  // 10. Resume the suspended evaluation of genContext using abruptCompletion as the result of the operation that suspended it. Let result be the completion record returned by the resumed computation.
  // 11. Assert: When we return here, genContext has already been removed from the execution context stack and methodContext is the currently running execution context.
  // 12. Return Completion(result).
}

// http://www.ecma-international.org/ecma-262/#sec-getgeneratorkind
// 25.4.3.5 GetGeneratorKind ( )
export function $GetGeneratorKind(
  ctx: ExecutionContext,
): any {
  // 1. Let genContext be the running execution context.
  // 2. If genContext does not have a Generator component, return non-generator.
  // 3. Let generator be the Generator component of genContext.
  // 4. If generator has an [[AsyncGeneratorState]] internal slot, return async.
  // 5. Else, return sync.
}

// http://www.ecma-international.org/ecma-262/#sec-generatoryield
// 25.4.3.6 GeneratorYield ( iterNextObj )
export function $GeneratorYield(
  ctx: ExecutionContext,
  iterNextObj: any,
): any {
  // 1. Assert: iterNextObj is an Object that implements the IteratorResult interface.
  // 2. Let genContext be the running execution context.
  // 3. Assert: genContext is the execution context of a generator.
  // 4. Let generator be the value of the Generator component of genContext.
  // 5. Assert: GetGeneratorKind() is sync.
  // 6. Set generator.[[GeneratorState]] to "suspendedYield".
  // 7. Remove genContext from the execution context stack and restore the execution context that is at the top of the execution context stack as the running execution context.
  // 8. Set the code evaluation state of genContext such that when evaluation is resumed with a Completion resumptionValue the following steps will be performed:
    // 8. a. Return resumptionValue.
    // 8. b. NOTE: This returns to the evaluation of the YieldExpression that originally called this abstract operation.
  // 9. Return NormalCompletion(iterNextObj).
  // 10. NOTE: This returns to the evaluation of the operation that had most previously resumed evaluation of genContext.
}

// #endregion

