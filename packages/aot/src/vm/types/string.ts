import { nextValueId, $Any, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp } from './_shared';
import { $Number } from './number';
import { $Undefined } from './undefined';
import { Realm } from '../realm';
import { $Identifier, $StringLiteral, $NumericLiteral } from '../ast';
import { $Object } from './object';
import { $Boolean } from './boolean';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-string-type
export class $String<T extends string = string> {
  public readonly '<$String>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'string' = 'string' as const;

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
  public get isTruthy(): boolean { return this.value.length > 0; }
  public get isFalsey(): boolean { return this.value.length === 0; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  // http://www.ecma-international.org/ecma-262/#sec-canonicalnumericindexstring
  public get CanonicalNumericIndexString(): $Number | $Undefined {
    if (this.value === '-0') {
      return this.realm['[[Intrinsics]]']['-0'];
    }

    const n = this.ToNumber();
    if (n.ToString().is(this) as boolean) {
      return n;
    }

    return this.realm['[[Intrinsics]]'].undefined;
  }

  // http://www.ecma-international.org/ecma-262/#array-index
  public get IsArrayIndex(): boolean {
    if (this.value === '-0') {
      return false;
    }
    const num = Number(this.value);
    if (num.toString() === this.value) {
      return num >= 0 && num <= (2 ** 32 - 1);
    }
    return false;
  }

  public constructor(
    public readonly realm: Realm,
    public readonly value: T,
    public readonly sourceNode: $Identifier | $StringLiteral | $NumericLiteral | null = null,
    public readonly conversionSource: $Any | null = null,
  ) {}

  public is(other: $Any): other is $String<T> {
    return other instanceof $String && this.value === other.value;
  }

  public ToObject(): $Object {
    return $Object.ObjectCreate('string', this.realm['[[Intrinsics]]']['%StringPrototype%'], { '[[StringData]]': this });
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

  public ToBoolean(): $Boolean {
    return new $Boolean(
      /* realm */this.realm,
      /* value */Boolean(this.value),
      /* sourceNode */null,
      /* conversionSource */this,
    );
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

  public ToString(): this {
    return this;
  }

  public GetValue(): this {
    return this;
  }
}
