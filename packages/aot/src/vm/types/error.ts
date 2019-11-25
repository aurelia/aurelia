import {
  nextValueId,
  CompletionTarget,
  CompletionType,
  $AnyNonError,
  PotentialNonEmptyCompletionType,
  $Any,
} from './_shared';
import {
  Realm,
  ExecutionContext,
} from '../realm';

export abstract class $Error<T extends Error = Error, N extends string = string> {
  public readonly '<$Error>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: N;

  public readonly '[[Type]]': CompletionType.throw = CompletionType.throw;
  public readonly '[[Value]]': T;
  public readonly '[[Target]]': CompletionTarget;

  public get isAbrupt(): true { return true; }
  public get isEmpty(): false { return false; }
  public get hasValue(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    err: T,
    intrinsicName: N,
    // TODO: add contextual info
  ) {
    this.IntrinsicName = intrinsicName;
    this['[[Value]]'] = err;
    this['[[Target]]'] = realm['[[Intrinsics]]'].empty;
  }

  public is(other: $AnyNonError): boolean {
    return other instanceof $Error && other.id === this.id;
  }

  public ToCompletion(
    type: PotentialNonEmptyCompletionType,
    target: CompletionTarget,
  ): this {
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getvalue
  // 6.2.4.8 GetValue ( V )
  public GetValue(ctx: ExecutionContext): this {
    // 1. ReturnIfAbrupt(V)
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-updateempty
  // 6.2.3.4 UpdateEmpty ( completionRecord , value )
  public UpdateEmpty(value: $Any): this {
    // 1. Assert: If completionRecord.[[Type]] is either return or throw, then completionRecord.[[Value]] is not empty.
    // 2. If completionRecord.[[Value]] is not empty, return Completion(completionRecord).
    return this;
    // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
  }

  public ToObject(ctx: ExecutionContext): this {
    return this;
  }

  public ToPropertyKey(ctx: ExecutionContext): this {
    return this;
  }

  public ToLength(ctx: ExecutionContext): this {
    return this;
  }

  public ToPrimitive(ctx: ExecutionContext): this {
    return this;
  }

  public ToBoolean(ctx: ExecutionContext): this {
    return this;
  }

  public ToNumber(ctx: ExecutionContext): this {
    return this;
  }

  public ToInt32(ctx: ExecutionContext): this {
    return this;
  }

  public ToUint32(ctx: ExecutionContext): this {
    return this;
  }

  public ToInt16(ctx: ExecutionContext): this {
    return this;
  }

  public ToUint16(ctx: ExecutionContext): this {
    return this;
  }

  public ToInt8(ctx: ExecutionContext): this {
    return this;
  }

  public ToUint8(ctx: ExecutionContext): this {
    return this;
  }

  public ToUint8Clamp(ctx: ExecutionContext): this {
    return this;
  }

  public ToString(ctx: ExecutionContext): this {
    return this;
  }

}

export class $SyntaxError extends $Error<SyntaxError, 'SyntaxError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new SyntaxError(message), 'SyntaxError');
  }
}

export class $TypeError extends $Error<TypeError, 'TypeError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new TypeError(message), 'TypeError');
  }
}

export class $ReferenceError extends $Error<ReferenceError, 'ReferenceError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new ReferenceError(message), 'ReferenceError');
  }
}

export class $RangeError extends $Error<RangeError, 'RangeError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new RangeError(message), 'RangeError');
  }
}

export class $URIError extends $Error<URIError, 'URIError'> {
  public constructor(
    realm: Realm,
    message: string | undefined = void 0,
  ) {
    super(realm, new URIError(message), 'URIError');
  }
}
