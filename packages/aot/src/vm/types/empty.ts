/* eslint-disable */
import { nextValueId, $Any, ESType, $Primitive } from './_shared';
import { Realm } from '../realm';
import { $Object } from './object';
import { $String } from './string';
import { $Number } from './number';
import { $ComputedPropertyName } from '../ast';
import { $Boolean } from './boolean';

export interface empty { '<empty>': unknown }
export const empty = Symbol('empty') as unknown as empty;
export class $Empty {
  public readonly '<$Empty>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'empty' = 'empty' as const;

  public readonly value: empty = empty;

  public get Type(): ESType { throw new TypeError(); }
  public get isEmpty(): true { return true; }
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
  public get isFalsey(): true { return true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): false { return false; }

  public constructor(
    public readonly realm: Realm,
    public readonly sourceNode: $ComputedPropertyName | null = null,
  ) {}

  public is(other: $Any): other is $Empty {
    return other instanceof $Empty;
  }

  public ToObject(): $Object {
    throw new TypeError(`Cannot convert empty to object`);
  }

  public ToPropertyKey(): $String {
    throw new TypeError(`Cannot convert empty to property key`);
  }

  public ToLength(): $Number {
    throw new TypeError(`Cannot convert empty to length`);
  }

  public ToPrimitive(): $Primitive {
    throw new TypeError(`Cannot convert empty to primitive`);
  }

  public ToBoolean(): $Boolean {
    throw new TypeError(`Cannot convert empty to boolean`);
  }

  public ToNumber(): $Number {
    throw new TypeError(`Cannot convert empty to number`);
  }

  public ToInt32(): $Number {
    throw new TypeError(`Cannot convert empty to Int32`);
  }

  public ToUint32(): $Number {
    throw new TypeError(`Cannot convert empty to Uint32`);
  }

  public ToInt16(): $Number {
    throw new TypeError(`Cannot convert empty to Int16`);
  }

  public ToUint16(): $Number {
    throw new TypeError(`Cannot convert empty to Uint16`);
  }

  public ToInt8(): $Number {
    throw new TypeError(`Cannot convert empty to Int8`);
  }

  public ToUint8(): $Number {
    throw new TypeError(`Cannot convert empty to Uint8`);
  }

  public ToUint8Clamp(): $Number {
    throw new TypeError(`Cannot convert empty to Uint8Clamp`);
  }

  public ToString(): $String {
    throw new TypeError(`Cannot convert empty to string`);
  }

  public GetValue(): never {
    throw new TypeError(`empty has no evaluatable value`);
  }
}
