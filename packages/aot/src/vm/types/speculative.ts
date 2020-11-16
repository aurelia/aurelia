import {
  nextValueId,
  getPath,
  $AnyNonError,
} from './_shared.js';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  $Empty,
} from './empty.js';
import {
  $TypeError,
  $Error,
} from './error.js';
import {
  $$AssignmentExpressionOrHigher,
} from '../ast/_shared.js';

export class $SpeculativeValue {
  public readonly '<$SpeculativeValue>': unknown;

  public readonly path: string;
  public readonly id: number = nextValueId();

  public get Type(): $Error { return new $TypeError(this.realm); }
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): false { return false; }
  public get isFalsey(): false { return false; }
  public get isSpeculative(): true { return true; }
  public get hasValue(): false { return false; }

  public constructor(
    public readonly realm: Realm,
    public readonly sourceNode: $$AssignmentExpressionOrHigher,
    public readonly antecedents: readonly $SpeculativeValue[],
  ) {
    this.path = `((${antecedents.map(getPath).join('+')})/${this.id})`;
  }

  public is(other: $AnyNonError | $SpeculativeValue): other is $Empty {
    return other instanceof $SpeculativeValue && this.id === other.id;
  }

  public ToObject(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToPropertyKey(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToLength(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToPrimitive(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToBoolean(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToNumber(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToInt32(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToUint32(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToInt16(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToUint16(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToInt8(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToUint8(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToUint8Clamp(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public ToString(
    ctx: ExecutionContext,
  ): $Error {
    return new $TypeError(ctx.Realm);
  }

  public GetValue(): $Error {
    return new $TypeError(this.realm);
  }
}
