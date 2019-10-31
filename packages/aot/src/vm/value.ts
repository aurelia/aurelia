/* eslint-disable @typescript-eslint/no-this-alias */
import { Host } from './host';

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface empty { '<empty>': unknown }
export const empty = Symbol('empty') as unknown as empty;

let esValueId = 0;

export type $Primitive = (
  $Undefined |
  $Null |
  $Boolean |
  $String |
  $Symbol |
  $Number
);

export type $Any = (
  $Empty |
  $Primitive |
  $Object |
  $Function
);

export type $NonNumberPrimitive = Exclude<$Primitive, $Number>;
export type $NonNilPrimitive = Exclude<$Primitive, $Undefined | $Null>;
export type $NonNil = Exclude<$Any, $Undefined | $Null>;

export class $Empty {
  public readonly '<$Empty>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'empty' = 'empty' as const;

  public readonly value: empty = empty;

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
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
  ) {}

  public is(other: $Any): other is $Empty {
    return other instanceof $Empty;
  }
}

export class $Undefined {
  public readonly '<$Undefined>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'undefined' = 'undefined' as const;

  public readonly value: undefined = void 0;

  public get isEmpty(): false { return false; }
  public get isUndefined(): true { return true; }
  public get isNull(): false { return false; }
  public get isNil(): true { return true; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
  ) {}

  public is(other: $Any): other is $Undefined {
    return other instanceof $Undefined;
  }
}

export class $Null {
  public readonly '<$Null>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'null' = 'null' as const;

  public readonly value: null = null;

  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): true { return true; }
  public get isNil(): true { return true; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): true { return true; }
  public get isObject(): false { return false; }
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
  ) {}

  public is(other: $Any): other is $Null {
    return other instanceof $Null;
  }
}

export class $Boolean<T extends boolean = boolean> {
  public readonly '<$Boolean>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'boolean' = 'boolean' as const;

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
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
    public readonly value: T,
  ) {}

  public is(other: $Any): other is $Boolean<T> {
    return other instanceof $Boolean && this.value === other.value;
  }
}

export class $String<T extends string = string> {
  public readonly '<$String>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'string' = 'string' as const;

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
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
    public readonly value: T,
  ) {}

  public is(other: $Any): other is $String<T> {
    return other instanceof $String && this.value === other.value;
  }
}

export class $Symbol<T extends $Undefined | $String = $Undefined | $String> {
  public readonly '<$Symbol>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'symbol' = 'symbol' as const;

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
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
    public readonly Description: T,
    public readonly value = Symbol(Description.value),
  ) {}

  public is(other: $Any): other is $Symbol<T> {
    return other instanceof $Symbol && this.value === other.value;
  }
}

export class $Number<T extends number = number> {
  public readonly '<$Number>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'number' = 'number' as const;

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
  public get isFunction(): false { return false; }

  public constructor(
    public readonly host: Host,
    public readonly value: T,
  ) {}

  public is(other: $Any): other is $Number<T> {
    return other instanceof $Number && Object.is(this.value, other.value);
  }
}

export class $Object<
  T extends string = string,
