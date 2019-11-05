/* eslint-disable */
import { Realm, IModule, ResolveSet, ResolvedBindingRecord } from './realm';
import { $PropertyDescriptor } from './property-descriptor';
import { $Call, $ValidateAndApplyPropertyDescriptor, $OrdinarySetWithOwnDescriptor, $SetImmutablePrototype, $DefinePropertyOrThrow, $Set, $Get } from './operations';
import { $EnvRec } from './environment';
import { $ParameterDeclaration, $Block, $$AssignmentExpressionOrHigher, $Identifier, $StringLiteral, $ClassExpression, $NumericLiteral, $ComputedPropertyName, $FunctionDeclaration, $ExportDeclaration, $ExportSpecifier, $ExportAssignment, $NamespaceImport, $ImportSpecifier, $ImportClause, $ImportDeclaration, $ClassDeclaration, $VariableStatement, $SourceFile, $MethodDeclaration, $ArrowFunction, $BooleanLiteral, $NullLiteral } from './ast';
import { SyntaxKind } from 'typescript';

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

export type $PropertyKey = (
  $String |
  $Symbol
);

export type $NonNumberPrimitive = Exclude<$Primitive, $Number>;
export type $NonNilPrimitive = Exclude<$Primitive, $Undefined | $Null>;
export type $NonNil = Exclude<$Any, $Undefined | $Null>;

function getPath(obj: { path: string }): string {
  return obj.path;
}

export class $SpeculativeValue {
  public readonly '<$SpeculativeValue>': unknown;

  public readonly path: string;
  public readonly id: number = ++esValueId;

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
  public get isFunction(): false { return false; }
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

  public ToObject(): $Object {
    throw new TypeError(`Cannot convert SpeculativeValue to object`);
  }

  public ToPrimitive(): $Primitive {
    throw new TypeError(`Cannot convert SpeculativeValue to primitive`);
  }

  public ToBoolean(): $Boolean {
    throw new TypeError(`Cannot convert SpeculativeValue to boolean`);
  }

