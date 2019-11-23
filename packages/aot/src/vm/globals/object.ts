import {
  $BuiltinFunction,
  $Function,
  $OrdinaryCreateFromConstructor,
} from '../types/function';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $Error,
} from '../types/error';
import {
  $Undefined,
} from '../types/undefined';
import {
  $Object,
} from '../types/object';
import {
  $String,
} from '../types/string';
import {
  $StringExoticObject,
} from '../exotics/string';
import {
  $FunctionPrototype,
} from './function';


// http://www.ecma-international.org/ecma-262/#sec-object-constructor
export class $ObjectConstructor extends $BuiltinFunction<'%Object%'> {
  public readonly $prototype: $ObjectPrototype;

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
    functionPrototype: $FunctionPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];

    super(realm, '%Object%', functionPrototype);

    this.setDataProperty(intrinsics.$prototype, this.$prototype = objectPrototype, false, false, false);
    objectPrototype.setDataProperty(intrinsics.$constructor, objectPrototype.$constructor = this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-value
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [value]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
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

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-object-prototype-object
export class $ObjectPrototype extends $Object<'%ObjectPrototype%'> {
  public $constructor!: $ObjectConstructor;

  public constructor(
    realm: Realm,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%ObjectPrototype%', intrinsics.null);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-object.prototype.tostring
export class $ObjProto_toString extends $BuiltinFunction<'Object.prototype.toString'> {
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
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
