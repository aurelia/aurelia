import {
  $BuiltinFunction,
  $Function,
  $OrdinaryCreateFromConstructor,
} from '../types/function.js';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
  CompletionType,
} from '../types/_shared.js';
import {
  $Undefined,
} from '../types/undefined.js';
import {
  $Object,
} from '../types/object.js';
import {
  $String,
} from '../types/string.js';
import {
  $StringExoticObject,
} from '../exotics/string.js';
import {
  $FunctionPrototype,
} from './function.js';
import {
  $List
} from '../types/list.js';

// http://www.ecma-international.org/ecma-262/#sec-object-constructor
// #region 19.1.1 The Object Constructor
export class $ObjectConstructor extends $BuiltinFunction<'%Object%'> {
  // http://www.ecma-international.org/ecma-262/#sec-object.prototype
  // 19.1.2.19 Object.prototype
  public get $prototype(): $ObjectPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $ObjectPrototype;
  }
  public set $prototype(value: $ObjectPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.assign
  // 19.1.2.1 Object.assign ( target , ... sources )
  public get $assign(): $Object_assign {
    return this.getProperty(this.realm['[[Intrinsics]]'].$assign)['[[Value]]'] as $Object_assign;
  }
  public set $assign(value: $Object_assign) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$assign, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.create
  // 19.1.2.2 Object.create ( O , Properties )
  public get $create(): $Object_create {
    return this.getProperty(this.realm['[[Intrinsics]]'].$create)['[[Value]]'] as $Object_create;
  }
  public set $create(value: $Object_create) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$create, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.defineproperties
  // 19.1.2.3 Object.defineProperties ( O , Properties )
  public get $defineProperties(): $Object_defineProperties {
    return this.getProperty(this.realm['[[Intrinsics]]'].$defineProperties)['[[Value]]'] as $Object_defineProperties;
  }
  public set $defineProperties(value: $Object_defineProperties) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$defineProperties, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.defineproperty
  // 19.1.2.4 Object.defineProperty ( O , P , Attributes )
  public get $defineProperty(): $Object_defineProperty {
    return this.getProperty(this.realm['[[Intrinsics]]'].$defineProperty)['[[Value]]'] as $Object_defineProperty;
  }
  public set $defineProperty(value: $Object_defineProperty) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$defineProperty, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.entries
  // 19.1.2.5 Object.entries ( O )
  public get $entries(): $Object_entries {
    return this.getProperty(this.realm['[[Intrinsics]]'].$entries)['[[Value]]'] as $Object_entries;
  }
  public set $entries(value: $Object_entries) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$entries, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.freeze
  // 19.1.2.6 Object.freeze ( O )
  public get $freeze(): $Object_freeze {
    return this.getProperty(this.realm['[[Intrinsics]]'].$freeze)['[[Value]]'] as $Object_freeze;
  }
  public set $freeze(value: $Object_freeze) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$freeze, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.fromentries
  // 19.1.2.7 Object.fromEntries ( iterable )
  public get $fromEntries(): $Object_fromEntries {
    return this.getProperty(this.realm['[[Intrinsics]]'].$fromEntries)['[[Value]]'] as $Object_fromEntries;
  }
  public set $fromEntries(value: $Object_fromEntries) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$fromEntries, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptor
  // 19.1.2.8 Object.getOwnPropertyDescriptor ( O , P )
  public get $getOwnPropertyDescriptor(): $Object_getOwnPropertyDescriptor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor)['[[Value]]'] as $Object_getOwnPropertyDescriptor;
  }
  public set $getOwnPropertyDescriptor(value: $Object_getOwnPropertyDescriptor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptors
  // 19.1.2.9 Object.getOwnPropertyDescriptors ( O )
  public get $getOwnPropertyDescriptors(): $Object_getOwnPropertyDescriptors {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptors)['[[Value]]'] as $Object_getOwnPropertyDescriptors;
  }
  public set $getOwnPropertyDescriptors(value: $Object_getOwnPropertyDescriptors) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptors, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertynames
  // 19.1.2.10 Object.getOwnPropertyNames ( O )
  public get $getOwnPropertyNames(): $Object_getOwnPropertyNames {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyNames)['[[Value]]'] as $Object_getOwnPropertyNames;
  }
  public set $getOwnPropertyNames(value: $Object_getOwnPropertyNames) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyNames, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.getownpropertysymbols
  // 19.1.2.11 Object.getOwnPropertySymbols ( O )
  public get $getOwnPropertySymbols(): $Object_getOwnPropertySymbols {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertySymbols)['[[Value]]'] as $Object_getOwnPropertySymbols;
  }
  public set $getOwnPropertySymbols(value: $Object_getOwnPropertySymbols) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertySymbols, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.getprototypeof
  // 19.1.2.12 Object.getPrototypeOf ( O )
  public get $getPrototypeOf(): $Object_getPrototypeOf {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf)['[[Value]]'] as $Object_getPrototypeOf;
  }
  public set $getPrototypeOf(value: $Object_getPrototypeOf) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.is
  // 19.1.2.13 Object.is ( value1 , value2 )
  public get $is(): $Object_is {
    return this.getProperty(this.realm['[[Intrinsics]]'].$is)['[[Value]]'] as $Object_is;
  }
  public set $is(value: $Object_is) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$is, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.isextensible
  // 19.1.2.14 Object.isExtensible ( O )
  public get $isExtensible(): $Object_isExtensible {
    return this.getProperty(this.realm['[[Intrinsics]]'].$isExtensible)['[[Value]]'] as $Object_isExtensible;
  }
  public set $isExtensible(value: $Object_isExtensible) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$isExtensible, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.isfrozen
  // 19.1.2.15 Object.isFrozen ( O )
  public get $isFrozen(): $Object_isFrozen {
    return this.getProperty(this.realm['[[Intrinsics]]'].$isFrozen)['[[Value]]'] as $Object_isFrozen;
  }
  public set $isFrozen(value: $Object_isFrozen) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$isFrozen, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.issealed
  // 19.1.2.16 Object.isSealed ( O )
  public get $isSealed(): $Object_isSealed {
    return this.getProperty(this.realm['[[Intrinsics]]'].$isSealed)['[[Value]]'] as $Object_isSealed;
  }
  public set $isSealed(value: $Object_isSealed) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$isSealed, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.keys
  // 19.1.2.17 Object.keys ( O )
  public get $keys(): $Object_keys {
    return this.getProperty(this.realm['[[Intrinsics]]'].$keys)['[[Value]]'] as $Object_keys;
  }
  public set $keys(value: $Object_keys) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$keys, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.preventextensions
  // 19.1.2.18 Object.preventExtensions ( O )
  public get $preventExtensions(): $Object_preventExtensions {
    return this.getProperty(this.realm['[[Intrinsics]]'].$preventExtensions)['[[Value]]'] as $Object_preventExtensions;
  }
  public set $preventExtensions(value: $Object_preventExtensions) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$preventExtensions, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.seal
  // 19.1.2.20 Object.seal ( O )
  public get $seal(): $Object_seal {
    return this.getProperty(this.realm['[[Intrinsics]]'].$seal)['[[Value]]'] as $Object_seal;
  }
  public set $seal(value: $Object_seal) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$seal, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.setprototypeof
  // 19.1.2.21 Object.setPrototypeOf ( O , proto )
  public get $setPrototypeOf(): $Object_setPrototypeOf {
    return this.getProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf)['[[Value]]'] as $Object_setPrototypeOf;
  }
  public set $setPrototypeOf(value: $Object_setPrototypeOf) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.values
  // 19.1.2.22 Object.values ( O )
  public get $values(): $Object_values {
    return this.getProperty(this.realm['[[Intrinsics]]'].$values)['[[Value]]'] as $Object_values;
  }
  public set $values(value: $Object_values) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$values, value);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Object%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-value
  // 19.1.1.1 Object ( [ value ] )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If NewTarget is neither undefined nor the active function, then
    if (!NewTarget.isUndefined && NewTarget !== this) {
      // 1. a. Return ? OrdinaryCreateFromConstructor(NewTarget, "%ObjectPrototype%").
      return $OrdinaryCreateFromConstructor(ctx, NewTarget, '%ObjectPrototype%');
    }

    // 2. If value is null, undefined or not supplied, return ObjectCreate(%ObjectPrototype%).
    if (value === void 0 || value.isNil) {
      return $Object.ObjectCreate(ctx, 'Object', intrinsics['%ObjectPrototype%']);
    }

    // 3. Return ! ToObject(value).
    return value.ToObject(ctx);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.assign
