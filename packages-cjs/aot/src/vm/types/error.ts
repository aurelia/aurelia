import {
  nextValueId,
  CompletionTarget,
  CompletionType,
  $AnyNonError,
  PotentialNonEmptyCompletionType,
  $Any,
} from './_shared.js';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  I$Node,
} from '../ast/_shared.js';

export abstract class $Error<T extends Error = Error, N extends string = string> {
  public readonly '<$Error>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: N;

  public readonly '[[Type]]': CompletionType.throw = CompletionType.throw;
  public readonly '[[Value]]': T;
  public readonly '[[Target]]': CompletionTarget;

  public get isAbrupt(): true { return true; }
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): true { return true; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): T { return this['[[Value]]']; }
  public get isFalsey(): T extends true ? false : true { return !this['[[Value]]'] as T extends true ? false : true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }
  public get isList(): false { return false; }

  public readonly nodeStack: I$Node[] = [];
  public ctx: ExecutionContext | null = null;
  public stack: string = '';

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

  public enrichWith(ctx: ExecutionContext, node: I$Node): this {
    this.nodeStack.push(node);
    if (this.ctx === null) {
      this.ctx = ctx;
      this.stack = ctx.Realm.stack.toString();
    }
    return this;
  }

  public [Symbol.toPrimitive](): string {
    return String(this['[[Value]]']);
  }

  public [Symbol.toStringTag](): string {
    return Object.prototype.toString.call(this['[[Value]]']);
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
