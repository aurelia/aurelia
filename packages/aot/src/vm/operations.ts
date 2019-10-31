import { Host, Realm } from './host';
import { $Object, $Any, $BuiltinFunction, $Null } from './value';

export type CallableFunction = (
  thisArgument: $Any,
  argumentsList: readonly $Any[],
  NewTarget: $Any,
) => $Any;

export type FunctionPrototype = Realm['[[Intrinsics]]']['%FunctionPrototype%'];

// http://www.ecma-international.org/ecma-262/#sec-createbuiltinfunction
export function CreateBuiltinFunction<
  T extends string = string,
>(
  host: Host,
  IntrinsicName: T,
  steps: CallableFunction,
  internalSlotsList: readonly string[],
  realm?: Realm,
  prototype?: $Object,
): $BuiltinFunction<T> {
  // 1. Assert: steps is either a set of algorithm steps or other definition of a function's behaviour provided in this specification.
  // 2. If realm is not present, set realm to the current Realm Record.
  if (realm === void 0) {
    realm = host.realm;
  }

  // 3. Assert: realm is a Realm Record.
  // 4. If prototype is not present, set prototype to realm.[[Intrinsics]].[[%FunctionPrototype%]].
  if (prototype === void 0) {
    prototype = realm['[[Intrinsics]]']['%FunctionPrototype%'];
  }

  // 5. Let func be a new built-in function object that when called performs the action described by steps. The new function object has internal slots whose names are the elements of internalSlotsList. The initial value of each of those internal slots is undefined.
  // 6. Set func.[[Realm]] to realm.
  // 7. Set func.[[Prototype]] to prototype.
  // 8. Set func.[[Extensible]] to true.
  // 9. Set func.[[ScriptOrModule]] to null.
  // 10. Return func.
  return new $BuiltinFunction(host, IntrinsicName, prototype, steps);
}
