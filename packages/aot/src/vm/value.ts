/* eslint-disable */
import { Realm, IModule, ResolveSet, ResolvedBindingRecord } from './realm';
import { $PropertyDescriptor } from './property-descriptor';
import { $Call, $ValidateAndApplyPropertyDescriptor, $OrdinarySetWithOwnDescriptor, $SetImmutablePrototype } from './operations';
import { $EnvRec } from './environment';
import { $ParameterDeclaration, $Block, $$AssignmentExpressionOrHigher } from './ast';

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

  public constructor(
    public readonly realm: Realm,
  ) {}

  public is(other: $Any): other is $Empty {
    return other instanceof $Empty;
  }
}

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

  public constructor(
    public readonly realm: Realm,
  ) {}

  public is(other: $Any): other is $Undefined {
    return other instanceof $Undefined;
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

  public constructor(
    public readonly realm: Realm,
  ) {}

  public is(other: $Any): other is $Null {
    return other instanceof $Null;
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

  public constructor(
    public readonly realm: Realm,
    public readonly value: T,
  ) {}

  public is(other: $Any): other is $Boolean<T> {
    return other instanceof $Boolean && this.value === other.value;
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

  public constructor(
    public readonly realm: Realm,
    public readonly value: T,
  ) {}

  public is(other: $Any): other is $String<T> {
    return other instanceof $String && this.value === other.value;
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

  public constructor(
    public readonly realm: Realm,
    public readonly Description: T,
    public readonly value = Symbol(Description.value),
  ) {}

  public is(other: $Any): other is $Symbol<T> {
    return other instanceof $Symbol && this.value === other.value;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-ecmascript-language-types-number-type
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
  public get isTruthy(): boolean { return this.value !== 0 && !isNaN(this.value); }
  public get isFalsey(): boolean { return this.value === 0 || isNaN(this.value); }

  public constructor(
    public readonly realm: Realm,
    public readonly value: T,
  ) {}

  public is(other: $Any): other is $Number<T> {
    return other instanceof $Number && Object.is(this.value, other.value);
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

  public constructor(
    public readonly realm: Realm,
    public readonly IntrinsicName: T,
    proto: $Object | $Null,
  ) {
    this['[[Prototype]]'] = proto;
    this['[[Extensible]]'] = realm['[[Intrinsics]]'].true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-objectcreate
  public static Create<T extends string = string, TSlots extends {} = {}>(
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
  public readonly '[[Exports]]': readonly string[];

  // http://www.ecma-international.org/ecma-262/#sec-modulenamespacecreate
  public constructor(
    realm: Realm,
    mod: IModule,
    exports: readonly string[],
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
    if (!exports.includes(P.value)) {
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
    if (exports.includes(P.value)) {
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
    if (!exports.includes(P.value)) {
      return intrinsics.undefined;
    }

    // 5. Let m be O.[[Module]].
    const m = O['[[Module]]'];

    // 6. Let binding be ! m.ResolveExport(P, « »).
    const binding = m.ResolveExport(P.value, new ResolveSet()) as ResolvedBindingRecord;

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
    if (exports.includes(P.value)) {
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
  public ['[[ScriptOrModule]]']: IModule;
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
