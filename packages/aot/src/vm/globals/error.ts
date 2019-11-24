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
} from '../types/_shared';
import {
  $Error, $TypeError,
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
  $ObjectPrototype,
} from './object';
import {
  $PropertyDescriptor,
} from '../types/property-descriptor';
import {
  $DefinePropertyOrThrow,
} from '../operations';
import {
  $String,
} from '../types/string';

// http://www.ecma-international.org/ecma-262/#sec-error-constructor
export class $ErrorConstructor extends $BuiltinFunction<'%Error%'> {
  public get $prototype(): $ErrorPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $ErrorPrototype;
  }
  public set $prototype(value: $ErrorPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  public constructor(
    realm: Realm,
    functionPrototype: $FunctionPrototype,
  ) {
    super(realm, '%Error%', functionPrototype);
  }

  // http://www.ecma-international.org/ecma-262/#sec-error-message
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [message]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
    const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;

    // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%ErrorPrototype%", « [[ErrorData]] »).
    const O = $OrdinaryCreateFromConstructor(ctx, newTarget as $Function, '%ErrorPrototype%', { '[[ErrorData]]': void 0 })
    if (O.isAbrupt) { return O; }

    // 3. If message is not undefined, then
    if (message !== void 0) {
      // 3. a. Let msg be ? ToString(message).
      const msg = message.ToString(ctx);
      if (msg.isAbrupt) { return msg; }

      // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
      const msgDesc = new $PropertyDescriptor(
        realm,
        intrinsics.message,
        {
          '[[Value]]': msg,
          '[[Writable]]': intrinsics.true,
          '[[Enumerable]]': intrinsics.false,
          '[[Configurable]]': intrinsics.true,
        },
      );

      // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
      $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
    }

    // 4. Return O.
    return O;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-error-prototype-object
export class $ErrorPrototype extends $Object<'%ErrorPrototype%'> {
  public get $constructor(): $ErrorConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $ErrorConstructor;
  }
  public set $constructor(value: $ErrorConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  public get message(): $String {
    return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'] as $String;
  }
  public set message(value: $String) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
  }

  public get $name(): $String {
    return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'] as $String;
  }
  public set $name(value: $String) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
  }

  public get $toString(): $ErrorPrototype_toString {
    return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'] as $ErrorPrototype_toString;
  }
  public set $toString(value: $ErrorPrototype_toString) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
  }

  public constructor(
    realm: Realm,
    objectPrototype: $ObjectPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%ErrorPrototype%', objectPrototype, CompletionType.normal, intrinsics.empty);
  }
}

// http://www.ecma-international.org/ecma-262/#sec-error.prototype.tostring
export class $ErrorPrototype_toString extends $BuiltinFunction<'Error.prototype.toString'> {
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    argumentsList: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let O be the this value.
    const O = thisArgument;

    // 2. If Type(O) is not Object, throw a TypeError exception.
    if (!O.isObject) {
      return new $TypeError(realm);
    }

    // 3. Let name be ? Get(O, "name").
    let name = O['[[Get]]'](ctx, intrinsics.$name, O);
    if (name.isAbrupt) { return name; }

    // 4. If name is undefined, set name to "Error"; otherwise set name to ? ToString(name).
    if (name.isUndefined) {
      name = new $String(realm, 'Error');
    } else {
      name = name.ToString(ctx);
      if (name.isAbrupt) { return name; }
    }

    // 5. Let msg be ? Get(O, "message").
    let msg = O['[[Get]]'](ctx, intrinsics.message, O);
    if (msg.isAbrupt) { return msg; }

    // 6. If msg is undefined, set msg to the empty String; otherwise set msg to ? ToString(msg).
    if (msg.isUndefined) {
      msg = new $String(realm, '');
    } else {
      msg = msg.ToString(ctx);
      if (msg.isAbrupt) { return msg; }
    }

    // 7. If name is the empty String, return msg.
    if (name['[[Value]]'] === '') {
      return msg;
    }

    // 8. If msg is the empty String, return name.
    if (msg['[[Value]]'] === '') {
      return name;
    }

    // 9. Return the string-concatenation of name, the code unit 0x003A (COLON), the code unit 0x0020 (SPACE), and msg.
    return new $String(realm, `${name['[[Value]]']}: ${msg['[[Value]]']}`);
  }
}



// http://www.ecma-international.org/ecma-262/#sec-nativeerror-constructors
export class $EvalErrorConstructor extends $BuiltinFunction<'%EvalError%'> {
  public get $prototype(): $EvalErrorPrototype {
    return this.getProperty(this.realm['[[Intrinsics]]'].$prototype)['[[Value]]'] as $EvalErrorPrototype;
  }
  public set $prototype(value: $EvalErrorPrototype) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$prototype, value, false, false, false);
  }

  public constructor(
    realm: Realm,
    errorConstructor: $ErrorConstructor,
  ) {
    super(realm, '%EvalError%', errorConstructor);
  }

  // http://www.ecma-international.org/ecma-262/#sec-nativeerror
  public performSteps(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmpty,
    [message]: readonly $AnyNonEmpty[],
    NewTarget: $Function | $Undefined,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. If NewTarget is undefined, let newTarget be the active function object, else let newTarget be NewTarget.
    const newTarget = NewTarget.isUndefined ? ctx.Function : NewTarget;

    // 2. Let O be ? OrdinaryCreateFromConstructor(newTarget, "%EvalErrorPrototype%", « [[ErrorData]] »).
    const O = $OrdinaryCreateFromConstructor(ctx, newTarget as $Function, '%EvalErrorPrototype%', { '[[ErrorData]]': void 0 })
    if (O.isAbrupt) { return O; }

    // 3. If message is not undefined, then
    if (message !== void 0) {
      // 3. a. Let msg be ? ToString(message).
      const msg = message.ToString(ctx);
      if (msg.isAbrupt) { return msg; }

      // 3. b. Let msgDesc be the PropertyDescriptor { [[Value]]: msg, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }.
      const msgDesc = new $PropertyDescriptor(
        realm,
        intrinsics.message,
        {
          '[[Value]]': msg,
          '[[Writable]]': intrinsics.true,
          '[[Enumerable]]': intrinsics.false,
          '[[Configurable]]': intrinsics.true,
        },
      );

      // 3. c. Perform ! DefinePropertyOrThrow(O, "message", msgDesc).
      $DefinePropertyOrThrow(ctx, O, intrinsics.message, msgDesc);
    }

    // 4. Return O.
    return O;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-properties-of-the-nativeerror-prototype-objects
export class $EvalErrorPrototype extends $Object<'%EvalErrorPrototype%'> {
  public get $constructor(): $EvalErrorConstructor {
    return this.getProperty(this.realm['[[Intrinsics]]'].$constructor)['[[Value]]'] as $EvalErrorConstructor;
  }
  public set $constructor(value: $EvalErrorConstructor) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$constructor, value);
  }

  public get message(): $String {
    return this.getProperty(this.realm['[[Intrinsics]]'].message)['[[Value]]'] as $String;
  }
  public set message(value: $String) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].message, value);
  }

  public get $name(): $String {
    return this.getProperty(this.realm['[[Intrinsics]]'].$name)['[[Value]]'] as $String;
  }
  public set $name(value: $String) {
    this.setDataProperty(this.realm['[[Intrinsics]]'].$name, value);
  }

  public constructor(
    realm: Realm,
    errorPrototype: $ErrorPrototype,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, '%EvalErrorPrototype%', errorPrototype, CompletionType.normal, intrinsics.empty);
  }
}
