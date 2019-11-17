import { $Object } from '../types/object';
import { Realm, ExecutionContext } from '../realm';
import { $Function } from '../types/function';
import { $ParameterDeclaration, getBoundNames } from '../ast';
import { $Any, $PropertyKey, $AnyNonEmpty } from '../types/_shared';
import { $EnvRec } from '../types/environment-record';
import { $CreateDataProperty, $DefinePropertyOrThrow, $HasOwnProperty, $Get, $Set, $CreateBuiltinFunction } from '../operations';
import { $String } from '../types/string';
import { $PropertyDescriptor, $IsDataDescriptor } from '../types/property-descriptor';
import { $Number } from '../types/number';
import { $Undefined } from '../types/undefined';
import { $Boolean } from '../types/boolean';


// http://www.ecma-international.org/ecma-262/#sec-arguments-exotic-objects
export class $ArgumentsExoticObject extends $Object<'ArgumentsExoticObject'> {
  public readonly '[[ParameterMap]]': $Object;

  // http://www.ecma-international.org/ecma-262/#sec-createmappedargumentsobject
  public constructor(
    realm: Realm,
    func: $Function,
    formals: readonly $ParameterDeclaration[],
    argumentsList: readonly $AnyNonEmpty[],
    env: $EnvRec,
  ) {
    const intrinsics = realm['[[Intrinsics]]'];
    super(realm, 'ArgumentsExoticObject', intrinsics['%ObjectPrototype%']);

    const ctx = realm.stack.top;

    // 1. Assert: formals does not contain a rest parameter, any binding patterns, or any initializers. It may contain duplicate identifiers.
    // 2. Let len be the number of elements in argumentsList.
    const len = argumentsList.length;

    // 3. Let obj be a newly created arguments exotic object with a [[ParameterMap]] internal slot.
    // 4. Set obj.[[GetOwnProperty]] as specified in 9.4.4.1.
    // 5. Set obj.[[DefineOwnProperty]] as specified in 9.4.4.2.
    // 6. Set obj.[[Get]] as specified in 9.4.4.3.
    // 7. Set obj.[[Set]] as specified in 9.4.4.4.
    // 8. Set obj.[[Delete]] as specified in 9.4.4.5.
    // 9. Set the remainder of obj's essential internal methods to the default ordinary object definitions specified in 9.1.
    // 10. Set obj.[[Prototype]] to %ObjectPrototype%.
    // 11. Set obj.[[Extensible]] to true.
    // 12. Let map be ObjectCreate(null).
    const map = new $Object(realm, '[[ParameterMap]]', intrinsics.null);

    // 13. Set obj.[[ParameterMap]] to map.
    this['[[ParameterMap]]'] = map;

    // 14. Let parameterNames be the BoundNames of formals.
    const parameterNames = formals.flatMap(getBoundNames);

    // 15. Let numberOfParameters be the number of elements in parameterNames.
    const numberOfParameters = parameterNames.length;

    // 16. Let index be 0.
    let index = 0;

    // 17. Repeat, while index < len,
    while (index < len) {
      // 17. a. Let val be argumentsList[index].
      const val = argumentsList[index];

      // 17. b. Perform CreateDataProperty(obj, ! ToString(index), val).
      $CreateDataProperty(ctx, this, new $String(realm, index.toString()), val);

      // 17. c. Increase index by 1.
      ++index;
    }

    // 18. Perform DefinePropertyOrThrow(obj, "length", PropertyDescriptor { [[Value]]: len, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }).
    const desc = new $PropertyDescriptor(realm, intrinsics.length);
    desc['[[Value]]'] = new $Number(realm, len);

    // 19. Let mappedNames be a new empty List.
    const mappedNames = [] as $String[];

    // 20. Let index be numberOfParameters - 1.
    index = numberOfParameters - 1;

    // 21. Repeat, while index ≥ 0,
    while (index >= 0) {
      // 21. a. Let name be parameterNames[index].
      const name = parameterNames[index];

      // 21. b. If name is not an element of mappedNames, then
      if (!mappedNames.some(x => x.is(name))) {
        // 21. b. i. Add name as an element of the list mappedNames.
        mappedNames.push(name);

        // 21. b. ii. If index < len, then
        if (index < len) {
          // 21. b. ii. 1. Let g be MakeArgGetter(name, env).
          const g = MakeArgGetter(ctx, name, env);

          // 21. b. ii. 2. Let p be MakeArgSetter(name, env).
          const p = MakeArgSetter(ctx, name, env);

          // 21. b. ii. 3. Perform map.[[DefineOwnProperty]](! ToString(index), PropertyDescriptor { [[Set]]: p, [[Get]]: g, [[Enumerable]]: false, [[Configurable]]: true }).
          const desc = new $PropertyDescriptor(
            realm,
            new $String(realm, index.toString()),
            {
              '[[Set]]': p,
              '[[Get]]': g,
              '[[Enumerable]]': intrinsics.false,
              '[[Configurable]]': intrinsics.true,
            },
          );
          map['[[DefineOwnProperty]]'](ctx, desc.name, desc);
        }
      }

      // 21. c. Decrease index by 1.
      --index;
    }

    // 22. Perform ! DefinePropertyOrThrow(obj, @@iterator, PropertyDescriptor { [[Value]]: %ArrayProto_values%, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }).
    const iteratorDesc = new $PropertyDescriptor(
      realm,
      intrinsics['@@iterator'],
      {
        '[[Value]]': intrinsics['%ArrayProto_values%'],
        '[[Writable]]': intrinsics.true,
        '[[Enumerable]]': intrinsics.false,
        '[[Configurable]]': intrinsics.true,
      },
    );
    $DefinePropertyOrThrow(ctx, this, iteratorDesc.name, iteratorDesc);

    // 23. Perform ! DefinePropertyOrThrow(obj, "callee", PropertyDescriptor { [[Value]]: func, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }).
    const calleeDesc = new $PropertyDescriptor(
      realm,
      intrinsics.$callee,
      {
        '[[Value]]': func,
        '[[Writable]]': intrinsics.true,
        '[[Enumerable]]': intrinsics.false,
        '[[Configurable]]': intrinsics.true,
      },
    );
    $DefinePropertyOrThrow(ctx, this, calleeDesc.name, calleeDesc);

    // 24. Return obj.
  }

