import { Constructable } from '@aurelia/kernel';

import { IRouteViewModel } from './component-agent.js';
import { IRouteContext } from './route-context.js';

type RouterHookKey = 'canUnload' | 'canLoad' | 'unload' | 'load';
export type RouterHookObject<TKey extends RouterHookKey> = Pick<Required<IRouteViewModel>, TKey>;
export type RouterHookFunction<TKey extends RouterHookKey> = Required<IRouteViewModel>[TKey];
export type RouterHookClass<TKey extends RouterHookKey> = Constructable<Pick<Required<IRouteViewModel>, TKey>>;

type RouterHook<TKey extends RouterHookKey> = RouterHookObject<TKey> | RouterHookFunction<TKey> | RouterHookClass<TKey>;

export type CanUnload = RouterHook<'canUnload'>;
export type CanLoad = RouterHook<'canLoad'>;
export type Unload = RouterHook<'unload'>;
export type Load = RouterHook<'load'>;

export function instantiateHook<TKey extends 'canUnload' | 'canLoad' | 'unload' | 'load'>(
  ctx: IRouteContext,
  key: TKey,
  hook: RouterHook<TKey>,
): Pick<Required<IRouteViewModel>, TKey> {
  switch (typeof hook) {
    case 'function':
      if (typeof hook.prototype[key] === 'function') {
        // A function with the hook name in the prototype means it's a class we should create via DI
        return ctx.get(hook as Constructable<Pick<Required<IRouteViewModel>, TKey>>);
      }
      // Otherwise assume it's a loose function / lambda and just return an object literal with it as a property
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return { [key]: hook } as Pick<Required<IRouteViewModel>, TKey>;
    case 'object':
      if (typeof hook[key] === 'function') {
        // An already-created object with the hook function: return as-is
        return hook;
      }
      throw new Error(`Invalid hook object: expected a method '${key}' to be present`);
    default:
      throw new Error(`Invalid hook: expected either a function, a class with a '${key}' method, or an object with a '${key}' method`);
  }
}
