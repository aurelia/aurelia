import { $Undefined } from './undefined';
import { $String } from './string';
import { nextValueId, $Any, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp } from './_shared';
import { Realm } from '../realm';
import { $Object } from './object';
import { $Number } from './number';
import { $Boolean } from './boolean';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-symbol-type
export class $Symbol<T extends $Undefined | $String = $Undefined | $String> {
  public readonly '<$Symbol>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'symbol' = 'symbol' as const;

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

  // http://www.ecma-international.org/ecma-262/#array-index
  public get IsArrayIndex(): false { return false; }

  public constructor(
    public readonly realm: Realm,
    public readonly Description: T,
    public readonly value = Symbol(Description.value),
  ) {}

  public is(other: $Any): other is $Symbol<T> {
    return other instanceof $Symbol && this.value === other.value;
  }

  public ToObject(): $Object {
    return $Object.ObjectCreate('symbol', this.realm['[[Intrinsics]]']['%SymbolPrototype%'], { '[[SymbolData]]': this });
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