  // http://www.ecma-international.org/ecma-262/#sec-arguments-exotic-objects-getownproperty-p
  public '[[GetOwnProperty]]'(
    ctx: ExecutionContext,
    P: $PropertyKey,
  ): $PropertyDescriptor | $Undefined {
    // 1. Let args be the arguments object.
    // 2. Let desc be OrdinaryGetOwnProperty(args, P).
    const desc = super['[[GetOwnProperty]]'](ctx, P);

    // 3. If desc is undefined, return desc.
    if (desc.isUndefined) {
      return desc;
    }

    // 4. Let map be args.[[ParameterMap]].
    const map = this['[[ParameterMap]]'];

    // 5. Let isMapped be ! HasOwnProperty(map, P).
    const isMapped = $HasOwnProperty(ctx, map, P).isTruthy;

    // 6. If isMapped is true, then
    if (isMapped) {
      // 6. a. Set desc.[[Value]] to Get(map, P).
      desc['[[Value]]'] = $Get(ctx, map, P);
    }

    // 7. Return desc.
    return desc;
  }

  // http://www.ecma-international.org/ecma-262/#sec-arguments-exotic-objects-defineownproperty-p-desc
  public '[[DefineOwnProperty]]'(
    ctx: ExecutionContext,
    P: $PropertyKey,
    Desc: $PropertyDescriptor,
  ): $Boolean {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let args be the arguments object.
    // 2. Let map be args.[[ParameterMap]].
    const map = this['[[ParameterMap]]'];

    // 3. Let isMapped be HasOwnProperty(map, P).
    const isMapped = $HasOwnProperty(ctx, map, P).isTruthy;

    // 4. Let newArgDesc be Desc.
    let newArgDesc = Desc;

    // 5. If isMapped is true and IsDataDescriptor(Desc) is true, then
    if (isMapped && $IsDataDescriptor(Desc)) {
      // 5. a. If Desc.[[Value]] is not present and Desc.[[Writable]] is present and its value is false, then
      if (Desc['[[Value]]'].isEmpty && Desc['[[Writable]]'].hasValue && Desc['[[Writable]]'].isFalsey) {
        // 5. a. i. Set newArgDesc to a copy of Desc.
        newArgDesc = new $PropertyDescriptor(
          Desc.realm,
          Desc.name,
          {
            // 5. a. ii. Set newArgDesc.[[Value]] to Get(map, P).
            '[[Value]]': $Get(ctx, map, P),
            '[[Writable]]': Desc['[[Writable]]'],
            '[[Enumerable]]': Desc['[[Enumerable]]'],
            '[[Configurable]]': Desc['[[Configurable]]'],
          },
        );
      }
    }

    // 6. Let allowed be ? OrdinaryDefineOwnProperty(args, P, newArgDesc).
    const allowed = super['[[DefineOwnProperty]]'](ctx, P, newArgDesc);

    // 7. If allowed is false, return false.
    if (allowed.isFalsey) {
      return allowed;
    }

    // 8. If isMapped is true, then
    if (isMapped) {
      // 8. a. If IsAccessorDescriptor(Desc) is true, then
      if (Desc.isAccessorDescriptor) {
        // 8. a. i. Call map.[[Delete]](P).
        map['[[Delete]]'](ctx, P);
      }
    }
    // 8. b. Else,
    else {
      // 8. b. i. If Desc.[[Value]] is present, then
      if (Desc['[[Value]]'].hasValue) {
        // 8. b. i. 1. Let setStatus be Set(map, P, Desc.[[Value]], false).
        const setStatus = $Set(ctx, map, P, Desc['[[Value]]'], intrinsics.false);

        // 8. b. i. 2. Assert: setStatus is true because formal parameters mapped by argument objects are always writable.
        // 8. b. ii. If Desc.[[Writable]] is present and its value is false, then
        if (Desc['[[Writable]]'].hasValue && Desc['[[Writable]]'].isFalsey) {
          // 8. b. ii. 1. Call map.[[Delete]](P).
          map['[[Delete]]'](ctx, P);
        }
      }
    }

    // 9. Return true.
    return intrinsics.true;
  }

