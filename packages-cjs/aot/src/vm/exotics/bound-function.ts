import {
  $Object,
} from '../types/object.js';
import {
  $Function,
} from '../types/function.js';
import {
  $AnyNonEmpty,
  $AnyNonEmptyNonError,
  CompletionType,
} from '../types/_shared.js';
import {
  Realm,
  ExecutionContext,
} from '../realm.js';
import {
  $Call,
  $Construct,
} from '../operations.js';
import {
  $Undefined,
} from '../types/undefined.js';
import {
  $List,
} from '../types/list.js';

// http://www.ecma-international.org/ecma-262/#sec-bound-function-exotic-objects
export class $BoundFunctionExoticObject extends $Object<'BoundFunctionExoticObject'> {
  public '[[BoundTargetFunction]]': $Function;
  public '[[BoundThis]]': $AnyNonEmptyNonError;
  public '[[BoundArguments]]': $AnyNonEmpty[];

  public get isBoundFunction(): true { return true; }

  // http://www.ecma-international.org/ecma-262/#sec-boundfunctioncreate
  // 9.4.1.3 BoundFunctionCreate ( targetFunction , boundThis , boundArgs )
  public constructor(
    realm: Realm,
    targetFunction: $Function,
    boundThis: $AnyNonEmptyNonError,
    boundArgs: $AnyNonEmpty[],
  ) {
    // 1. Assert: Type(targetFunction) is Object.
    // 2. Let proto be ? targetFunction.[[GetPrototypeOf]]().
    const proto = targetFunction['[[GetPrototypeOf]]'](realm.stack.top);
    if (proto.isAbrupt) { return proto as any; } // TODO: put this in static method so we can return error completion

    // 3. Let obj be a newly created object.
    // 4. Set obj's essential internal methods to the default ordinary object definitions specified in 9.1.
    // 5. Set obj.[[Call]] as described in 9.4.1.1.
    // 6. If IsConstructor(targetFunction) is true, then
    // 6. a. Set obj.[[Construct]] as described in 9.4.1.2.
    // 7. Set obj.[[Prototype]] to proto.
    super(realm, 'BoundFunctionExoticObject', proto, CompletionType.normal, realm['[[Intrinsics]]'].empty);

    // 8. Set obj.[[Extensible]] to true.
    // 9. Set obj.[[BoundTargetFunction]] to targetFunction.
    this['[[BoundTargetFunction]]'] = targetFunction;

    // 10. Set obj.[[BoundThis]] to boundThis.
    this['[[BoundThis]]'] = boundThis;

    // 11. Set obj.[[BoundArguments]] to boundArgs.
    this['[[BoundArguments]]'] = boundArgs;

    // 12. Return obj.
  }

  // http://www.ecma-international.org/ecma-262/#sec-bound-function-exotic-objects-call-thisargument-argumentslist
  // 9.4.1.1 [[Call]] ( thisArgument , argumentsList )
  public '[[Call]]'(
    ctx: ExecutionContext,
    thisArgument: $AnyNonEmptyNonError,
    argumentsList: $List<$AnyNonEmpty>,
  ): $AnyNonEmpty  {
    const F = this;

    // 1. Let target be F.[[BoundTargetFunction]].
    const target = F['[[BoundTargetFunction]]'];

    // 2. Let boundThis be F.[[BoundThis]].
    const boundThis = F['[[BoundThis]]'];

    // 3. Let boundArgs be F.[[BoundArguments]].
    const boundArgs = F['[[BoundArguments]]'];

    // 4. Let args be a new list containing the same values as the list boundArgs in the same order followed by the same values as the list argumentsList in the same order.
    const args = new $List(
      ...boundArgs,
      ...argumentsList,
    );

    // 5. Return ? Call(target, boundThis, args).
    return $Call(ctx, target, boundThis, args);
  }

  // http://www.ecma-international.org/ecma-262/#sec-bound-function-exotic-objects-construct-argumentslist-newtarget
  // 9.4.1.2 [[Construct]] ( argumentsList , newTarget )
  public '[[Construct]]'(
    ctx: ExecutionContext,
    argumentsList: $List<$AnyNonEmpty>,
    newTarget: $Function | $Undefined,
  ): $AnyNonEmpty  {
    const F = this;

    // 1. Let target be F.[[BoundTargetFunction]].
    const target = F['[[BoundTargetFunction]]'];

    // 2. Assert: IsConstructor(target) is true.
    // 3. Let boundArgs be F.[[BoundArguments]].
    const boundArgs = F['[[BoundArguments]]'];

    // 4. Let args be a new list containing the same values as the list boundArgs in the same order followed by the same values as the list argumentsList in the same order.
    const args = new $List(
      ...boundArgs,
      ...argumentsList,
    );

    // 5. If SameValue(F, newTarget) is true, set newTarget to target.
    if (F.is(newTarget)) {
      newTarget = target;
    }

    // 6. Return ? Construct(target, args, newTarget).
    return $Construct(ctx, target, args, newTarget);
  }
}
