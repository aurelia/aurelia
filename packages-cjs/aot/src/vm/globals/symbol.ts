import {
  $BuiltinFunction,
  $Function,
} from '../types/function.js';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  $AnyNonEmpty,
  CompletionType,
  $AnyNonEmptyNonError,
} from '../types/_shared.js';
import {
  $TypeError,
} from '../types/error.js';
import {
  $Symbol,
} from '../types/symbol.js';
import {
  $Undefined,
} from '../types/undefined.js';
import {
  $FunctionPrototype,
} from './function.js';
import {
  $Object,
} from '../types/object.js';
import {
  $ObjectPrototype,
} from './object.js';
import {
  $List
} from '../types/list.js';

// http://www.ecma-international.org/ecma-262/#sec-symbol-constructor
export class $SymbolConstructor extends $BuiltinFunction<'%Symbol%'> {
  public get $prototype(): $SymbolPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $SymbolPrototype;
  }
  public set $prototype(value: $SymbolPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Symbol%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-symbol-description
  // 19.4.1.1 Symbol ( [ description ] )
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    [description]: $List<$AnyNonEmpty>,
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If NewTarget is not undefined, throw a TypeError exception.
    if (!NewTarget.isUndefined) {
      return new $TypeError(realm, `Symbol is not a constructor`);
    }

    // 2. If description is undefined, let descString be undefined.
    if (description === void 0 || description.isUndefined) {
      // 4. Return a new unique Symbol value whose [[Description]] value is descString.
      return new $Symbol(realm, new $Undefined(realm));
    }
    // 3. Else, let descString be ? ToString(description).
    else {
      const descString = description.ToString(ctx);
      if (descString.isAbrupt) { return descString; }

      // 4. Return a new unique Symbol value whose [[Description]] value is descString.
      return new $Symbol(realm, descString);
    }
  }
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-symbol-prototype-object
export class $SymbolPrototype extends $Object<'%SymbolPrototype%'> {
  public get $constructor(): $SymbolConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $SymbolConstructor;
  }
  public set $constructor(value: $SymbolConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%SymbolPrototype%', objectPrototype, CompletionType.normal, intrinsics.empty);
  }
}
