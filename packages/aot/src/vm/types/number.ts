import { nextValueId, $Any, Int32, Uint32, Int16, Uint16, Int8, Uint8, Uint8Clamp, PotentialNonEmptyCompletionType, CompletionTarget, CompletionType } from './_shared';
import { Realm } from '../realm';
import { $NumericLiteral } from '../ast';
import { $Object } from './object';
import { $String } from './string';
import { $Boolean } from './boolean';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-number-type
export class $Number<T extends number = number> {
  public readonly '<$Number>': unknown;

  public readonly id: number = nextValueId();
  public readonly IntrinsicName: 'number' = 'number' as const;

  public '[[Type]]': PotentialNonEmptyCompletionType;
  public readonly '[[Value]]': T;
  public '[[Target]]': CompletionTarget;

  public get isAbrupt(): boolean { return this['[[Type]]'] !== CompletionType.normal; }

  public get Type(): 'Number' { return 'Number'; }
  public get isNaN(): boolean { return isNaN(this['[[Value]]']); }
  public get isPositiveZero(): boolean { return Object.is(this['[[Value]]'], +0); }
  public get isNegativeZero(): boolean { return Object.is(this['[[Value]]'], -0); }
  public get isPositiveInfinity(): boolean { return Object.is(this['[[Value]]'], +Infinity); }
  public get isNegativeInfinity(): boolean { return Object.is(this['[[Value]]'], -Infinity); }
  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): true { return true; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isArray(): false { return false; }
  public get isProxy(): false { return false; }
  public get isFunction(): false { return false; }
  public get isBoundFunction(): false { return false; }
  public get isTruthy(): boolean { return this['[[Value]]'] !== 0 && !isNaN(this['[[Value]]']); }
  public get isFalsey(): boolean { return this['[[Value]]'] === 0 || isNaN(this['[[Value]]']); }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    value: T,
    type: PotentialNonEmptyCompletionType = CompletionType.normal,
    target: CompletionTarget = realm['[[Intrinsics]]'].empty,
    public readonly sourceNode: $NumericLiteral | null = null,
    public readonly conversionSource: $Any | null = null,
  ) {
    this['[[Value]]'] = value;
    this['[[Type]]'] = type;
    this['[[Target]]'] = target;
  }

  public is(other: $Any): other is $Number<T> {
    return other instanceof $Number && Object.is(this['[[Value]]'], other['[[Value]]']);
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

  public equals(other: $Number): boolean {
    return Object.is(this['[[Value]]'], other['[[Value]]']);
  }

  // http://www.ecma-international.org/ecma-262/#sec-isinteger
  public get IsInteger(): boolean {
    if (isNaN(this['[[Value]]']) || Object.is(this['[[Value]]'], Infinity) || Object.is(this['[[Value]]'], -Infinity)) {
      return false;
    }
    return Math.floor(Math.abs(this['[[Value]]'])) === Math.abs(this['[[Value]]']);
  }

  public ToObject(): $Object {
    return $Object.ObjectCreate('number', this.realm['[[Intrinsics]]']['%NumberPrototype%'], { '[[NumberData]]': this });
  }

  public ToPropertyKey(): $String {
    return this.ToString();
  }

  public ToPrimitive(): this {
    return this;
  }

  public ToBoolean(): $Boolean {
    return new $Boolean(
      /* realm */this.realm,
      /* value */Boolean(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToNumber(): $Number {
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-tointeger
  public ToInteger(): $Number {
    // 1. Let number be ? ToNumber(argument).

    const value = this['[[Value]]'];
    if (isNaN(value)) {
      // 2. If number is NaN, return +0.
      return new $Number(
        /* realm */this.realm,
        /* value */0,
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
        /* sourceNode */null,
        /* conversionSource */this,
      );
    }

    // 3. If number is +0, -0, +∞, or -∞, return number.
    if (Object.is(value, +0) || Object.is(value, -0) || Object.is(value, +Infinity) || Object.is(value, -Infinity)) {
      return this;
    }

    // 4. Return the number value that is the same sign as number and whose magnitude is floor(abs(number)).
    const sign = value < 0 ? -1 : 1;
    return new $Number(
      /* realm */this.realm,
      /* value */Math.floor(Math.abs(value)) * sign,
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  // http://www.ecma-international.org/ecma-262/#sec-tolength
  public ToLength(): $Number {
    // 1. Let len be ? ToInteger(argument).
    const len = this.ToInteger();

    // 2. If len ≤ +0, return +0.
    if (len['[[Value]]'] < 0) {
      return new $Number(
        /* realm */this.realm,
        /* value */0,
        /* type */this['[[Type]]'],
        /* target */this['[[Target]]'],
        /* sourceNode */null,
        /* conversionSource */this,
      );
    }

    // 3. Return min(len, 253 - 1).
    if (len['[[Value]]'] > (2 ** 53 - 1)) {
      return new $Number(
        /* realm */this.realm,
        /* value */(2 ** 53 - 1),
        /* type */this['[[Type]]'],
        /* target */this['[[Target]]'],
        /* sourceNode */null,
        /* conversionSource */this,
      );
    }

    return this;
  }

  public ToInt32(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int32(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint32(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint32(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt16(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int16(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint16(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint16(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToInt8(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Int8(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToUint8Clamp(): $Number {
    return new $Number(
      /* realm */this.realm,
      /* value */Uint8Clamp(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public ToString(): $String {
    return new $String(
      /* realm */this.realm,
      /* value */String(this['[[Value]]']),
      /* type */this['[[Type]]'],
      /* target */this['[[Target]]'],
      /* sourceNode */null,
      /* conversionSource */this,
    );
  }

  public GetValue(): this {
    return this;
  }
}