// 19.1.2.1 Object.assign ( target , ... sources )
export class $Object_assign extends $BuiltinFunction<'Object.assign'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.assign', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let to be ? ToObject(target).
    // 2. If only one argument was passed, return to.
    // 3. Let sources be the List of argument values starting with the second argument.
    // 4. For each element nextSource of sources, in ascending index order, do
      // 4. a. If nextSource is neither undefined nor null, then
        // 4. a. i. Let from be ! ToObject(nextSource).
        // 4. a. ii. Let keys be ? from.[[OwnPropertyKeys]]().
        // 4. a. iii. For each element nextKey of keys in List order, do
          // 4. a. iii. 1. Let desc be ? from.[[GetOwnProperty]](nextKey).
          // 4. a. iii. 2. If desc is not undefined and desc.[[Enumerable]] is true, then
            // 4. a. iii. 2. a. Let propValue be ? Get(from, nextKey).
            // 4. a. iii. 2. b. Perform ? Set(to, nextKey, propValue, true).
    // 5. Return to.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.create
// 19.1.2.2 Object.create ( O , Properties )
export class $Object_create extends $BuiltinFunction<'Object.create'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.create', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is neither Object nor Null, throw a TypeError exception.
    // 2. Let obj be ObjectCreate(O).
    // 3. If Properties is not undefined, then
      // 3. a. Return ? ObjectDefineProperties(obj, Properties).
    // 4. Return obj.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.defineproperties
