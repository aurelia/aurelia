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
  $Number,
} from '../types/number';
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

// http://www.ecma-international.org/ecma-262/#sec-number-constructor
export class $NumberConstructor extends $BuiltinFunction<'%Number%'> {
  public get $prototype(): $NumberPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $NumberPrototype;
  }
  public set $prototype(value: $NumberPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Number%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-number-constructor-number-value
  // 20.1.1.1 Number ( value )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [value]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    let n: $Number;

    // 1. If no arguments were passed to this function invocation, let n be +0.
    if (value === void 0) {
      n = intrinsics['0'];
    }
    // 2. Else, let n be ? ToNumber(value).
    else {
      const $n = value.ToNumber(ctx);
      if ($n.isAbrupt) { return $n; }
      n = $n;
    }

    // 3. If NewTarget is undefined, return n.
    if (NewTarget.isUndefined) {
      return n;
    }

    // 4. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%NumberPrototype%", « [[NumberData]] »).
    // 5. Set O.[[NumberData]] to n.
    // 6. Return O.
    return $OrdinaryCreateFromConstructor(ctx, NewTarget, '%NumberPrototype%', { '[[NumberData]]': n });
  }
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-number-prototype-object
export class $NumberPrototype extends $Object<'%NumberPrototype%'> {
  public get $constructor(): $NumberConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $NumberConstructor;
  }
  public set $constructor(value: $NumberConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  public '[[NumberData]]': $Number;

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%NumberPrototype%', objectPrototype, CompletionType.normal, intrinsics.empty);

    this['[[NumberData]]'] = new $Number(realm, 0);
  }
}
