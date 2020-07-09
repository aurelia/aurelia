import { RouteNode } from './route-tree';
import { ViewportAgent } from './viewport-agent';

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
type MaybePromise<T> = T extends Promise<infer R> ? (T | R) : (T | Promise<T>);

/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
export function onResolve<TValue, TRet>(
  maybePromise: TValue,
  resolveCallback: (value: UnwrapPromise<TValue>) => TRet,
): MaybePromise<TRet> {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(resolveCallback) as MaybePromise<TRet>;
  }
  return resolveCallback(maybePromise as UnwrapPromise<TValue>) as MaybePromise<TRet>;
}

/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
export function resolveAll(
  maybePromises: (void | Promise<void>)[],
): void | Promise<void> {
  const promises: Promise<void>[] = [];
  for (const maybePromise of maybePromises) {
    if (maybePromise instanceof Promise) {
      promises.push(maybePromise);
    }
  }

  switch (promises.length) {
    case 0:
      return;
    case 1:
      return promises[0];
    default:
      return Promise.all(promises).then() as unknown as Promise<void>;
  }
}

export function walkViewportTree<R extends void | Promise<void>>(
  direction: 'bottom-up' | 'top-down',
  nodes: RouteNode[],
  callback: (viewportAgent: ViewportAgent) => R,
): R {
  const cache = new Map<ViewportAgent, void | Promise<void>>();

  function cachedCallback(vpa: ViewportAgent): R {
    let result: void | Promise<void>;
    if (cache.has(vpa)) {
      result = cache.get(vpa);
    } else {
      result = callback(vpa);
      if (result instanceof Promise) {
        cache.set(vpa, result);
        // It can't throw and nothing needs to wait for it
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        result.then(function () {
          // Just check that we haven't been cleared yet, so we can't cause minor mem leaks
          if (cache.size > 0) {
            // Set to void after the promise resolves, so that we don't wait unnecessary ticks later down the road
            cache.set(vpa, void 0);
          }
        });
      } else {
        // Don't care about anything other than undefined if it's not a promise, so to prevent potential megamorphism, set to undefined
        cache.set(vpa, void 0);
      }
    }
    return result as R;
  }

  let result: void | Promise<void>;
  switch (direction) {
    case 'bottom-up':
      result = resolveAll(nodes.map(function traverse(node): R {
        return onResolve(resolveAll(node.children.map(traverse)), function () {
          return cachedCallback(node.context.vpa);
        }) as R;
      }));
      break;
    case 'top-down':
      result = resolveAll(nodes.map(function traverse(node): R {
        return onResolve(cachedCallback(node.context.vpa), function () {
          return resolveAll(node.children.map(traverse));
        }) as R;
      }));
      break;
  }

  return onResolve(result, function () {
    cache.clear();
  }) as R;
}