  // http://www.ecma-international.org/ecma-262/#sec-arguments-exotic-objects-get-p-receiver
  public '[[Get]]'(
    ctx: ExecutionContext,
    P: $PropertyKey,
    Receiver: $Object,
  ): $AnyNonEmpty {
    // 1. Let args be the arguments object.
    // 2. Let map be args.[[ParameterMap]].
    const map = this['[[ParameterMap]]'];

    // 3. Let isMapped be ! HasOwnProperty(map, P).
    const isMapped = $HasOwnProperty(ctx, map, P).isTruthy;

    // 4. If isMapped is false, then
    if (!isMapped) {
      // 4. a. Return ? OrdinaryGet(args, P, Receiver).
      return super['[[Get]]'](ctx, P, Receiver);
    }
    // 5. Else map contains a formal parameter mapping for P,
    else {
      // 5. a. Return Get(map, P).
      return $Get(ctx, map, P);
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-arguments-exotic-objects-set-p-v-receiver
  public '[[Set]]'(
    ctx: ExecutionContext,
    P: $PropertyKey,
    V: $AnyNonEmpty,
    Receiver: $Object,
  ): $Boolean {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // 1. Let args be the arguments object.
    // 2. If SameValue(args, Receiver) is false, then
    // 2. a. Let isMapped be false.
    // 3. Else,
    // 3. a. Let map be args.[[ParameterMap]].
    // 3. b. Let isMapped be ! HasOwnProperty(map, P).
    // 4. If isMapped is true, then
    // 4. a. Let setStatus be Set(map, P, V, false).
    // 4. b. Assert: setStatus is true because formal parameters mapped by argument objects are always writable.
    // 5. Return ? OrdinarySet(args, P, V, Receiver).
    if (this.is(Receiver)) {
      const map = this['[[ParameterMap]]'];

      const isMapped = $HasOwnProperty(ctx, map, P).isTruthy;
      if (isMapped) {
        const setStatus = $Set(ctx, map, P, V, intrinsics.false);
      }
    }

    return super['[[Set]]'](ctx, P, V, Receiver);
  }

  // http://www.ecma-international.org/ecma-262/#sec-arguments-exotic-objects-delete-p
  public '[[Delete]]'(
    ctx: ExecutionContext,
    P: $PropertyKey,
  ): $Boolean {
    // 1. Let args be the arguments object.
    // 2. Let map be args.[[ParameterMap]].
    const map = this['[[ParameterMap]]'];

    // 3. Let isMapped be ! HasOwnProperty(map, P).
    const isMapped = $HasOwnProperty(ctx, map, P).isTruthy;

    // 4. Let result be ? OrdinaryDelete(args, P).
    const result = super['[[Delete]]'](ctx, P);

    // 5. If result is true and isMapped is true, then
    if (result.isTruthy && isMapped) {
      // 5. a. Call map.[[Delete]](P).
      map['[[Delete]]'](ctx, P);
    }

    // 6. Return result.
    return result;
  }
}

// http://www.ecma-international.org/ecma-262/#sec-makearggetter
function MakeArgGetter(
  ctx: ExecutionContext,
  name: $String,
  env: $EnvRec,
): $Function {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 2. Let getter be CreateBuiltinFunction(steps, « [[Name]], [[Env]] »).
  const getter = $CreateBuiltinFunction(
    ctx,
    'ArgGetter',
    // 1. Let steps be the steps of an ArgGetter function as specified below.
    function steps(
      ctx2: ExecutionContext,
      thisArgument: $AnyNonEmpty,
      argumentsList: readonly $AnyNonEmpty[],
      NewTarget: $AnyNonEmpty,
    ): $Any {
      // 1. Let f be the active function object.
      const f = getter;

      // 2. Let name be f.[[Name]].
      const name = f['[[Name]]'];

      // 3. Let env be f.[[Env]].
      const env = f['[[Env]]'];

      // 4. Return env.GetBindingValue(name, false).
      return env.GetBindingValue(ctx2, name, intrinsics.false);
    },
    {
      // 3. Set getter.[[Name]] to name.
      '[[Name]]': name,
      // 4. Set getter.[[Env]] to env.
      '[[Env]]': env,
    },
  );

  // 5. Return getter.
  return getter;
}


// http://www.ecma-international.org/ecma-262/#sec-makeargsetter
function MakeArgSetter(
  ctx: ExecutionContext,
  name: $String,
  env: $EnvRec,
): $Function {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 2. Let getter be CreateBuiltinFunction(steps, « [[Name]], [[Env]] »).
  const setter = $CreateBuiltinFunction(
    ctx,
    'ArgGetter',
    // 1. Let steps be the steps of an ArgGetter function as specified below.
    function steps(
      ctx2: ExecutionContext,
      thisArgument: $AnyNonEmpty,
      [value]: readonly $AnyNonEmpty[],
      NewTarget: $AnyNonEmpty,
    ): $Any {
      // 1. Let f be the active function object.
      const f = setter;

      // 2. Let name be f.[[Name]].
      const name = f['[[Name]]'];

      // 3. Let env be f.[[Env]].
      const env = f['[[Env]]'];

      // 4. Return env.SetMutableBinding(name, value, false).
      return env.SetMutableBinding(ctx2, name, value, intrinsics.false);
    },
    {
      // 3. Set getter.[[Name]] to name.
      '[[Name]]': name,
      // 4. Set getter.[[Env]] to env.
      '[[Env]]': env,
    },
  );

  // 5. Return getter.
  return setter;
}

// http://www.ecma-international.org/ecma-262/#sec-createunmappedargumentsobject
export function $CreateUnmappedArgumentsObject(
  ctx: ExecutionContext,
  argumentsList: readonly $AnyNonEmpty[],
): $Object {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Let len be the number of elements in argumentsList.
  const len = argumentsList.length;

  // 2. Let obj be ObjectCreate(%ObjectPrototype%, « [[ParameterMap]] »).
  const obj = $Object.ObjectCreate(
    ctx,
    'UnmappedArgumentsObject',
    intrinsics['%ObjectPrototype%'],
    {
      '[[ParameterMap]]': intrinsics.undefined,
    },
  );

  // 3. Set obj.[[ParameterMap]] to undefined.
  // 4. Perform DefinePropertyOrThrow(obj, "length", PropertyDescriptor { [[Value]]: len, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }).
  $DefinePropertyOrThrow(
    ctx,
    obj,
    intrinsics.length,
    new $PropertyDescriptor(
      realm,
      intrinsics.length,
      {
        '[[Value]]': new $Number(realm, len),
        '[[Writable]]': intrinsics.true,
        '[[Enumerable]]': intrinsics.false,
        '[[Configurable]]': intrinsics.true,
      },
    ),
  );

  // 5. Let index be 0.
  let index = 0;

  // 6. Repeat, while index < len,
  while (index < len) {
    // 6. a. Let val be argumentsList[index].
    const val = argumentsList[index];

    // 6. b. Perform CreateDataProperty(obj, ! ToString(index), val).
    $CreateDataProperty(ctx, obj, new $String(realm, index.toString()), val);

    // 6. c. Increase index by 1.
    ++index;
  }

  // 7. Perform ! DefinePropertyOrThrow(obj, @@iterator, PropertyDescriptor { [[Value]]: %ArrayProto_values%, [[Writable]]: true, [[Enumerable]]: false, [[Configurable]]: true }).
  $DefinePropertyOrThrow(
    ctx,
    obj,
    intrinsics['@@iterator'],
    new $PropertyDescriptor(
      realm,
      intrinsics['@@iterator'],
      {
        '[[Value]]': intrinsics['%ArrayProto_values%'],
        '[[Writable]]': intrinsics.true,
        '[[Enumerable]]': intrinsics.false,
        '[[Configurable]]': intrinsics.true,
      },
    ),
  );

  // 8. Perform ! DefinePropertyOrThrow(obj, "callee", PropertyDescriptor { [[Get]]: %ThrowTypeError%, [[Set]]: %ThrowTypeError%, [[Enumerable]]: false, [[Configurable]]: false }).
  $DefinePropertyOrThrow(
    ctx,
    obj,
    intrinsics.$callee,
    new $PropertyDescriptor(
      realm,
      intrinsics.$callee,
      {
        '[[Get]]': intrinsics['%ThrowTypeError%'],
        '[[Set]]': intrinsics['%ThrowTypeError%'],
        '[[Enumerable]]': intrinsics.false,
        '[[Configurable]]': intrinsics.false,
      },
    ),
  );

  // 9. Return obj.
  return obj;
}
