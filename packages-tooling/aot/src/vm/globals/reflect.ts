import {
  $BuiltinFunction,
  $Function,
} from '../types/function';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
  CompletionType,
  $AnyObject,
} from '../types/_shared';
import {
  $TypeError,
} from '../types/error';
import {
  $Undefined,
} from '../types/undefined';
import {
  $FunctionPrototype,
} from './function';
import {
  $Object,
} from '../types/object';
import {
  $List
} from '../types/list';
import {
  $ToPropertyDescriptor,
  $CreateListFromArrayLike,
  $Call,
  $Construct,
  $FromPropertyDescriptor,
} from '../operations';
import {
  $ObjectPrototype,
} from './object';
import {
  $CreateArrayFromList,
} from '../exotics/array';

// http://www.ecma-international.org/ecma-262/#sec-reflection
// 26 Reflection

// http://www.ecma-international.org/ecma-262/#sec-reflect-object
// 26.1 The Reflect Object
export class $Reflect extends $Object<'%Reflect%'> {
  // http://www.ecma-international.org/ecma-262/#sec-reflect.apply
  // 26.1.1 Reflect.apply ( target , thisArgument , argumentsList )
  public get $apply(): $Reflect_apply {
    return this.getProperty(this.realm['[[Intrinsics]]'].$apply)['[[Value]]'] as $Reflect_apply;
  }
  public set $apply(value: $Reflect_apply) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$apply, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.construct
  // 26.1.2 Reflect.construct ( target , argumentsList [ , newTarget ] )
  public get $construct(): $Reflect_construct {
    return this.getProperty(this.realm['[[Intrinsics]]'].$construct)['[[Value]]'] as $Reflect_construct;
  }
  public set $construct(value: $Reflect_construct) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$construct, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.defineproperty
  // 26.1.3 Reflect.defineProperty ( target , propertyKey , attributes )
  public get $defineProperty(): $Reflect_defineProperty {
    return this.getProperty(this.realm['[[Intrinsics]]'].$defineProperty)['[[Value]]'] as $Reflect_defineProperty;
  }
  public set $defineProperty(value: $Reflect_defineProperty) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$defineProperty, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.deleteproperty
  // 26.1.4 Reflect.deleteProperty ( target , propertyKey )
  public get $deleteProperty(): $Reflect_deleteProperty {
    return this.getProperty(this.realm['[[Intrinsics]]'].$deleteProperty)['[[Value]]'] as $Reflect_deleteProperty;
  }
  public set $deleteProperty(value: $Reflect_deleteProperty) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$deleteProperty, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.get
  // 26.1.5 Reflect.get ( target , propertyKey [ , receiver ] )
  public get $get(): $Reflect_get {
    return this.getProperty(this.realm['[[Intrinsics]]'].$get)['[[Value]]'] as $Reflect_get;
  }
  public set $get(value: $Reflect_get) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$get, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.getownpropertydescriptor
  // 26.1.6 Reflect.getOwnPropertyDescriptor ( target , propertyKey )
  public get $getOwnPropertyDescriptor(): $Reflect_getOwnPropertyDescriptor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor)['[[Value]]'] as $Reflect_getOwnPropertyDescriptor;
  }
  public set $getOwnPropertyDescriptor(value: $Reflect_getOwnPropertyDescriptor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getOwnPropertyDescriptor, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.getprototypeof
  // 26.1.7 Reflect.getPrototypeOf ( target )
  public get $getPrototypeOf(): $Reflect_getPrototypeOf {
    return this.getProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf)['[[Value]]'] as $Reflect_getPrototypeOf;
  }
  public set $getPrototypeOf(value: $Reflect_getPrototypeOf) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$getPrototypeOf, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.has
  // 26.1.8 Reflect.has ( target , propertyKey )
  public get $has(): $Reflect_has {
    return this.getProperty(this.realm['[[Intrinsics]]'].$has)['[[Value]]'] as $Reflect_has;
  }
  public set $has(value: $Reflect_has) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$has, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.isextensible
  // 26.1.9 Reflect.isExtensible ( target )
  public get $isExtensible(): $Reflect_isExtensible {
    return this.getProperty(this.realm['[[Intrinsics]]'].$isExtensible)['[[Value]]'] as $Reflect_isExtensible;
  }
  public set $isExtensible(value: $Reflect_isExtensible) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$isExtensible, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.ownkeys
  // 26.1.10 Reflect.ownKeys ( target )
  public get $ownKeys(): $Reflect_ownKeys {
    return this.getProperty(this.realm['[[Intrinsics]]'].$ownKeys)['[[Value]]'] as $Reflect_ownKeys;
  }
  public set $ownKeys(value: $Reflect_ownKeys) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$ownKeys, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.preventextensions
  // 26.1.11 Reflect.preventExtensions ( target )
  public get $preventExtensions(): $Reflect_preventExtensions {
    return this.getProperty(this.realm['[[Intrinsics]]'].$preventExtensions)['[[Value]]'] as $Reflect_preventExtensions;
  }
  public set $preventExtensions(value: $Reflect_preventExtensions) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$preventExtensions, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.set
  // 26.1.12 Reflect.set ( target , propertyKey , V [ , receiver ] )
  public get $set(): $Reflect_set {
    return this.getProperty(this.realm['[[Intrinsics]]'].$set)['[[Value]]'] as $Reflect_set;
  }
  public set $set(value: $Reflect_set) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$set, value);
  }

  // http://www.ecma-international.org/ecma-262/#sec-reflect.setprototypeof
  // 26.1.13 Reflect.setPrototypeOf ( target , proto )
  public get $setPrototypeOf(): $Reflect_setPrototypeOf {
    return this.getProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf)['[[Value]]'] as $Reflect_setPrototypeOf;
  }
  public set $setPrototypeOf(value: $Reflect_setPrototypeOf) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$setPrototypeOf, value);
  }

  public constructor(
    realm: Realm,
    proto: $ObjectPrototype,
  ) {
    super(realm, '%Reflect%', proto, CompletionType.normal, realm['[[Intrinsics]]'].empty);
  }
}
// http://www.ecma-international.org/ecma-262/#sec-reflect.apply
// 26.1.1 Reflect.apply ( target , thisArgument , argumentsList )
export class $Reflect_apply extends $BuiltinFunction<'Reflect.apply'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.apply', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, thisArgument, argumentsList]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (thisArgument === void 0) {
      thisArgument = intrinsics.undefined;
    }
    if (argumentsList === void 0) {
      argumentsList = intrinsics.undefined;
    }

    // 1. If IsCallable(target) is false, throw a TypeError exception.
    if (!target.isFunction) {
      return new $TypeError(realm, `Expected target to be a function, but got: ${target}`);
    }

    // 2. Let args be ? CreateListFromArrayLike(argumentsList).
    const args = $CreateListFromArrayLike(ctx, argumentsList);
    if (args.isAbrupt) { return args; }

    // 3. Perform PrepareForTailCall().
    ctx.suspend();
    realm.stack.pop();

    // 4. Return ? Call(target, thisArgument, args).
    return $Call(ctx, target, thisArgument as $AnyNonEmptyNonError, args); // TODO: is this cast safe?
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.construct
// 26.1.2 Reflect.construct ( target , argumentsList [ , newTarget ] )
export class $Reflect_construct extends $BuiltinFunction<'Reflect.construct'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.construct', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, argumentsList, newTarget]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (argumentsList === void 0) {
      argumentsList = intrinsics.undefined;
    }

    // 1. If IsConstructor(target) is false, throw a TypeError exception.
    if (!target.isFunction) {
      return new $TypeError(realm, `Expected target to be a constructor function, but got: ${target}`);
    }

    // 2. If newTarget is not present, set newTarget to target.
    if (newTarget === void 0) {
      newTarget = target;
    }
    // 3. Else if IsConstructor(newTarget) is false, throw a TypeError exception.
    else if (!newTarget.isFunction) {
      return new $TypeError(realm, `Expected newTarget to be a constructor function, but got: ${newTarget}`);
    }

    // 4. Let args be ? CreateListFromArrayLike(argumentsList).
    const args = $CreateListFromArrayLike(ctx, argumentsList);
    if (args.isAbrupt) { return args; }

    // 5. Return ? Construct(target, args, newTarget).
    return $Construct(ctx, target as $Function, args, newTarget as $Function | $Undefined);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.defineproperty
