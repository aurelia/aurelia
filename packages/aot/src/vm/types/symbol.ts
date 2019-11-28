import {
  $Undefined,
} from './undefined';
import {
  $String,
} from './string';
import {
  nextValueId,
  $AnyNonError,
  PotentialNonEmptyCompletionType,
  CompletionTarget,
  CompletionType,
  $Any,
} from './_shared';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $Object,
} from './object';
import {
  $Boolean,
} from './boolean';
import {
  $TypeError,
  $Error,
} from './error';
import {
  I$Node,
} from '../ast/_shared';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-symbol-type
export class $Symbol<T extends $Undefined | $String = $Undefined | $String> {
  public readonly '<$Symbol>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'symbol' = 'symbol' as const;

  public '[[Type]]': PotentialNonEmptyCompletionType;
  public readonly '[[Value]]': symbol;
  public '[[Target]]': CompletionTarget;

  // Note: this typing is incorrect, but we do it this way to prevent having to cast in 100+ places.
  // The purpose is to ensure the `isAbrupt === true` flow narrows down to the $Error type.
  // It could be done correctly, but that would require complex conditional types which is not worth the effort right now.
  public get isAbrupt(): false { return (this['[[Type]]'] !== CompletionType.normal) as false; }

  public get Type(): 'Symbol' { return 'Symbol'; }
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): true { return true; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): true { return true; }
  public get isFalsey(): false { return false; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }
  public get isList(): false { return false; }

  public readonly nodeStack: I$Node[] = [];
  public ctx: ExecutionContext | null = null;
  public stack: string = '';

  public get IsArrayIndex(): false { return false; }

  public constructor(
    public readonly realm: Realm,
    public readonly Description: T,
    value = Symbol(Description['[[Value]]']),
    type: PotentialNonEmptyCompletionType = CompletionType.normal,
    target: CompletionTarget = realm['[[Intrinsics]]'].empty,
  ) {
    this['[[Value]]'] = value;
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
  }

  public is(other: $AnyNonError): other is $Symbol<T> {
    return other instanceof $Symbol && this['[[Value]]'] === other['[[Value]]'];
  }

  public enrichWith(ctx: ExecutionContext, node: I$Node): this {
    if (this['[[Type]]'] === CompletionType.throw) {
      this.nodeStack.push(node);
      if (this.ctx === null) {
        this.ctx = ctx;
        this.stack = ctx.Realm.stack.toString();
      }
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
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
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

  public ToObject(
    ctx: ExecutionContext,
  ): $Object {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    return $Object.ObjectCreate(
      ctx,
      'symbol',
      intrinsics['%SymbolPrototype%'],
      {
        '[[SymbolData]]': this,
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
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
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
  ): $Error {
    return new $TypeError(ctx.Realm, `${this} cannot be converted to number`);
  }

  public ToInt32(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToUint32(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToInt16(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToUint16(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToInt8(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToUint8(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToUint8Clamp(
    ctx: ExecutionContext,
  ): $Error {
    // Short circuit
    return this.ToNumber(ctx);
  }

  public ToString(
    ctx: ExecutionContext,
  ): $String {
    return new $String(
      /* realm */this.realm,
      /* value */String(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public GetValue(
    ctx: ExecutionContext,
  ): this {
    return this;
  }
}