> {
  public readonly '<$Object>': unknown;

  public readonly id: number = ++esValueId;

  public ['[[Prototype]]']: $Object | $Null;
  public ['[[Extensible]]']: $Boolean;

  public get isEmpty(): false { return false; }
  public get isUndefined(): false { return false; }
  public get isNull(): false { return false; }
  public get isNil(): false { return false; }
  public get isBoolean(): false { return false; }
  public get isNumber(): false { return false; }
  public get isString(): false { return false; }
  public get isSymbol(): false { return false; }
  public get isPrimitive(): false { return false; }
  public get isObject(): true { return true; }
  public get isFunction(): boolean { return false; }

  public constructor(
    public readonly host: Host,
    public readonly IntrinsicName: T,
    proto: $Object | $Null,
  ) {
    this['[[Prototype]]'] = proto;
    this['[[Extensible]]'] = host.realm['[[Intrinsics]]'].true;
  }

  public is(other: $Any): other is $Object<T> {
    return this.id === other.id;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-getprototypeof
  public '[[GetPrototypeOf]]'(): $Object | $Null {
    // 1. Return ! OrdinaryGetPrototypeOf(O)

    // http://www.ecma-international.org/ecma-262/#sec-ordinarygetprototypeof
    const O = this;

    // 1. Return O.[[Prototype]].
    return O['[[Prototype]]'];
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-setprototypeof-v
  public '[[SetPrototypeOf]]'(V: $Object | $Null): $Boolean {
    const intrinsics = this.host.realm['[[Intrinsics]]'];

    // 1. Return ! OrdinarySetPrototypeOf(O, V).

    // http://www.ecma-international.org/ecma-262/#sec-ordinarysetprototypeof
    const O = this;

    // 1. Assert: Either Type(V) is Object or Type(V) is Null.
    // 2. Let extensible be O.[[Extensible]].
    const extensible = O['[[Extensible]]'].value;

    // 3. Let current be O.[[Prototype]].
    const current = O['[[Prototype]]'];

    // 4. If SameValue(V, current) is true, return true.
    if (V.is(current)) {
      return intrinsics.true;
    }

    // 5. If extensible is false, return false.
    if (!extensible) {
      return intrinsics.false;
    }

    // 6. Let p be V.
    let p = V;

    // 7. Let done be false.
    let done = false;

    // 8. Repeat, while done is false,
    while (!done) {
      // 8. a. If p is null, set done to true.
      if (p.isNull) {
        done = true;
      }
      // 8. b. Else if SameValue(p, O) is true, return false.
      else if (p.is(O)) {
        return intrinsics.false;
      }
      // 8. c. Else,
      else {
        // 8. c. i. If p.[[GetPrototypeOf]] is not the ordinary object internal method defined in 9.1.1, set done to true.
        if (p['[[GetPrototypeOf]]'] !== $Object.prototype['[[GetPrototypeOf]]']) {
          done = true;
        }
        // 8. c. ii. Else, set p to p.[[Prototype]].
        else {
          p = p['[[Prototype]]'];
        }
      }
    }

    // 9. Set O.[[Prototype]] to V.
    O['[[Prototype]]'] = V;

    // 10. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-isextensible
  public '[[IsExtensible]]'(): $Boolean {
    // 1. Return ! OrdinaryIsExtensible(O).

    // http://www.ecma-international.org/ecma-262/#sec-ordinaryisextensible
    const O = this;

    // 1. Return O.[[Extensible]].
    return O['[[Extensible]]'];
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-preventextensions
  public '[[PreventExtensions]]'(): $Boolean {
    const intrinsics = this.host.realm['[[Intrinsics]]'];

    // 1. Return ! OrdinaryPreventExtensions(O).

    // http://www.ecma-international.org/ecma-262/#sec-ordinarypreventextensions
    const O = this;

    // 1. Set O.[[Extensible]] to false.
    O['[[Extensible]]'] = intrinsics.false;

    // 2. Return true.
    return intrinsics.true;
  }
}

export class $Function<
  T extends string = string,
> extends $Object<T> {
  public readonly '<$Function>': unknown;

  public get isFunction(): true { return true; }

  public constructor(
    host: Host,
    IntrinsicName: T,
    proto: $Object,
  ) {
    super(host, IntrinsicName, proto);
  }
}

export class $ECMAScriptFunction<
  T extends string = string,
> extends $Function<T> {
  public readonly '<$ECMAScriptFunction>': unknown;

  public constructor(
    host: Host,
    IntrinsicName: T,
    proto: $Object,
  ) {
    super(host, IntrinsicName, proto);
  }
}

export class $BuiltinFunction<
  T extends string = string,
> extends $Function<T> {
  public readonly '<$BuiltinFunction>': unknown;

  public constructor(
    host: Host,
    IntrinsicName: T,
    proto: $Object,
    private readonly $invoke: CallableFunction,
  ) {
    super(host, IntrinsicName, proto);
  }
}
