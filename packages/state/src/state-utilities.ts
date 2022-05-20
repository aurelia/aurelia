import { Constructable } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';

export function createStateBindingScope(state: object, scope: Scope) {
  const overrideContext = { bindingContext: state };
  const stateScope = Scope.create(state, overrideContext, true);
  stateScope.parentScope = scope;
  return stateScope;
}

/** @internal */
export const defProto = (klass: Constructable, prop: PropertyKey, desc: PropertyDescriptor) => Reflect.defineProperty(klass.prototype, prop, desc);

/** @internal */
export const isPromise = <T>(v: unknown): v is Promise<T> => v instanceof Promise;
