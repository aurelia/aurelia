import { nextValueId, ESType, getPath, $Any, $Primitive } from './_shared';
import { Realm, ExecutionContext } from '../realm';
import { $$AssignmentExpressionOrHigher } from '../ast';
import { $Empty } from './empty';
import { $Object } from './object';
import { $String } from './string';
import { $Number } from './number';
import { $Boolean } from './boolean';


export class $SpeculativeValue {
  public readonly '<$SpeculativeValue>': unknown;

  public readonly path: string;
  public readonly id: number = nextValueId();

  public get Type(): ESType { throw new TypeError(); }
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

  public is(other: $Any): other is $Empty {
    return other instanceof $SpeculativeValue && this.id === other.id;
  }

  public ToObject(
    ctx: ExecutionContext,
  ): $Object {
    throw new TypeError(`Cannot convert SpeculativeValue to object`);
  }

  public ToPropertyKey(
    ctx: ExecutionContext,
  ): $String {
    throw new TypeError(`Cannot convert SpeculativeValue to property key`);
  }

  public ToLength(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to length`);
  }

  public ToPrimitive(
    ctx: ExecutionContext,
  ): $Primitive {
    throw new TypeError(`Cannot convert SpeculativeValue to primitive`);
  }

  public ToBoolean(
    ctx: ExecutionContext,
  ): $Boolean {
    throw new TypeError(`Cannot convert SpeculativeValue to boolean`);
  }

  public ToNumber(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to number`);
  }

  public ToInt32(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Int32`);
  }

  public ToUint32(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint32`);
  }

  public ToInt16(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Int16`);
  }

  public ToUint16(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint16`);
  }

  public ToInt8(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Int8`);
  }

  public ToUint8(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint8`);
  }

  public ToUint8Clamp(
    ctx: ExecutionContext,
  ): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint8Clamp`);
  }

  public ToString(
    ctx: ExecutionContext,
  ): $String {
    throw new TypeError(`Cannot convert SpeculativeValue to string`);
  }

  public GetValue(): never {
    throw new TypeError(`SpeculativeValue has no evaluatable value`);
  }
}