// 19.1.2.3 Object.defineProperties ( O , Properties )
export class $Object_defineProperties extends $BuiltinFunction<'Object.defineProperties'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.defineProperties', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Return ? ObjectDefineProperties(O, Properties).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-objectdefineproperties
// 19.1.2.3.1 Runtime Semantics: ObjectDefineProperties ( O , Properties )
export function $ObjectDefineProperties(
  ctx: ExecutionContext,
  O: any,
  Properties: any,
): any {
  // 1. If Type(O) is not Object, throw a TypeError exception.
  // 2. Let props be ? ToObject(Properties).
  // 3. Let keys be ? props.[[OwnPropertyKeys]]().
  // 4. Let descriptors be a new empty List.
  // 5. For each element nextKey of keys in List order, do
    // 5. a. Let propDesc be ? props.[[GetOwnProperty]](nextKey).
    // 5. b. If propDesc is not undefined and propDesc.[[Enumerable]] is true, then
      // 5. b. i. Let descObj be ? Get(props, nextKey).
      // 5. b. ii. Let desc be ? ToPropertyDescriptor(descObj).
      // 5. b. iii. Append the pair (a two element List) consisting of nextKey and desc to the end of descriptors.
  // 6. For each pair from descriptors in list order, do
    // 6. a. Let P be the first element of pair.
    // 6. b. Let desc be the second element of pair.
    // 6. c. Perform ? DefinePropertyOrThrow(O, P, desc).
  // 7. Return O.

  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-object.defineproperty
// 19.1.2.4 Object.defineProperty ( O , P , Attributes )
export class $Object_defineProperty extends $BuiltinFunction<'Object.defineProperty'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.defineProperty', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, throw a TypeError exception.
    // 2. Let key be ? ToPropertyKey(P).
    // 3. Let desc be ? ToPropertyDescriptor(Attributes).
    // 4. Perform ? DefinePropertyOrThrow(O, key, desc).
    // 5. Return O.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.entries
// 19.1.2.5 Object.entries ( O )
export class $Object_entries extends $BuiltinFunction<'Object.entries'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.entries', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let obj be ? ToObject(O).
    // 2. Let nameList be ? EnumerableOwnPropertyNames(obj, "key+value").
    // 3. Return CreateArrayFromList(nameList).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.freeze
// 19.1.2.6 Object.freeze ( O )
export class $Object_freeze extends $BuiltinFunction<'Object.freeze'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.freeze', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, return O.
    // 2. Let status be ? SetIntegrityLevel(O, "frozen").
    // 3. If status is false, throw a TypeError exception.
    // 4. Return O.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.fromentries
// 19.1.2.7 Object.fromEntries ( iterable )
export class $Object_fromEntries extends $BuiltinFunction<'Object.fromEntries'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.fromEntries', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Perform ? RequireObjectCoercible(iterable).
    // 2. Let obj be ObjectCreate(%ObjectPrototype%).
    // 3. Assert: obj is an extensible ordinary object with no own properties.
    // 4. Let stepsDefine be the algorithm steps defined in CreateDataPropertyOnObject Functions.
    // 5. Let adder be CreateBuiltinFunction(stepsDefine, « »).
    // 6. Return ? AddEntriesFromIterable(obj, iterable, adder).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-create-data-property-on-object-functions
// 19.1.2.7.1 CreateDataPropertyOnObject Functions
export class $CreateDataPropertyOnObject extends $BuiltinFunction<'CreateDataPropertyOnObject'> {
  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'CreateDataPropertyOnObject', intrinsics['%FunctionPrototype%']);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }
    // 1. Let O be the this value.
    // 2. Assert: Type(O) is Object.
    // 3. Assert: O is an extensible ordinary object.
    // 4. Let propertyKey be ? ToPropertyKey(key).
    // 5. Perform ! CreateDataPropertyOrThrow(O, propertyKey, value).
    // 6. Return undefined.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptor
