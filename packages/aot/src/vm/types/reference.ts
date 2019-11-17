import { Realm, ExecutionContext } from '../realm';
import { $Object } from './object';
import { $Boolean } from './boolean';
import { $String } from './string';
import { $Symbol } from './symbol';
import { $Number } from './number';
import { $EnvRec } from './environment-record';
import { $Undefined } from './undefined';
import { $AnyNonEmpty } from './_shared';
import { $Empty } from './empty';
import { $Set } from '../operations';


// http://www.ecma-international.org/ecma-262/#sec-reference-specification-type
export class $Reference {
  public readonly '<$Reference>': unknown;

  public constructor(
    public readonly realm: Realm,
    public readonly baseValue: $Object | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined,
    public readonly referencedName: $String,
    public readonly strict: $Boolean,
    public readonly thisValue: $Object | $Boolean | $String | $Symbol | $Number | $Undefined,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-getbase
  public GetBase(): $Object | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined {
    // 1. Assert: Type(V) is Reference.
    // 2. Return the base value component of V.
    return this.baseValue;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getreferencedname
  public GetReferencedName(): $String {
    // 1. Assert: Type(V) is Reference.
    // 2. Return the referenced name component of V.
    return this.referencedName;
  }

  // http://www.ecma-international.org/ecma-262/#sec-isstrictreference
  public IsStrictReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. Return the strict reference flag of V.
    return this.strict;
  }

  // http://www.ecma-international.org/ecma-262/#sec-hasprimitivebase
  public HasPrimitiveBase(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If Type(V's base value component) is Boolean, String, Symbol, or Number, return true; otherwise return false.
    if (this.baseValue.isPrimitive && !this.baseValue.isUndefined) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ispropertyreference
  public IsPropertyReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If either the base value component of V is an Object or HasPrimitiveBase(V) is true, return true; otherwise return false.
    if (this.baseValue.isObject || this.HasPrimitiveBase().isTruthy) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-isunresolvablereference
  public IsUnresolvableReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If the base value component of V is undefined, return true; otherwise return false.
    if (this.baseValue.isUndefined) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-issuperreference
  public IsSuperReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If V has a thisValue component, return true; otherwise return false.
    if (!this.thisValue.isUndefined) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getvalue
  public GetValue(
    ctx: ExecutionContext,
  ): $AnyNonEmpty {
    // 1. ReturnIfAbrupt(V).
    // 2. If Type(V) is not Reference, return V.
    // 3. Let base be GetBase(V).
    let base = this.GetBase();

    // 4. If IsUnresolvableReference(V) is true, throw a ReferenceError exception.
    if (this.IsUnresolvableReference().isTruthy) {
      throw new ReferenceError(`4. If IsUnresolvableReference(V) is true, throw a ReferenceError exception.`);
    }

    // 5. If IsPropertyReference(V) is true, then
    if (this.IsPropertyReference().isTruthy) {
      // 5. a. If HasPrimitiveBase(V) is true, then
      if (this.HasPrimitiveBase().isTruthy) {
        // 5. a. i. Assert: In this case, base will never be undefined or null.
        // 5. a. ii. Set base to ! ToObject(base).
        base = (base as $Boolean | $String | $Symbol | $Number).ToObject(ctx);
      }

      // 5. b. Return ? base.[[Get]](GetReferencedName(V), GetThisValue(V)).
      return (base as $Object)['[[Get]]'](ctx, this.GetReferencedName(), this.GetThisValue());
    }
    // 6. Else base must be an Environment Record,
    else {
      // 6. a. Return ? base.GetBindingValue(GetReferencedName(V), IsStrictReference(V)) (see 8.1.1).
      return (base as $EnvRec).GetBindingValue(ctx, this.GetReferencedName(), this.IsStrictReference());
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-putvalue
  public PutValue(
    ctx: ExecutionContext,
    W: $AnyNonEmpty,
  ): $Boolean | $Empty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. ReturnIfAbrupt(V).
    // 2. ReturnIfAbrupt(W).
    // 3. If Type(V) is not Reference, throw a ReferenceError exception.
    // 4. Let base be GetBase(V).
    let base = this.GetBase();

    // 5. If IsUnresolvableReference(V) is true, then
    if (this.IsUnresolvableReference().isTruthy) {
      // 5. a. If IsStrictReference(V) is true, then
      if (this.IsStrictReference().isTruthy) {
        // 5. a. i. Throw a ReferenceError exception.
        throw new ReferenceError();
      }

      // 5. b. Let globalObj be GetGlobalObject().
      const globalObj = realm['[[GlobalObject]]'];

      // 5. c. Return ? Set(globalObj, GetReferencedName(V), W, false).
      return $Set(ctx, globalObj, this.GetReferencedName(), W, intrinsics.false);
    }
    // 6. Else if IsPropertyReference(V) is true, then
    else if (this.IsPropertyReference().isTruthy) {
      // 6. a. If HasPrimitiveBase(V) is true, then
      if (this.HasPrimitiveBase().isTruthy) {
        // 6. a. i. Assert: In this case, base will never be undefined or null.
        // 6. a. ii. Set base to ! ToObject(base).
        base = (base as $Boolean | $String | $Symbol | $Number).ToObject(ctx);
      }

      // 6. b. Let succeeded be ? base.[[Set]](GetReferencedName(V), W, GetThisValue(V)).
      const succeeded = (base as $Object)['[[Set]]'](ctx, this.GetReferencedName(), W, this.GetThisValue() as $Object);

      // 6. c. If succeeded is false and IsStrictReference(V) is true, throw a TypeError exception.
      if (succeeded.isFalsey && this.IsStrictReference().isTruthy) {
        throw new TypeError();
      }

      // 6. d. Return.
      return intrinsics.empty;
    }
    // 7. Else base must be an Environment Record,
    else {
      // 7. a. Return ? base.SetMutableBinding(GetReferencedName(V), W, IsStrictReference(V)) (see 8.1.1).
      return (base as $EnvRec).SetMutableBinding(ctx, this.GetReferencedName(), W, this.IsStrictReference());
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-getthisvalue
  public GetThisValue(): $Object | $Boolean | $String | $Symbol | $Number {
    // 1. Assert: IsPropertyReference(V) is true.
    // 2. If IsSuperReference(V) is true, then
    if (this.IsSuperReference().isTruthy) {
      // 2. a. Return the value of the thisValue component of the reference V.
      return this.thisValue as $Object | $Boolean | $String | $Symbol | $Number;
    }

    // 3. Return GetBase(V).
    return this.GetBase() as $Object | $Boolean | $String | $Symbol | $Number;
  }

  // http://www.ecma-international.org/ecma-262/#sec-initializereferencedbinding
  public InitializeReferencedBinding(
    ctx: ExecutionContext,
    W: $AnyNonEmpty,
  ): $Boolean | $Empty {
    // 1. ReturnIfAbrupt(V).
    // 2. ReturnIfAbrupt(W).
    // 3. Assert: Type(V) is Reference.
    // 4. Assert: IsUnresolvableReference(V) is false.
    // 5. Let base be GetBase(V).
    const base = this.GetBase();

    // 6. Assert: base is an Environment Record.
    // 7. Return base.InitializeBinding(GetReferencedName(V), W).
    return (base as $EnvRec).InitializeBinding(ctx, this.GetReferencedName(), W);
  }
}
