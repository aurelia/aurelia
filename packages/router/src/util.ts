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
  nodes: RouteNode[],
  callback: (viewportAgent: ViewportAgent) => R,
): R {
  const seen = new Map<ViewportAgent, void | Promise<void>>();
  return onResolve($walkViewportTree(nodes, callback, seen), function () {
    seen.clear();
  }) as R;
}

function $walkViewportTree<R extends void | Promise<void>>(
  nodes: RouteNode[],
  callback: (viewportAgent: ViewportAgent) => R,
  seen: Map<ViewportAgent, void | Promise<void>>,
): R {
  return resolveAll(nodes.map(function (node) {
    const vpa = node.context.vpa;
    let result: void | Promise<void>;
    if (seen.has(vpa)) {
      result = seen.get(vpa);
    } else {
      result = callback(vpa);
      if (result instanceof Promise) {
        seen.set(vpa, result);
        // It can't throw and nothing needs to wait for it
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        result.then(function () {
          // Just check that we haven't been cleared yet, so we can't cause minor mem leaks
          if (seen.size > 0) {
            // Set to void after the promise resolves, so that we don't wait unnecessary ticks later down the road
            seen.set(vpa, void 0);
          }
        });
      } else {
        // Don't care about anything other than undefined if it's not a promise, so to prevent potential megamorphism, set to undefined
        seen.set(vpa, void 0);
      }
    }
    return onResolve(result, function () {
      return $walkViewportTree(node.children, callback, seen);
    });
  })) as R;
}