// 19.1.2.8 Object.getOwnPropertyDescriptor ( O , P )
export class $Object_getOwnPropertyDescriptor extends $BuiltinFunction<'Object.getOwnPropertyDescriptor'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.getOwnPropertyDescriptor', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let obj be ? ToObject(O).
    // 2. Let key be ? ToPropertyKey(P).
    // 3. Let desc be ? obj.[[GetOwnProperty]](key).
    // 4. Return FromPropertyDescriptor(desc).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertydescriptors
// 19.1.2.9 Object.getOwnPropertyDescriptors ( O )
export class $Object_getOwnPropertyDescriptors extends $BuiltinFunction<'Object.getOwnPropertyDescriptors'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.getOwnPropertyDescriptors', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let obj be ? ToObject(O).
    // 2. Let ownKeys be ? obj.[[OwnPropertyKeys]]().
    // 3. Let descriptors be ! ObjectCreate(%ObjectPrototype%).
    // 4. For each element key of ownKeys in List order, do
      // 4. a. Let desc be ? obj.[[GetOwnProperty]](key).
      // 4. b. Let descriptor be ! FromPropertyDescriptor(desc).
      // 4. c. If descriptor is not undefined, perform ! CreateDataProperty(descriptors, key, descriptor).
    // 5. Return descriptors.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertynames
// 19.1.2.10 Object.getOwnPropertyNames ( O )
export class $Object_getOwnPropertyNames extends $BuiltinFunction<'Object.getOwnPropertyNames'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.getOwnPropertyNames', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Return ? GetOwnPropertyKeys(O, String).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.getownpropertysymbols
// 19.1.2.11 Object.getOwnPropertySymbols ( O )
export class $Object_getOwnPropertySymbols extends $BuiltinFunction<'Object.getOwnPropertySymbols'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.getOwnPropertySymbols', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Return ? GetOwnPropertyKeys(O, Symbol).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-getownpropertykeys
// 19.1.2.11.1 Runtime Semantics: GetOwnPropertyKeys ( O , type )
export function $GetOwnPropertyKeys(
  ctx: ExecutionContext,
  O: any,
  type: any,
): any {
  // 1. Let obj be ? ToObject(O).
  // 2. Let keys be ? obj.[[OwnPropertyKeys]]().
  // 3. Let nameList be a new empty List.
  // 4. For each element nextKey of keys in List order, do
    // 4. a. If Type(nextKey) is type, then
      // 4. a. i. Append nextKey as the last element of nameList.
  // 5. Return CreateArrayFromList(nameList).

  throw new Error('Method not implemented.');
}

