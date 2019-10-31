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
}

export class $Object<
  T extends string = string,
  P = unknown,
> {
  public readonly '<$Object>': unknown;

  public readonly id: number = ++esValueId;

  public readonly ['[[Prototype]]']: P;
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
    proto: P,
  ) {
    this['[[Prototype]]'] = proto;
    this['[[Extensible]]'] = host.realm['[[Intrinsics]]'].true;
  }
}

export class $Function<
  T extends string = string,
  P extends $Object = $Object,
> extends $Object<T, P> {
  public readonly '<$Function>': unknown;

  public get isFunction(): true { return true; }

  public constructor(
    host: Host,
    IntrinsicName: T,
    proto: P,
  ) {
    super(host, IntrinsicName, proto);
  }
}

export class $ECMAScriptFunction<
  T extends string = string,
  P extends $Object = $Object,
> extends $Function<T, P> {
  public readonly '<$ECMAScriptFunction>': unknown;

  public constructor(
    host: Host,
    IntrinsicName: T,
    proto: P,
  ) {
    super(host, IntrinsicName, proto);
  }
}

export class $BuiltinFunction<
  T extends string = string,
  P extends $Object = $Object,
> extends $Function<T, P> {
  public readonly '<$BuiltinFunction>': unknown;

  public constructor(
    host: Host,
    IntrinsicName: T,
    proto: P,
    private readonly $invoke: CallableFunction,
  ) {
    super(host, IntrinsicName, proto);
  }
}