// 26.1.3 Reflect.defineProperty ( target , propertyKey , attributes )
export class $Reflect_defineProperty extends $BuiltinFunction<'Reflect.defineProperty'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.defineProperty', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, propertyKey, attributes]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (propertyKey === void 0) {
      propertyKey = intrinsics.undefined;
    }
    if (attributes === void 0) {
      attributes = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let key be ? ToPropertyKey(propertyKey).
    const key = propertyKey.ToPropertyKey(ctx);
    if (key.isAbrupt) { return key; }

    // 3. Let desc be ? ToPropertyDescriptor(attributes).
    const desc = $ToPropertyDescriptor(ctx, attributes, key);
    if (desc.isAbrupt) { return desc; }

    // 4. Return ? target.[[DefineOwnProperty]](key, desc).
    return target['[[DefineOwnProperty]]'](ctx, key, desc);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.deleteproperty
// 26.1.4 Reflect.deleteProperty ( target , propertyKey )
export class $Reflect_deleteProperty extends $BuiltinFunction<'Reflect.deleteProperty'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.deleteProperty', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, propertyKey]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (propertyKey === void 0) {
      propertyKey = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let key be ? ToPropertyKey(propertyKey).
    const key = propertyKey.ToPropertyKey(ctx);
    if (key.isAbrupt) { return key; }

    // 3. Return ? target.[[Delete]](key).
    return target['[[Delete]]'](ctx, key);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.get
// 26.1.5 Reflect.get ( target , propertyKey [ , receiver ] )
export class $Reflect_get extends $BuiltinFunction<'Reflect.get'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.get', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, propertyKey, receiver]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (propertyKey === void 0) {
      propertyKey = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let key be ? ToPropertyKey(propertyKey).
    const key = propertyKey.ToPropertyKey(ctx);
    if (key.isAbrupt) { return key; }

    // 3. If receiver is not present, then
    if (receiver === void 0) {
      // 3. a. Set receiver to target.
      receiver = target;
    }

    // 4. Return ? target.[[Get]](key, receiver).
    return target['[[Get]]'](ctx, key, receiver as $AnyObject); // TODO: is this cast safe?
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.getownpropertydescriptor
// 26.1.6 Reflect.getOwnPropertyDescriptor ( target , propertyKey )
export class $Reflect_getOwnPropertyDescriptor extends $BuiltinFunction<'Reflect.getOwnPropertyDescriptor'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.getOwnPropertyDescriptor', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, propertyKey]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (propertyKey === void 0) {
      propertyKey = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let key be ? ToPropertyKey(propertyKey).
    const key = propertyKey.ToPropertyKey(ctx);
    if (key.isAbrupt) { return key; }

    // 3. Let desc be ? target.[[GetOwnProperty]](key).
    const desc = target['[[GetOwnProperty]]'](ctx, key);
    if (desc.isAbrupt) { return desc; }

    // 4. Return FromPropertyDescriptor(desc).
    return $FromPropertyDescriptor(ctx, desc);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.getprototypeof
// 26.1.7 Reflect.getPrototypeOf ( target )
export class $Reflect_getPrototypeOf extends $BuiltinFunction<'Reflect.getPrototypeOf'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.getPrototypeOf', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Return ? target.[[GetPrototypeOf]]().
    return target['[[GetPrototypeOf]]'](ctx);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.has
// 26.1.8 Reflect.has ( target , propertyKey )
export class $Reflect_has extends $BuiltinFunction<'Reflect.has'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.has', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target , propertyKey]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (propertyKey === void 0) {
      propertyKey = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let key be ? ToPropertyKey(propertyKey).
    const key = propertyKey.ToPropertyKey(ctx);
    if (key.isAbrupt) { return key; }

    // 3. Return ? target.[[HasProperty]](key).
    return target['[[HasProperty]]'](ctx, key);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.isextensible
// 26.1.9 Reflect.isExtensible ( target )
export class $Reflect_isExtensible extends $BuiltinFunction<'Reflect.isExtensible'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.isExtensible', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Return ? target.[[IsExtensible]]().
    return target['[[IsExtensible]]'](ctx);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.ownkeys
// 26.1.10 Reflect.ownKeys ( target )
export class $Reflect_ownKeys extends $BuiltinFunction<'Reflect.ownKeys'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.ownKeys', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let keys be ? target.[[OwnPropertyKeys]]().
    const keys = target['[[OwnPropertyKeys]]'](ctx);
    if (keys.isAbrupt) { return keys; }

    // 3. Return CreateArrayFromList(keys).
    return $CreateArrayFromList(ctx, keys);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.preventextensions
// 26.1.11 Reflect.preventExtensions ( target )
export class $Reflect_preventExtensions extends $BuiltinFunction<'Reflect.preventExtensions'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.preventExtensions', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Return ? target.[[PreventExtensions]]().
    return target['[[PreventExtensions]]'](ctx);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.set
// 26.1.12 Reflect.set ( target , propertyKey , V [ , receiver ] )
export class $Reflect_set extends $BuiltinFunction<'Reflect.set'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.set', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, propertyKey, V, receiver]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (propertyKey === void 0) {
      propertyKey = intrinsics.undefined;
    }
    if (V === void 0) {
      V = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. Let key be ? ToPropertyKey(propertyKey).
    const key = propertyKey.ToPropertyKey(ctx);
    if (key.isAbrupt) { return key; }

    // 3. If receiver is not present, then
    if (receiver === void 0) {
      // 3. a. Set receiver to target.
      receiver = target;
    }

    // 4. Return ? target.[[Set]](key, V, receiver).
    return target['[[Set]]'](ctx, key, V, receiver as $AnyObject); // TODO: is this cast safe?
  }
}