// http://www.ecma-international.org/ecma-262/#sec-object.getprototypeof
// 19.1.2.12 Object.getPrototypeOf ( O )
export class $Object_getPrototypeOf extends $BuiltinFunction<'Object.getPrototypeOf'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.getPrototypeOf', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let obj be ? ToObject(O).
    // 2. Return ? obj.[[GetPrototypeOf]]().

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.is
// 19.1.2.13 Object.is ( value1 , value2 )
export class $Object_is extends $BuiltinFunction<'Object.is'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.is', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Return SameValue(value1, value2).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.isextensible
// 19.1.2.14 Object.isExtensible ( O )
export class $Object_isExtensible extends $BuiltinFunction<'Object.isExtensible'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.isExtensible', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, return false.
    // 2. Return ? IsExtensible(O).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.isfrozen
// 19.1.2.15 Object.isFrozen ( O )
export class $Object_isFrozen extends $BuiltinFunction<'Object.isFrozen'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.isFrozen', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, return true.
    // 2. Return ? TestIntegrityLevel(O, "frozen").

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.issealed
// 19.1.2.16 Object.isSealed ( O )
export class $Object_isSealed extends $BuiltinFunction<'Object.isSealed'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.isSealed', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, return true.
    // 2. Return ? TestIntegrityLevel(O, "sealed").

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.keys
// 19.1.2.17 Object.keys ( O )
export class $Object_keys extends $BuiltinFunction<'Object.keys'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.keys', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let obj be ? ToObject(O).
    // 2. Let nameList be ? EnumerableOwnPropertyNames(obj, "key").
    // 3. Return CreateArrayFromList(nameList).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.preventextensions
// 19.1.2.18 Object.preventExtensions ( O )
export class $Object_preventExtensions extends $BuiltinFunction<'Object.preventExtensions'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.preventExtensions', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, return O.
    // 2. Let status be ? O.[[PreventExtensions]]().
    // 3. If status is false, throw a TypeError exception.
    // 4. Return O.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.seal
// 19.1.2.20 Object.seal ( O )
export class $Object_seal extends $BuiltinFunction<'Object.seal'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.seal', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. If Type(O) is not Object, return O.
    // 2. Let status be ? SetIntegrityLevel(O, "sealed").
    // 3. If status is false, throw a TypeError exception.
    // 4. Return O.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.setprototypeof
// 19.1.2.21 Object.setPrototypeOf ( O , proto )
export class $Object_setPrototypeOf extends $BuiltinFunction<'Object.setPrototypeOf'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.setPrototypeOf', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Set O to ? RequireObjectCoercible(O).
    // 2. If Type(proto) is neither Object nor Null, throw a TypeError exception.
    // 3. If Type(O) is not Object, return O.
    // 4. Let status be ? O.[[SetPrototypeOf]](proto).
    // 5. If status is false, throw a TypeError exception.
    // 6. Return O.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.values
// 19.1.2.22 Object.values ( O )
export class $Object_values extends $BuiltinFunction<'Object.values'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.values', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [O]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (O === void 0) {
      O = intrinsics.undefined;
    }

    // 1. Let obj be ? ToObject(O).
    // 2. Let nameList be ? EnumerableOwnPropertyNames(obj, "value").
    // 3. Return CreateArrayFromList(nameList).

    throw new Error('Method not implemented.');
  }
}

