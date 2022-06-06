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
  CompletionType,
  $AnyNonEmptyNonError,
} from '../types/_shared';
import {
  $Boolean,
} from '../types/boolean';
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
  $ObjectPrototype,
} from './object';
import {
  $List
} from '../types/list';

// http://www.ecma-international.org/ecma-262/#sec-boolean-constructor
export class $BooleanConstructor extends $BuiltinFunction<'%Boolean%'> {
  public get $prototype(): $BooleanPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $BooleanPrototype;
  }
  public set $prototype(value: $BooleanPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Boolean%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-boolean-constructor-boolean-value
  // 19.3.1.1 Boolean ( value )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let b be ToBoolean(value).
    const b = value?.ToBoolean(ctx) ?? intrinsics.undefined;
    if (b.isAbrupt) { return b; }

    // 2. If NewTarget is undefined, return b.
    if (NewTarget.isUndefined) {
      return b;
    }

    // 3. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%BooleanPrototype%", « [[BooleanData]] »).
    // 4. Set O.[[BooleanData]] to b.
    // 5. Return O.
    return $OrdinaryCreateFromConstructor(ctx, NewTarget, '%BooleanPrototype%', { '[[BooleanData]]': b });
  }
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-boolean-prototype-object
export class $BooleanPrototype extends $Object<'%BooleanPrototype%'> {
  public get $constructor(): $BooleanConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $BooleanConstructor;
  }
  public set $constructor(value: $BooleanConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  public '[[BooleanData]]': $Boolean;

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%BooleanPrototype%', objectPrototype, CompletionType.normal, intrinsics.empty);

    this['[[BooleanData]]'] = new $Boolean(realm, false);
  }
}