// http://www.ecma-international.org/ecma-262/#sec-reflect.setprototypeof
// 26.1.13 Reflect.setPrototypeOf ( target , proto )
export class $Reflect_setPrototypeOf extends $BuiltinFunction<'Reflect.setPrototypeOf'> {
  public constructor(
    realm: Realm,
    proto: $FunctionPrototype,
  ) {
    super(realm, 'Reflect.setPrototypeOf', proto);
  }

  public performSteps(
    ctx: ExecutionContext,
    $thisArgument: $AnyNonEmptyNonError,
    [target, proto]: $List<$AnyNonEmpty>,
    $NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    if (target === void 0) {
      target = intrinsics.undefined;
    }
    if (proto === void 0) {
      proto = intrinsics.undefined;
    }

    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!target.isObject) {
      return new $TypeError(realm, `Expected target to be an object, but got: ${target}`);
    }

    // 2. If Type(proto) is not Object and proto is not null, throw a TypeError exception.
    if (!proto.isObject && !proto.isNull) {
      return new $TypeError(realm, `Expected proto to be an object or null, but got: ${proto}`);
    }

    // 3. Return ? target.[[SetPrototypeOf]](proto).
    return target['[[SetPrototypeOf]]'](ctx, proto as $AnyObject);
  }
}