// #endregion

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-object-prototype-object
// #region 19.1.3 Properties of the Object Prototype Object
export class $ObjectPrototype extends $Object<'%ObjectPrototype%'> {
  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.constructor
  // 19.1.3.1 Object.prototype.constructor
  public get $constructor(): $ObjectConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $ObjectConstructor;
  }
  public set $constructor(value: $ObjectConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.hasownproperty
  // 19.1.3.2 Object.prototype.hasOwnProperty ( V )
  public get $hasOwnProperty(): $ObjectPrototype_hasOwnProperty {
    return this.getProperty(this.realm['[[Intrinsics]]'].$hasOwnProperty)['[[Value]]'] as $ObjectPrototype_hasOwnProperty;
  }
  public set $hasOwnProperty(value: $ObjectPrototype_hasOwnProperty) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$hasOwnProperty, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.isprototypeof
  // 19.1.3.3 Object.prototype.isPrototypeOf ( V )
  public get $isPrototypeOf(): $ObjectPrototype_isPrototypeOf {
    return this.getProperty(this.realm['[[Intrinsics]]'].$isPrototypeOf)['[[Value]]'] as $ObjectPrototype_isPrototypeOf;
  }
  public set $isPrototypeOf(value: $ObjectPrototype_isPrototypeOf) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$isPrototypeOf, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.propertyisenumerable
  // 19.1.3.4 Object.prototype.propertyIsEnumerable ( V )
  public get $propertyIsEnumerable(): $ObjectPrototype_propertyIsEnumerable {
    return this.getProperty(this.realm['[[Intrinsics]]'].$propertyIsEnumerable)['[[Value]]'] as $ObjectPrototype_propertyIsEnumerable;
  }
  public set $propertyIsEnumerable(value: $ObjectPrototype_propertyIsEnumerable) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$propertyIsEnumerable, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.tolocalestring
  // 19.1.3.5 Object.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
  public get $toLocaleString(): $ObjectPrototype_toLocaleString {
    return this.getProperty(this.realm['[[Intrinsics]]'].$toLocaleString)['[[Value]]'] as $ObjectPrototype_toLocaleString;
  }
  public set $toLocaleString(value: $ObjectPrototype_toLocaleString) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$toLocaleString, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.tostring
  // 19.1.3.6 Object.prototype.toString ( )
  public get $toString(): $ObjProto_toString {
    return this.getProperty(this.realm['[[Intrinsics]]'].$toString)['[[Value]]'] as $ObjProto_toString;
  }
  public set $toString(value: $ObjProto_toString) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$toString, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object.prototype.valueof
  // 19.1.3.7 Object.prototype.valueOf ( )
  public get $valueOf(): $ObjProto_valueOf {
    return this.getProperty(this.realm['[[Intrinsics]]'].$valueOf)['[[Value]]'] as $ObjProto_valueOf;
  }
  public set $valueOf(value: $ObjProto_valueOf) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$valueOf, value);
  }

  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%ObjectPrototype%', intrinsics.null, CompletionType.normal, intrinsics.empty);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.hasownproperty
