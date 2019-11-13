/* eslint-disable */
import { nextValueId, $Any, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp } from './_shared';
import { Realm } from '../realm';
import { $BooleanLiteral } from '../ast';
import { $Object } from './object';
import { $String } from './string';
import { $Number } from './number';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-boolean-type
export class $Boolean<T extends boolean = boolean> {
  public readonly '<$Boolean>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'boolean' = 'boolean' as const;

  public get Type(): 'Boolean' { return 'Boolean'; }
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
  public get isTruthy(): T { return this.value; }
  public get isFalsey(): T extends true ? false : true { return !this.value as T extends true ? false : true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    public readonly value: T,
    public readonly sourceNode: $BooleanLiteral | null = null,
    public readonly conversionSource: $Any | null = null,
  ) {}

  public is(other: $Any): other is $Boolean<T> {
    return other instanceof $Boolean && this.value === other.value;
  }

  public ToObject(): $Object {
    return $Object.ObjectCreate('boolean', this.realm['[[Intrinsics]]']['%BooleanPrototype%'], { '[[BooleanData]]': this });
  }

  public ToPropertyKey(): $String {
    return this.ToString();
  }

  public ToLength(): $Number {
    return this.ToNumber().ToLength();
  }

  public ToPrimitive(): this {
    return this;
  }

  public ToBoolean(): this {
    return this;
  }

  public ToNumber(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Number(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt32(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int32(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint32(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint32(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt16(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int16(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint16(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint16(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt8(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int8(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8Clamp(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8Clamp(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToString(): $String {
    return new $String(
      /* realm */this.realm,
      /* value */String(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public GetValue(): this {
    return this;
  }
}