  public ToNumber(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to number`);
  }

  public ToInt32(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Int32`);
  }

  public ToUint32(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint32`);
  }

  public ToInt16(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Int16`);
  }

  public ToUint16(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint16`);
  }

  public ToInt8(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Int8`);
  }

  public ToUint8(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint8`);
  }

  public ToUint8Clamp(): $Number {
    throw new TypeError(`Cannot convert SpeculativeValue to Uint8Clamp`);
  }

  public ToString(): $String {
    throw new TypeError(`Cannot convert SpeculativeValue to string`);
  }

  public GetValue(): never {
    throw new TypeError(`SpeculativeValue has no evaluatable value`);
  }
}

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

const Int32 = (function () {
  const $ = new Int32Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
const Uint32 = (function () {
  const $ = new Uint32Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
const Int16 = (function () {
  const $ = new Int16Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
const Uint16 = (function () {
  const $ = new Uint16Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
const Int8 = (function () {
  const $ = new Int8Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
const Uint8 = (function () {
  const $ = new Uint8Array(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();
const Uint8Clamp = (function () {
  const $ = new Uint8ClampedArray(1);
  return function (value: unknown): number {
    $[0] = Number(value);
    return $[0];
  };
})();

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-undefined-type
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
  public get isTruthy(): false { return false; }
  public get isFalsey(): true { return true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    public readonly sourceNode: $FunctionDeclaration | $ExportSpecifier | $ImportSpecifier | $ImportClause | $ImportDeclaration | $ClassDeclaration | null = null,
  ) {}

  public is(other: $Any): other is $Undefined {
    return other instanceof $Undefined;
  }

  public ToObject(): $Object {
    throw new TypeError(`Cannot convert undefined to object`);
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

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-null-type
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
  public get isTruthy(): false { return false; }
  public get isFalsey(): true { return true; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    public readonly sourceNode: $ExportDeclaration | $ExportSpecifier | $ClassDeclaration | $FunctionDeclaration | $VariableStatement | $SourceFile | $NullLiteral | null = null,
  ) {}

  public is(other: $Any): other is $Null {
    return other instanceof $Null;
  }

  public ToObject(): $Object {
    throw new TypeError(`Cannot convert null to object`);
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

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-boolean-type
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

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-string-type
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
  public get isTruthy(): boolean { return this.value.length > 0; }
  public get isFalsey(): boolean { return this.value.length === 0; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

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

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-symbol-type
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
  public get isTruthy(): true { return true; }
  public get isFalsey(): false { return false; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

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


// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-number-type
export class $Number<T extends number = number> {
  public readonly '<$Number>': unknown;

  public readonly id: number = ++esValueId;
  public readonly IntrinsicName: 'number' = 'number' as const;

  public get isNaN(): boolean { return isNaN(this.value); }
  public get isPositiveZero(): boolean { return Object.is(this.value, +0); }
  public get isNegativeZero(): boolean { return Object.is(this.value, -0); }
  public get isPositiveInfinity(): boolean { return Object.is(this.value, +Infinity); }
  public get isNegativeInfinity(): boolean { return Object.is(this.value, -Infinity); }
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
  public get isTruthy(): boolean { return this.value !== 0 && !isNaN(this.value); }
  public get isFalsey(): boolean { return this.value === 0 || isNaN(this.value); }
  public get isSpeculative(): false { return false; }
  public get hasValue(): true { return true; }

  public constructor(
    public readonly realm: Realm,
    public readonly value: T,
    public readonly sourceNode: $NumericLiteral | null = null,
    public readonly conversionSource: $Any | null = null,
  ) {}

  public is(other: $Any): other is $Number<T> {
    return other instanceof $Number && Object.is(this.value, other.value);
  }

  public equals(other: $Number): boolean {
    return Object.is(this.value, other.value);
  }

  public ToObject(): $Object {
    return $Object.ObjectCreate('number', this.realm['[[Intrinsics]]']['%NumberPrototype%'], { '[[NumberData]]': this });
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
    return this;
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

// http://www.ecma-international.org/ecma-262/#sec-object-type
export class $Object<
  T extends string = string,
> {
  public readonly '<$Object>': unknown;

  public readonly id: number = ++esValueId;

  public readonly properties: Map<string | symbol, $PropertyDescriptor> = new Map();

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
  public get isTruthy(): true { return true; }
  public get isFalsey(): false { return false; }
  public get isSpeculative(): false { return false; }
  public get hasValue(): false { return false; }

  public constructor(
    public readonly realm: Realm,
    public readonly IntrinsicName: T,
    proto: $Object | $Null,
  ) {
    this['[[Prototype]]'] = proto;
    this['[[Extensible]]'] = realm['[[Intrinsics]]'].true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-objectcreate
  public static ObjectCreate<T extends string = string, TSlots extends {} = {}>(
    IntrinsicName: T,
    proto: $Object,
    internalSlotsList?: TSlots,
  ): $Object<T> & TSlots {
    const realm = proto.realm;

    // 1. If internalSlotsList is not present, set internalSlotsList to a new empty List.
    // 2. Let obj be a newly created object with an internal slot for each name in internalSlotsList.
    const obj = new $Object(realm, IntrinsicName, proto);
    Object.assign(obj, internalSlotsList);

    // 3. Set obj's essential internal methods to the default ordinary object definitions specified in 9.1.
    // 4. Set obj.[[Prototype]] to proto.
    // 5. Set obj.[[Extensible]] to true.
    // 6. Return obj.
    return obj as $Object<T> & TSlots;
  }

  public is(other: $Any): other is $Object<T> {
    return this.id === other.id;
  }

  public ToObject(): this {
    return this;
  }

  public ToBoolean(): $Boolean {
    return this.ToPrimitive('number').ToBoolean();
  }

  public ToNumber(): $Number {
    return this.ToPrimitive('number').ToNumber();
  }

  public ToInt32(): $Number {
    return this.ToPrimitive('number').ToInt32();
  }

  public ToUint32(): $Number {
    return this.ToPrimitive('number').ToUint32();
  }

  public ToInt16(): $Number {
    return this.ToPrimitive('number').ToInt16();
  }

  public ToUint16(): $Number {
    return this.ToPrimitive('number').ToUint16();
  }

  public ToInt8(): $Number {
    return this.ToPrimitive('number').ToInt8();
  }

  public ToUint8(): $Number {
    return this.ToPrimitive('number').ToUint8();
  }

  public ToUint8Clamp(): $Number {
    return this.ToPrimitive('number').ToUint8Clamp();
  }

  public ToString(): $String {
    return this.ToPrimitive('string').ToString();
  }

  // http://www.ecma-international.org/ecma-262/#sec-toprimitive
  public ToPrimitive(PreferredType: 'default' | 'string' | 'number' = 'default'): $Primitive {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const input = this;

    // 1. Assert: input is an ECMAScript language value.
    // 2. If Type(input) is Object, then
    // 2. a. If PreferredType is not present, let hint be "default".
    // 2. b. Else if PreferredType is hint String, let hint be "string".
    // 2. c. Else PreferredType is hint Number, let hint be "number".
    let hint = intrinsics[PreferredType];

    // 2. d. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
    const exoticToPrim = input.GetMethod(intrinsics['@@toPrimitive']);

    // 2. e. If exoticToPrim is not undefined, then
    if (!exoticToPrim.isUndefined) {
      // 2. e. i. Let result be ? Call(exoticToPrim, input, « hint »).
      const result = $Call(exoticToPrim, input, [hint]);

      // 2. e. ii. If Type(result) is not Object, return result.
      if (result.isPrimitive) {
        return result;
      }

      // 2. e. iii. Throw a TypeError exception.
      throw new TypeError('2. e. iii. Throw a TypeError exception.');
    }

    // 2. f. If hint is "default", set hint to "number".
    if (hint.value === 'default') {
      hint = intrinsics.number;
    }

    // 2. g. Return ? OrdinaryToPrimitive(input, hint).
    return input.OrdinaryToPrimitive(hint.value);

    // 3. Return input.
    // N/A since this is always an object
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinarytoprimitive
  public OrdinaryToPrimitive(hint: 'string' | 'number'): $Primitive {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 1. Assert: Type(O) is Object.
    // 2. Assert: Type(hint) is String and its value is either "string" or "number".
    // 3. If hint is "string", then
    if (hint === 'string') {
      // 3. a. Let methodNames be « "toString", "valueOf" ».
      // 5. For each name in methodNames in List order, do
      // 5. a. Let method be ? Get(O, name).
      let method = $Get(O, intrinsics.$toString);

      // 5. b. If IsCallable(method) is true, then
      if (method.isFunction) {
        // 5. b. i. Let result be ? Call(method, O).
        const result = $Call(method as $Function, O);

        // 5. b. ii. If Type(result) is not Object, return result.
        if (result.isPrimitive) {
          return result;
        }
      }

      method = $Get(O, intrinsics.$valueOf);

      // 5. b. If IsCallable(method) is true, then
      if (method.isFunction) {
        // 5. b. i. Let result be ? Call(method, O).
        const result = $Call(method as $Function, O);

        // 5. b. ii. If Type(result) is not Object, return result.
        if (result.isPrimitive) {
          return result;
        }
      }

      // 6. Throw a TypeError exception.
      throw new TypeError('6. Throw a TypeError exception.');
    }
    // 4. Else,
    else {
      // 4. a. Let methodNames be « "valueOf", "toString" ».
      // 5. For each name in methodNames in List order, do
      // 5. a. Let method be ? Get(O, name).
      let method = $Get(O, intrinsics.$valueOf);

      // 5. b. If IsCallable(method) is true, then
      if (method.isFunction) {
        // 5. b. i. Let result be ? Call(method, O).
        const result = $Call(method as $Function, O);

        // 5. b. ii. If Type(result) is not Object, return result.
        if (result.isPrimitive) {
          return result;
        }
      }

      method = $Get(O, intrinsics.$toString);

      // 5. b. If IsCallable(method) is true, then
      if (method.isFunction) {
        // 5. b. i. Let result be ? Call(method, O).
        const result = $Call(method as $Function, O);

        // 5. b. ii. If Type(result) is not Object, return result.
        if (result.isPrimitive) {
          return result;
        }
      }

      // 6. Throw a TypeError exception.
      throw new TypeError('6. Throw a TypeError exception.');
    }
  }

  public GetValue(): this {
    return this;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getmethod
  public GetMethod(P: $PropertyKey): $Function | $Undefined {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const V = this;

    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let func be ? GetV(V, P).
    const func = V['[[Get]]'](P, V);

    // 3. If func is either undefined or null, return undefined.
    if (func.isNil) {
      return intrinsics.undefined;
    }

    // 4. If IsCallable(func) is false, throw a TypeError exception.
    if (!func.isFunction) {
      throw new TypeError('If IsCallable(func) is false, throw a TypeError exception.');
    }

    // 5. Return func.
    return func as $Function;
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
    const intrinsics = this.realm['[[Intrinsics]]'];

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
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return ! OrdinaryPreventExtensions(O).

    // http://www.ecma-international.org/ecma-262/#sec-ordinarypreventextensions
    const O = this;

    // 1. Set O.[[Extensible]] to false.
    O['[[Extensible]]'] = intrinsics.false;

    // 2. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-getownproperty-p
  public '[[GetOwnProperty]]'(P: $PropertyKey): $PropertyDescriptor | $Undefined {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Return ! OrdinaryGetOwnProperty(O, P).

    // http://www.ecma-international.org/ecma-262/#sec-ordinarygetownproperty
    const O = this;

    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If O does not have an own property with key P, return undefined.
    if (!O.properties.has(P.value)) {
      return intrinsics.undefined;
    }

    // 3. Let D be a newly created Property Descriptor with no fields.
    const D = new $PropertyDescriptor(realm, P);

    // 4. Let X be O's own property whose key is P.
    const X = O.properties.get(P.value)!;

    // 5. If X is a data property, then
    if (X.isDataDescriptor) {
      // 5. a. Set D.[[Value]] to the value of X's [[Value]] attribute.
      D['[[Value]]'] = X['[[Value]]'];

      // 5. b. Set D.[[Writable]] to the value of X's [[Writable]] attribute.
      D['[[Writable]]'] = X['[[Writable]]'];
    }
    // 6. Else X is an accessor property,
    else {
      // 6. a. Set D.[[Get]] to the value of X's [[Get]] attribute.
      D['[[Get]]'] = X['[[Get]]'];

      // 6. b. Set D.[[Set]] to the value of X's [[Set]] attribute.
      D['[[Set]]'] = X['[[Set]]'];
    }

    // 7. Set D.[[Enumerable]] to the value of X's [[Enumerable]] attribute.
    D['[[Enumerable]]'] = X['[[Enumerable]]'];

    // 8. Set D.[[Configurable]] to the value of X's [[Configurable]] attribute.
    D['[[Configurable]]'] = X['[[Configurable]]'];

    // 9. Return D.
    return D;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-defineownproperty-p-desc
  public '[[DefineOwnProperty]]'(P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean {
    // 1. Return ? OrdinaryDefineOwnProperty(O, P, Desc).
    const O = this;

    // http://www.ecma-international.org/ecma-262/#sec-ordinarydefineownproperty

    // 1. Let current be ? O.[[GetOwnProperty]](P).
    const current = O['[[GetOwnProperty]]'](P);

    // 2. Let extensible be ? IsExtensible(O).
    const extensible = O['[[IsExtensible]]']();

    // 3. Return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current).
    return $ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current);
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-hasproperty-p
  public '[[HasProperty]]'(P: $PropertyKey): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return ? OrdinaryHasProperty(O, P).

    // http://www.ecma-international.org/ecma-262/#sec-ordinaryhasproperty
    const O = this;

    // 1. Assert: IsPropertyKey(P) is true.

    // 2. Let hasOwn be ? O.[[GetOwnProperty]](P).
    const hasOwn = O['[[GetOwnProperty]]'](P);

    // 3. If hasOwn is not undefined, return true.
    if (!hasOwn.isUndefined) {
      return intrinsics.true;
    }

    // 4. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = O['[[GetPrototypeOf]]']();

    // 5. If parent is not null, then
    if (!parent.isNull) {
      // 5. a. Return ? parent.[[HasProperty]](P).
      return parent['[[HasProperty]]'](P);
    }

    // 6. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver
  public '[[Get]]'(P: $PropertyKey, Receiver: $Any): $Any {
    const intrinsics = this.realm['[[Intrinsics]]'];
    // 1. Return ? OrdinaryGet(O, P, Receiver).

    // http://www.ecma-international.org/ecma-262/#sec-ordinaryget
    const O = this;

    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let desc be ? O.[[GetOwnProperty]](P).
    const desc = O['[[GetOwnProperty]]'](P);

    // 3. If desc is undefined, then
    if (desc.isUndefined) {
      // 3. a. Let parent be ? O.[[GetPrototypeOf]]().
      const parent = O['[[GetPrototypeOf]]']();

      // 3. b. If parent is null, return undefined.
      if (parent.isNull) {
        return intrinsics.undefined;
      }

      // 3. c. Return ? parent.[[Get]](P, Receiver).
      return parent['[[Get]]'](P, Receiver);
    }

    // 4. If IsDataDescriptor(desc) is true, return desc.[[Value]].
    if (desc.isDataDescriptor) {
      return desc['[[Value]]'];
    }

    // 5. Assert: IsAccessorDescriptor(desc) is true.
    // 6. Let getter be desc.[[Get]].
    const getter = desc['[[Get]]'] as $Function | $Undefined;

    // 7. If getter is undefined, return undefined.
    if (getter.isUndefined) {
      return getter;
    }

    // 8. Return ? Call(getter, Receiver).
    return $Call(getter, Receiver);
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-set-p-v-receiver
  public '[[Set]]'(P: $PropertyKey, V: $Any, Receiver: $Object): $Boolean {
    // 1. Return ? OrdinarySet(O, P, V, Receiver).

    // http://www.ecma-international.org/ecma-262/#sec-ordinaryset
    const O = this;

    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let ownDesc be ? O.[[GetOwnProperty]](P).
    const ownDesc = O['[[GetOwnProperty]]'](P);

    // 3. Return OrdinarySetWithOwnDescriptor(O, P, V, Receiver, ownDesc).
    return $OrdinarySetWithOwnDescriptor(O, P, V, Receiver, ownDesc);
  }

  // http://www.ecma-international.org/ecma-262/#sec-ordinary-object-internal-methods-and-internal-slots-delete-p
  public '[[Delete]]'(P: $PropertyKey): $Boolean {
    const intrinsics = this.realm['[[Intrinsics]]'];

    // 1. Return ? OrdinaryDelete(O, P).

    // http://www.ecma-international.org/ecma-262/#sec-ordinarydelete
    const O = this;

    // 1. Assert: IsPropertyKey(P) is true.
    // 2. Let desc be ? O.[[GetOwnProperty]](P).
    const desc = O['[[GetOwnProperty]]'](P);

    // 3. If desc is undefined, return true.
    if (desc.isUndefined) {
      return intrinsics.true;
    }

    // 4. If desc.[[Configurable]] is true, then
    if (desc['[[Configurable]]'].isTruthy) {
      // 4. a. Remove the own property with name P from O.
      O.properties.delete(P.value);

      // 4. b. Return true.
      return intrinsics.true;
    }

    // 5. Return false.
    return intrinsics.false;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects
export class $NamespaceExoticObject extends $Object<'NamespaceExoticObject'> {
  public readonly '[[Module]]': IModule;
  public readonly '[[Exports]]': readonly $String[];

  // http://www.ecma-international.org/ecma-262/#sec-modulenamespacecreate
  public constructor(
    realm: Realm,
    mod: IModule,
    exports: readonly $String[],
  ) {
    super(realm, 'NamespaceExoticObject', realm['[[Intrinsics]]'].null);
    // 1. Assert: module is a Module Record.
    // 2. Assert: module.[[Namespace]] is undefined.
    // 3. Assert: exports is a List of String values.
    // 4. Let M be a newly created object.
    // 5. Set M's essential internal methods to the definitions specified in 9.4.6.
    // 6. Set M.[[Module]] to module.
    this['[[Module]]'] = mod;

    // 7. Let sortedExports be a new List containing the same values as the list exports where the values are ordered as if an Array of the same values had been sorted using Array.prototype.sort using undefined as comparefn.
    // 8. Set M.[[Exports]] to sortedExports.
    this['[[Exports]]'] = exports.slice().sort();

    // 9. Create own properties of M corresponding to the definitions in 26.3.
    // 10. Set module.[[Namespace]] to M.
    mod['[[Namespace]]'] = this;

    // 11. Return M.
  }


  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-setprototypeof-v
  public '[[SetPrototypeOf]]'(V: $Object): $Boolean {
    // 1. Return ? SetImmutablePrototype(O, V).
    return $SetImmutablePrototype(this, V);
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-isextensible
  public '[[IsExtensible]]'(): $Boolean<false> {
    // 1. Return false.
    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-preventextensions
  public '[[PreventExtensions]]'(): $Boolean<true> {
    // 1. Return true.
    return this.realm['[[Intrinsics]]'].true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-getownproperty-p
  public '[[GetOwnProperty]]'(P: $PropertyKey): $PropertyDescriptor | $Undefined {
    // 1. If Type(P) is Symbol, return OrdinaryGetOwnProperty(O, P).
    if (P.isSymbol) {
      return super['[[GetOwnProperty]]'](P);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 2. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 3. If P is not an element of exports, return undefined.
    if (exports.every(x => !x.is(P))) {
      return intrinsics.undefined;
    }

    // 4. Let value be ? O.[[Get]](P, O).
    const value = O['[[Get]]'](P, O);

    // 5. Return PropertyDescriptor { [[Value]]: value, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: false }.
    const desc = new $PropertyDescriptor(realm, P);
    desc['[[Value]]'] = value;
    desc['[[Writable]]'] = intrinsics.true;
    desc['[[Enumerable]]'] = intrinsics.true;
    desc['[[Configurable]]'] = intrinsics.false;

    return desc;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-defineownproperty-p-desc
  public '[[DefineOwnProperty]]'(P: $PropertyKey, Desc: $PropertyDescriptor): $Boolean {
    // 1. If Type(P) is Symbol, return OrdinaryDefineOwnProperty(O, P, Desc).
    if (P.isSymbol) {
      return super['[[DefineOwnProperty]]'](P, Desc);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 2. Let current be ? O.[[GetOwnProperty]](P).
    const current = O['[[GetOwnProperty]]'](P);

    // 3. If current is undefined, return false.
    if (current.isUndefined) {
      return intrinsics.false;
    }

    // 4. If IsAccessorDescriptor(Desc) is true, return false.
    if (Desc.isAccessorDescriptor) {
      return intrinsics.false;
    }

    // 5. If Desc.[[Writable]] is present and has value false, return false.
    if (Desc['[[Writable]]'].value === false) {
      return intrinsics.false;
    }

    // 6. If Desc.[[Enumerable]] is present and has value false, return false.
    if (Desc['[[Enumerable]]'].value === false) {
      return intrinsics.false;
    }

    // 7. If Desc.[[Configurable]] is present and has value true, return false.
    if (Desc['[[Configurable]]'].value === true) {
      return intrinsics.false;
    }

    // 8. If Desc.[[Value]] is present, return SameValue(Desc.[[Value]], current.[[Value]]).
    if (!Desc['[[Value]]'].isEmpty) {
      if (Desc['[[Value]]'].is(current['[[Value]]'])) {
        return intrinsics.true;
      }
      return intrinsics.false;
    }

    // 9. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-hasproperty-p
  public '[[HasProperty]]'(P: $PropertyKey): $Boolean {
    // 1. If Type(P) is Symbol, return OrdinaryHasProperty(O, P).
    if (P.isSymbol) {
      return super['[[HasProperty]]'](P);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 2. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 3. If P is an element of exports, return true.
    if (exports.some(x => x.is(P))) {
      return intrinsics.true;
    }

    // 4. Return false.
    return intrinsics.false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-get-p-receiver
  public '[[Get]]'(P: $PropertyKey, Receiver: $Object): $Any {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If Type(P) is Symbol, then
    // 2. a. Return ? OrdinaryGet(O, P, Receiver).
    if (P.isSymbol) {
      return super['[[Get]]'](P, Receiver);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 3. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 4. If P is not an element of exports, return undefined.
    if (exports.every(x => !x.is(P))) {
      return intrinsics.undefined;
    }

    // 5. Let m be O.[[Module]].
    const m = O['[[Module]]'];

    // 6. Let binding be ! m.ResolveExport(P, « »).
    const binding = m.ResolveExport(P, new ResolveSet()) as ResolvedBindingRecord;

    // 7. Assert: binding is a ResolvedBinding Record.
    // 8. Let targetModule be binding.[[Module]].
    const targetModule = binding.Module;

    // 9. Assert: targetModule is not undefined.
    // 10. Let targetEnv be targetModule.[[Environment]].
    const targetEnv = targetModule['[[Environment]]'];

    // 11. If targetEnv is undefined, throw a ReferenceError exception.
    if (targetEnv.isUndefined) {
      throw new ReferenceError('11. If targetEnv is undefined, throw a ReferenceError exception.');
    }

    // 12. Let targetEnvRec be targetEnv's EnvironmentRecord.
    // 13. Return ? targetEnvRec.GetBindingValue(binding.[[BindingName]], true).
    return targetEnv.GetBindingValue(binding.BindingName, intrinsics.true);
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-set-p-v-receiver
  public '[[Set]]'(P: $PropertyKey, V: $Any, Receiver: $Object): $Boolean<false> {
    // 1. Return false.
    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-delete-p
  public '[[Delete]]'(P: $PropertyKey): $Boolean {
    // 1. Assert: IsPropertyKey(P) is true.
    // 2. If Type(P) is Symbol, then
    // 2. a. Return ? OrdinaryDelete(O, P).
    if (P.isSymbol) {
      return super['[[Delete]]'](P);
    }

    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const O = this;

    // 3. Let exports be O.[[Exports]].
    const exports = O['[[Exports]]'];

    // 4. If P is an element of exports, return false.
    if (exports.some(x => x.is(P))) {
      return intrinsics.false;
    }

    // 5. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-module-namespace-exotic-objects-ownpropertykeys
  public '[[OwnPropertyKeys]]'() {
    // 1. Let exports be a copy of O.[[Exports]].
    // 2. Let symbolKeys be ! OrdinaryOwnPropertyKeys(O).
    // 3. Append all the entries of symbolKeys to the end of exports.
    // 4. Return exports.
  }
}

// http://www.ecma-international.org/ecma-262/#table-6
export class $Function<
  T extends string = string,
> extends $Object<T> {
  public readonly '<$Function>': unknown;

  public get isFunction(): true { return true; }

  public constructor(
    realm: Realm,
    IntrinsicName: T,
    proto: $Object,
  ) {
    super(realm, IntrinsicName, proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects-call-thisargument-argumentslist
  public '[[Call]]'(thisArgument: $Any, argumentsList: readonly $Any[]): $Any {
    // TODO
    return {} as any;
  }
}

export type FunctionKind = 'normal' | 'classConstructor' | 'generator' | 'async' | 'async generator';
export type ConstructorKind = 'base' | 'derived';
export type ThisMode = 'lexical' | 'strict' | 'global';

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-function-objects
export class $ECMAScriptFunction<
  T extends string = string,
> extends $Function<T> {
  public readonly '<$ECMAScriptFunction>': unknown;

  public ['[[Environment]]']: $EnvRec;
  public ['[[FormalParameters]]']: readonly $ParameterDeclaration[];
  public ['[[FunctionKind]]']: FunctionKind;
  public ['[[ECMAScriptCode]]']: $Block | $$AssignmentExpressionOrHigher;
  public ['[[ConstructorKind]]']: ConstructorKind;
  public ['[[Realm]]']: Realm;
  public ['[[ScriptOrModule]]']: $SourceFile;
  public ['[[ThisMode]]']: ThisMode;
  public ['[[Strict]]']: $Boolean;
  public ['[[HomeObject]]']: $Object;
  public ['[[SourceText]]']: $String;

  public constructor(
    realm: Realm,
    IntrinsicName: T,
    proto: $Object,
  ) {
    super(realm, IntrinsicName, proto);
  }

  // http://www.ecma-international.org/ecma-262/#sec-functionallocate
  public static FunctionAllocate(
    functionPrototype: $Object,
    strict: $Boolean,
    functionKind: 'normal' | 'non-constructor' | 'generator' | 'async' | 'async generator',
  ): $ECMAScriptFunction {
    // 1. Assert: Type(functionPrototype) is Object.
    // 2. Assert: functionKind is either "normal", "non-constructor", "generator", "async", or "async generator".
    // 3. If functionKind is "normal", let needsConstruct be true.
    // 4. Else, let needsConstruct be false.
    const needsConstruct = functionKind === 'normal';

    // 5. If functionKind is "non-constructor", set functionKind to "normal".
    if (functionKind === 'non-constructor') {
      functionKind = 'normal';
    }

    const realm = functionPrototype.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 6. Let F be a newly created ECMAScript function object with the internal slots listed in Table 27. All of those internal slots are initialized to undefined.
    const F = new $ECMAScriptFunction(realm, 'function', functionPrototype);

    // 7. Set F's essential internal methods to the default ordinary object definitions specified in 9.1.
    // 8. Set F.[[Call]] to the definition specified in 9.2.1.
    // 9. If needsConstruct is true, then
    if (needsConstruct) {
      // 9. a. Set F.[[Construct]] to the definition specified in 9.2.2.
      // 9. b. Set F.[[ConstructorKind]] to "base".
      F['[[ConstructorKind]]'] = 'base';
    }

    // 10. Set F.[[Strict]] to strict.
    F['[[Strict]]'] = strict;

    // 11. Set F.[[FunctionKind]] to functionKind.
    F['[[FunctionKind]]'] = functionKind;

    // 12. Set F.[[Prototype]] to functionPrototype.
    F['[[Prototype]]'] = functionPrototype;

    // 13. Set F.[[Extensible]] to true.
    F['[[Extensible]]'] = intrinsics.true;

    // 14. Set F.[[Realm]] to the current Realm Record.
    F['[[Realm]]'] = realm;

    // 15. Return F.
    return F;
  }

  // http://www.ecma-international.org/ecma-262/#sec-functioninitialize
  public static FunctionInitialize(
    F: $ECMAScriptFunction,
    kind: 'normal' | 'method' | 'arrow',
    node: $FunctionDeclaration | $MethodDeclaration | $ArrowFunction,
    Scope: $EnvRec,
  ): $ECMAScriptFunction {
    const realm = F['[[Realm]]'];
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let len be the ExpectedArgumentCount of ParameterList.
    const len = node.ExpectedArgumentCount;

    // 2. Perform ! SetFunctionLength(F, len).
    const Desc = new $PropertyDescriptor(realm, intrinsics.length);
    Desc['[[Value]]'] = new $Number(realm, len);
    Desc['[[Writable]]'] = intrinsics.false;
    Desc['[[Enumerable]]'] = intrinsics.false;
    Desc['[[Configurable]]'] = intrinsics.true;
    $DefinePropertyOrThrow(F, intrinsics.length, Desc);

    // 3. Let Strict be F.[[Strict]].
    const Strict = F['[[Strict]]'];

    // 4. Set F.[[Environment]] to Scope.
    F['[[Environment]]'] = Scope;

    // 5. Set F.[[FormalParameters]] to ParameterList.
    F['[[FormalParameters]]'] = node.$parameters;

    // 6. Set F.[[ECMAScriptCode]] to Body.
    F['[[ECMAScriptCode]]'] = node.$body;

    // 7. Set F.[[ScriptOrModule]] to GetActiveScriptOrModule().
    F['[[ScriptOrModule]]'] = realm.GetActiveScriptOrModule();

    // 8. If kind is Arrow, set F.[[ThisMode]] to lexical.
    if (kind === 'arrow') {
      F['[[ThisMode]]'] = 'lexical';
    }
    // 9. Else if Strict is true, set F.[[ThisMode]] to strict.
    else if (Strict.isTruthy) {
      F['[[ThisMode]]'] = 'strict';
    }
    // 10. Else, set F.[[ThisMode]] to global.
    else {
      F['[[ThisMode]]'] = 'global';
    }

    // 11. Return F.
    return F;
  }


  // http://www.ecma-international.org/ecma-262/#sec-functioncreate
  public static FunctionCreate(
    kind: 'normal' | 'method' | 'arrow',
    node: $FunctionDeclaration | $MethodDeclaration | $ArrowFunction,
    Scope: $EnvRec,
    Strict: $Boolean,
    prototype?: $Object,
  ) {
    const realm = node.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If prototype is not present, then
    if (prototype === void 0) {
      // 1. a. Set prototype to the intrinsic object %FunctionPrototype%.
      prototype = intrinsics['%FunctionPrototype%'];
    }

    let allocKind: 'normal' | 'non-constructor';
    // 2. If kind is not Normal, let allocKind be "non-constructor".
    if (kind !== 'normal') {
      allocKind = 'non-constructor';
    }
    // 3. Else, let allocKind be "normal".
    else {
      allocKind = 'normal';
    }

    // 4. Let F be FunctionAllocate(prototype, Strict, allocKind).
    const F = this.FunctionAllocate(prototype!, Strict, allocKind);

    // 5. Return FunctionInitialize(F, kind, ParameterList, Body, Scope).
    return this.FunctionInitialize(F, kind, node, Scope);
  }

  // http://www.ecma-international.org/ecma-262/#sec-makeconstructor
  public MakeConstructor(writablePrototype?: $Boolean, prototype?: $Object): void {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];
    const F = this;

    // 1. Assert: F is an ECMAScript function object.
    // 2. Assert: IsConstructor(F) is true.
    // 3. Assert: F is an extensible object that does not have a prototype own property.
    // 4. If writablePrototype is not present, set writablePrototype to true.
    if (writablePrototype === void 0) {
      writablePrototype = intrinsics.true;
    }

    // 5. If prototype is not present, then
    if (prototype === void 0) {
      // 5. a. Set prototype to ObjectCreate(%ObjectPrototype%).
      prototype = $Object.ObjectCreate('constructor', intrinsics['%ObjectPrototype%']);

      // 5. b. Perform ! DefinePropertyOrThrow(prototype, "constructor", PropertyDescriptor { [[Value]]: F, [[Writable]]: writablePrototype, [[Enumerable]]: false, [[Configurable]]: true }).
      const Desc = new $PropertyDescriptor(realm, intrinsics.$constructor);
      Desc['[[Value]]'] = F;
      Desc['[[Writable]]'] = writablePrototype;
      Desc['[[Enumerable]]'] = intrinsics.false;
      Desc['[[Configurable]]'] = intrinsics.true;

      $DefinePropertyOrThrow(prototype, intrinsics.$constructor, Desc);
    }

    // 6. Perform ! DefinePropertyOrThrow(F, "prototype", PropertyDescriptor { [[Value]]: prototype, [[Writable]]: writablePrototype, [[Enumerable]]: false, [[Configurable]]: false }).
    const Desc = new $PropertyDescriptor(realm, intrinsics.$prototype);
    Desc['[[Value]]'] = prototype;
    Desc['[[Writable]]'] = writablePrototype;
    Desc['[[Enumerable]]'] = intrinsics.false;
    Desc['[[Configurable]]'] = intrinsics.false;

    $DefinePropertyOrThrow(F, intrinsics.$prototype, Desc);

    // 7. Return NormalCompletion(undefined).
  }

  // http://www.ecma-international.org/ecma-262/#sec-setfunctionname
  public SetFunctionName(name: $String | $Symbol, prefix?: $String): $Boolean {
    const realm = this.realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Assert: F is an extensible object that does not have a name own property.
    // 2. Assert: Type(name) is either Symbol or String.
    // 3. Assert: If prefix is present, then Type(prefix) is String.
    // 4. If Type(name) is Symbol, then
    if (name.isSymbol) {
      // 4. a. Let description be name's [[Description]] value.
      const description = name.Description;

      // 4. b. If description is undefined, set name to the empty String.
      if (description.isUndefined) {
        name = intrinsics[''];
      }
      // 4. c. Else, set name to the string-concatenation of "[", description, and "]".
      else {
        name = new $String(realm, `[${description.value}]`);
      }
    }

    // 5. If prefix is present, then
    if (prefix !== void 0) {
      // 5. a. Set name to the string-concatenation of prefix, the code unit 0x0020 (SPACE), and name.
      name = new $String(realm, `${prefix.value} ${name.value}`);
    }

    // 6. Return ! DefinePropertyOrThrow(F, "name", PropertyDescriptor { [[Value]]: name, [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]: true }).
    const Desc = new $PropertyDescriptor(realm, intrinsics.$prototype);
    Desc['[[Value]]'] = name;
    Desc['[[Writable]]'] = intrinsics.false;
    Desc['[[Enumerable]]'] = intrinsics.false;
    Desc['[[Configurable]]'] = intrinsics.true;

    return $DefinePropertyOrThrow(this, intrinsics.$name, Desc);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-built-in-function-objects
export class $BuiltinFunction<
  T extends string = string,
> extends $Function<T> {
  public readonly '<$BuiltinFunction>': unknown;

  public constructor(
    realm: Realm,
    IntrinsicName: T,
    proto: $Object,
    private readonly $invoke: CallableFunction,
  ) {
    super(realm, IntrinsicName, proto);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reference-specification-type
export class $Reference {
  public readonly '<$Reference>': unknown;

  public constructor(
    public readonly realm: Realm,
    public readonly baseValue: $Object | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined,
    public readonly referencedName: $String,
    public readonly strict: $Boolean,
    public readonly thisValue: $Object | $Boolean | $String | $Symbol | $Number | $Undefined,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-getbase
  public GetBase(): $Object | $Boolean | $String | $Symbol | $Number | $EnvRec | $Undefined {
    // 1. Assert: Type(V) is Reference.
    // 2. Return the base value component of V.
    return this.baseValue;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getreferencedname
  public GetReferencedName(): $String {
    // 1. Assert: Type(V) is Reference.
    // 2. Return the referenced name component of V.
    return this.referencedName;
  }

  // http://www.ecma-international.org/ecma-262/#sec-isstrictreference
  public IsStrictReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. Return the strict reference flag of V.
    return this.strict;
  }

  // http://www.ecma-international.org/ecma-262/#sec-hasprimitivebase
  public HasPrimitiveBase(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If Type(V's base value component) is Boolean, String, Symbol, or Number, return true; otherwise return false.
    if (this.baseValue.isPrimitive && !this.baseValue.isUndefined) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-ispropertyreference
  public IsPropertyReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If either the base value component of V is an Object or HasPrimitiveBase(V) is true, return true; otherwise return false.
    if (this.baseValue.isObject || this.HasPrimitiveBase().isTruthy) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-isunresolvablereference
  public IsUnresolvableReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If the base value component of V is undefined, return true; otherwise return false.
    if (this.baseValue.isUndefined) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-issuperreference
  public IsSuperReference(): $Boolean {
    // 1. Assert: Type(V) is Reference.
    // 2. If V has a thisValue component, return true; otherwise return false.
    if (!this.thisValue.isUndefined) {
      return this.realm['[[Intrinsics]]'].true;
    }

    return this.realm['[[Intrinsics]]'].false;
  }

  // http://www.ecma-international.org/ecma-262/#sec-getvalue
  public GetValue(): $Any {
    // 1. ReturnIfAbrupt(V).
    // 2. If Type(V) is not Reference, return V.
    // 3. Let base be GetBase(V).
    let base = this.GetBase();

    // 4. If IsUnresolvableReference(V) is true, throw a ReferenceError exception.
    if (this.IsUnresolvableReference().isTruthy) {
      throw new ReferenceError(`4. If IsUnresolvableReference(V) is true, throw a ReferenceError exception.`);
    }

    // 5. If IsPropertyReference(V) is true, then
    if (this.IsPropertyReference().isTruthy) {
      // 5. a. If HasPrimitiveBase(V) is true, then
      if (this.HasPrimitiveBase().isTruthy) {
        // 5. a. i. Assert: In this case, base will never be undefined or null.
        // 5. a. ii. Set base to ! ToObject(base).
        base = (base as $Boolean | $String | $Symbol | $Number).ToObject();
      }

      // 5. b. Return ? base.[[Get]](GetReferencedName(V), GetThisValue(V)).
      return (base as $Object)['[[Get]]'](this.GetReferencedName(), this.GetThisValue());
    }
    // 6. Else base must be an Environment Record,
    else {
      // 6. a. Return ? base.GetBindingValue(GetReferencedName(V), IsStrictReference(V)) (see 8.1.1).
      return (base as $EnvRec).GetBindingValue(this.GetReferencedName(), this.IsStrictReference());
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-putvalue
  public PutValue(W: $Any): $Boolean | $Empty {
    // 1. ReturnIfAbrupt(V).
    // 2. ReturnIfAbrupt(W).
    // 3. If Type(V) is not Reference, throw a ReferenceError exception.
    // 4. Let base be GetBase(V).
    let base = this.GetBase();

    // 5. If IsUnresolvableReference(V) is true, then
    if (this.IsUnresolvableReference().isTruthy) {
      // 5. a. If IsStrictReference(V) is true, then
      if (this.IsStrictReference().isTruthy) {
        // 5. a. i. Throw a ReferenceError exception.
        throw new ReferenceError();
      }

      // 5. b. Let globalObj be GetGlobalObject().
      const globalObj = this.realm['[[GlobalObject]]'];

      // 5. c. Return ? Set(globalObj, GetReferencedName(V), W, false).
      return $Set(globalObj, this.GetReferencedName(), W, this.realm['[[Intrinsics]]'].false);
    }
    // 6. Else if IsPropertyReference(V) is true, then
    else if (this.IsPropertyReference().isTruthy) {
      // 6. a. If HasPrimitiveBase(V) is true, then
      if (this.HasPrimitiveBase().isTruthy) {
        // 6. a. i. Assert: In this case, base will never be undefined or null.
        // 6. a. ii. Set base to ! ToObject(base).
        base = (base as $Boolean | $String | $Symbol | $Number).ToObject();
      }

      // 6. b. Let succeeded be ? base.[[Set]](GetReferencedName(V), W, GetThisValue(V)).
      const succeeded = (base as $Object)['[[Set]]'](this.GetReferencedName(), W, this.GetThisValue() as $Object);

      // 6. c. If succeeded is false and IsStrictReference(V) is true, throw a TypeError exception.
      if (succeeded.isFalsey && this.IsStrictReference().isTruthy) {
        throw new TypeError();
      }

      // 6. d. Return.
      return this.realm['[[Intrinsics]]'].empty;
    }
    // 7. Else base must be an Environment Record,
    else {
      // 7. a. Return ? base.SetMutableBinding(GetReferencedName(V), W, IsStrictReference(V)) (see 8.1.1).
      return (base as $EnvRec).SetMutableBinding(this.GetReferencedName(), W, this.IsStrictReference());
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-getthisvalue
  public GetThisValue(): $Object | $Boolean | $String | $Symbol | $Number {
    // 1. Assert: IsPropertyReference(V) is true.
    // 2. If IsSuperReference(V) is true, then
    if (this.IsSuperReference().isTruthy) {
      // 2. a. Return the value of the thisValue component of the reference V.
      return this.thisValue as $Object | $Boolean | $String | $Symbol | $Number;
    }

    // 3. Return GetBase(V).
    return this.GetBase() as $Object | $Boolean | $String | $Symbol | $Number;
  }

  // http://www.ecma-international.org/ecma-262/#sec-initializereferencedbinding
  public InitializeReferencedBinding(W: $Any): $Boolean | $Empty {
    // 1. ReturnIfAbrupt(V).
    // 2. ReturnIfAbrupt(W).
    // 3. Assert: Type(V) is Reference.
    // 4. Assert: IsUnresolvableReference(V) is false.
    // 5. Let base be GetBase(V).
    const base = this.GetBase();

    // 6. Assert: base is an Environment Record.
    // 7. Return base.InitializeBinding(GetReferencedName(V), W).
    return (base as $EnvRec).InitializeBinding(this.GetReferencedName(), W);
  }
}
