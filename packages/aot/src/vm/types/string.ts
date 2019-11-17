import { nextValueId, $Any, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp, PotentialNonEmptyCompletionType, CompletionTarget, CompletionType } from './_shared';
import { $Number } from './number';
import { $Undefined } from './undefined';
import { Realm, ExecutionContext } from '../realm';
import { $Identifier, $StringLiteral, $NumericLiteral } from '../ast';
import { $Object } from './object';
import { $Boolean } from './boolean';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-string-type
export class $String<T extends string = string> {
  public readonly '<$String>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'string' = 'string' as const;

  public '[[Type]]': PotentialNonEmptyCompletionType;
  public readonly '[[Value]]': T;
  public '[[Target]]': CompletionTarget;

  public get isAbrupt(): boolean { return this['[[Type]]'] !== CompletionType.normal; }

  public get Type(): 'String' { return 'String'; }
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): true { return true; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): boolean { return this['[[Value]]'].length > 0; }
  public get isFalsey(): boolean { return this['[[Value]]'].length === 0; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  // http://www.ecma-international.org/ecma-262/#sec-canonicalnumericindexstring
  public CanonicalNumericIndexString(
    ctx: ExecutionContext,
  ): $Number | $Undefined {
    if (this['[[Value]]'] === '-0') {
      return this.realm['[[Intrinsics]]']['-0'];
    }

    const n = this.ToNumber(ctx);
    if (n.ToString(ctx).is(this) as boolean) {
      return n;
    }

    return this.realm['[[Intrinsics]]'].undefined;
  }

  // http://www.ecma-international.org/ecma-262/#array-index
  public get IsArrayIndex(): boolean {
    if (this['[[Value]]'] === '-0') {
      return false;
    }
    const num = Number(this['[[Value]]']);
    if (num.toString() === this['[[Value]]']) {
      return num >= 0 && num <= (2 ** 32 - 1);
    }
    return false;
  }

  public constructor(
    public readonly realm: Realm,
    value: T,
    type: PotentialNonEmptyCompletionType = CompletionType.normal,
    target: CompletionTarget = realm['[[Intrinsics]]'].empty,
    public readonly sourceNode: $Identifier | $StringLiteral | $NumericLiteral | null = null,
    public readonly conversionSource: $Any | null = null,
  ) {
    this['[[Value]]'] = value;
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
  }

  public is(other: $Any): other is $String<T> {
    return other instanceof $String && this['[[Value]]'] === other['[[Value]]'];
  }

  public ToCompletion(
    type: PotentialNonEmptyCompletionType,
    target: CompletionTarget,
  ): this {
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-updateempty
  public UpdateEmpty(value: $Any): this {
    // 1. Assert: If completionRecord.[[Type]] is either return or throw, then completionRecord.[[Value]] is not empty.
    // 2. If completionRecord.[[Value]] is not empty, return Completion(completionRecord).
    return this;
    // 3. Return Completion { [[Type]]: completionRecord.[[Type]], [[Value]]: value, [[Target]]: completionRecord.[[Target]] }.
  }

  public ToObject(
    ctx: ExecutionContext,
  ): $Object {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    return $Object.ObjectCreate(
      ctx,
      'string',
      intrinsics['%StringPrototype%'],
      {
        '[[StringData]]': this,
      },
    );
  }

  public ToPropertyKey(
    ctx: ExecutionContext,
  ): $String {
    return this.ToString(ctx);
  }

  public ToLength(
    ctx: ExecutionContext,
  ): $Number {
    return this.ToNumber(ctx).ToLength(ctx);
  }

  public ToPrimitive(
    ctx: ExecutionContext,
  ): this {
    return this;
  }

  public ToBoolean(
    ctx: ExecutionContext,
  ): $Boolean {
    return new $Boolean(
      /* realm */this.realm,
      /* value */Boolean(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToNumber(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Number(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt32(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int32(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint32(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint32(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt16(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int16(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint16(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint16(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt8(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int8(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8Clamp(
    ctx: ExecutionContext,
  ): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8Clamp(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToString(
    ctx: ExecutionContext,
  ): this {
    return this;
  }

  public GetValue(): this {
    return this;
  }
}
