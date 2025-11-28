import { DI } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { type IStore, type SubscribableValue } from './interfaces';

/** @internal */
export const createInterface = DI.createInterface;
/** @internal */
export function createStateBindingScope(state: object, scope: Scope) {
  const overrideContext = { bindingContext: state };
  const stateScope = Scope.create(state, overrideContext, true);
  stateScope.parent = scope;
  return stateScope;
}

/** @internal */
export const isPromise = <T>(v: unknown): v is Promise<T> => v instanceof Promise;

/** @internal */
export function isSubscribable(v: unknown): v is SubscribableValue {
  return v instanceof Object && 'subscribe' in (v as SubscribableValue);
}

/** @internal */
export function isStoreInstance(value: unknown): value is IStore<object> {
  return value instanceof Object
    && typeof (value as IStore<object>).getState === 'function'
    && typeof (value as IStore<object>).dispatch === 'function';
}