// 19.1.3.2 Object.prototype.hasOwnProperty ( V )
export class $ObjectPrototype_hasOwnProperty extends $BuiltinFunction<'Object.prototype.hasOwnProperty'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.prototype.hasOwnProperty', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let P be ? ToPropertyKey(V).
    // 2. Let O be ? ToObject(this value).
    // 3. Return ? HasOwnProperty(O, P).

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.isprototypeof
// 19.1.3.3 Object.prototype.isPrototypeOf ( V )
export class $ObjectPrototype_isPrototypeOf extends $BuiltinFunction<'Object.prototype.isPrototypeOf'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.prototype.isPrototypeOf', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If Type(V) is not Object, return false.
    // 2. Let O be ? ToObject(this value).
    // 3. Repeat,
      // 3. a. Set V to ? V.[[GetPrototypeOf]]().
      // 3. b. If V is null, return false.
      // 3. c. If SameValue(O, V) is true, return true.

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.propertyisenumerable
// 19.1.3.4 Object.prototype.propertyIsEnumerable ( V )
export class $ObjectPrototype_propertyIsEnumerable extends $BuiltinFunction<'Object.prototype.propertyIsEnumerable'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.prototype.propertyIsEnumerable', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let P be ? ToPropertyKey(V).
    // 2. Let O be ? ToObject(this value).
    // 3. Let desc be ? O.[[GetOwnProperty]](P).
    // 4. If desc is undefined, return false.
    // 5. Return desc.[[Enumerable]].

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.tolocalestring
// 19.1.3.5 Object.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
export class $ObjectPrototype_toLocaleString extends $BuiltinFunction<'Object.prototype.toLocaleString'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.prototype.toLocaleString', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let O be the this value.
    // 2. Return ? Invoke(O, "toString").

    throw new Error('Method not implemented.');
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.tostring
// 19.1.3.6 Object.prototype.toString ( )
export class $ObjProto_toString extends $BuiltinFunction<'Object.prototype.toString'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Object.prototype.toString', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If the this value is undefined, return "[object Undefined]".
    if (thisArgument.isUndefined) {
      return new $String(realm, '[object Undefined]');
    }

    // 2. If the this value is null, return "[object Null]".
    if (thisArgument.isNull) {
      return new $String(realm, '[object Null]');
    }

    // 3. Let O be ! ToObject(this value).
    const O = thisArgument.ToObject(ctx);

    const tag = O['[[Get]]'](ctx, intrinsics['@@toStringTag'], O);
    if (tag.isAbrupt) { return tag; }

    if (tag.isString) {
      return new $String(realm, `[object ${tag['[[Value]]']}]`);
    }

    // 4. Let isArray be ? IsArray(O).
    // 5. If isArray is true, let builtinTag be "Array".
    if (O.isArray) {
      // TODO: implement IsArray semantics for proxy with null handler (which throws type error)
      return new $String(realm, `[object Array]`);
    }

    // 6. Else if O is a String exotic object, let builtinTag be "String".
    if (O instanceof $StringExoticObject) {
      return new $String(realm, `[object String]`);
    }

    // 7. Else if O has a [[ParameterMap]] internal slot, let builtinTag be "Arguments".
    if ('[[ParameterMap]]' in O) {
      return new $String(realm, `[object Arguments]`);
    }

    // 8. Else if O has a [[Call]] internal method, let builtinTag be "Function".
    if ('[[Call]]' in O) {
      return new $String(realm, `[object Function]`);
    }

    // 9. Else if O has an [[ErrorData]] internal slot, let builtinTag be "Error".
    if ('[[ErrorData]]' in O) {
      return new $String(realm, `[object Error]`);
    }

    // 10. Else if O has a [[BooleanData]] internal slot, let builtinTag be "Boolean".
    if ('[[BooleanData]]' in O) {
      return new $String(realm, `[object Boolean]`);
    }

    // 11. Else if O has a [[NumberData]] internal slot, let builtinTag be "Number".
    if ('[[NumberData]]' in O) {
      return new $String(realm, `[object Number]`);
    }

    // 12. Else if O has a [[DateValue]] internal slot, let builtinTag be "Date".
    if ('[[DateValue]]' in O) {
      return new $String(realm, `[object Date]`);
    }

    // 13. Else if O has a [[RegExpMatcher]] internal slot, let builtinTag be "RegExp".
    if ('[[RegExpMatcher]]' in O) {
      return new $String(realm, `[object RegExp]`);
    }

    // 14. Else, let builtinTag be "Object".
    return new $String(realm, `[object Object]`);

    // 15. Let tag be ? Get(O, @@toStringTag).
    // 16. If Type(tag) is not String, set tag to builtinTag.
    // 17. Return the string-concatenation of "[object ", tag, and "]".
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.valueof
// 19.1.3.7 Object.prototype.valueOf ( )
export class $ObjProto_valueOf extends $BuiltinFunction<'%ObjProto_valueOf%'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, '%ObjProto_valueOf%', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Return ? ToObject(this value).

    throw new Error('Method not implemented.');
  }
}

// #endregion
