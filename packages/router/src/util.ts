import { RouteNode } from './route-tree';
import { ViewportAgent } from './viewport-agent';

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
type MaybePromise<T> = T extends Promise<infer R> ? (T | R) : (T | Promise<T>);

/**
 * Normalize a series of callbacks that may or may not return promises, while staying synchronous wherever possible.
 */
export function runSequence<T1, T2>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
): MaybePromise<T2>;
export function runSequence<T1, T2, T3>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
): MaybePromise<T3>;
export function runSequence<T1, T2, T3, T4>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
  call4: (abort: () => void, value: UnwrapPromise<T3>) => T4,
): MaybePromise<T4>;
export function runSequence<T1, T2, T3, T4, T5>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
  call4: (abort: () => void, value: UnwrapPromise<T3>) => T4,
  call5: (abort: () => void, value: UnwrapPromise<T4>) => T5,
): MaybePromise<T5>;
export function runSequence<T1, T2, T3, T4, T5, T6>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
  call4: (abort: () => void, value: UnwrapPromise<T3>) => T4,
  call5: (abort: () => void, value: UnwrapPromise<T4>) => T5,
  call6: (abort: () => void, value: UnwrapPromise<T5>) => T6,
): MaybePromise<T6>;
export function runSequence<T1, T2, T3, T4, T5, T6, T7>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
  call4: (abort: () => void, value: UnwrapPromise<T3>) => T4,
  call5: (abort: () => void, value: UnwrapPromise<T4>) => T5,
  call6: (abort: () => void, value: UnwrapPromise<T5>) => T6,
  call7: (abort: () => void, value: UnwrapPromise<T6>) => T7,
): MaybePromise<T7>;
export function runSequence<T1, T2, T3, T4, T5, T6, T7, T8>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
  call4: (abort: () => void, value: UnwrapPromise<T3>) => T4,
  call5: (abort: () => void, value: UnwrapPromise<T4>) => T5,
  call6: (abort: () => void, value: UnwrapPromise<T5>) => T6,
  call7: (abort: () => void, value: UnwrapPromise<T6>) => T7,
  call8: (abort: () => void, value: UnwrapPromise<T7>) => T8,
): MaybePromise<T8>;
export function runSequence<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  call1: (abort: () => void) => T1,
  call2: (abort: () => void, value: UnwrapPromise<T1>) => T2,
  call3: (abort: () => void, value: UnwrapPromise<T2>) => T3,
  call4: (abort: () => void, value: UnwrapPromise<T3>) => T4,
  call5: (abort: () => void, value: UnwrapPromise<T4>) => T5,
  call6: (abort: () => void, value: UnwrapPromise<T5>) => T6,
  call7: (abort: () => void, value: UnwrapPromise<T6>) => T7,
  call8: (abort: () => void, value: UnwrapPromise<T7>) => T8,
  call9: (abort: () => void, value: UnwrapPromise<T8>) => T9,
): MaybePromise<T9>;
export function runSequence(
  ...calls: ((abort: () => void, value: unknown) => unknown)[]
): unknown {
  let aborted = false;
  function abort(): void {
    aborted = true;
  }

  function runNext(prevResult: unknown): unknown {
    if (aborted) {
      return prevResult;
    }

    const nextCall = calls.shift()!;
    const nextValue = nextCall(abort, prevResult);
    if (calls.length === 0) {
      return nextValue;
    }

    if (nextValue instanceof Promise) {
      return nextValue.then(runNext);
    }

    return runNext(nextValue);
  }

  return runNext(void 0);
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
      return Promise.all(promises) as unknown as Promise<void>;
  }
}

export function traverse<R extends void | Promise<void>>(
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

  return runSequence(
    () => {
      switch (direction) {
        case 'bottom-up':
          return resolveAll(nodes.map(function dive(node): R {
            return runSequence(
              () => { return resolveAll(node.children.map(dive)); },
              () => { return cachedCallback(node.context.vpa); },
            ) as R;
          }));
        case 'top-down':
          return resolveAll(nodes.map(function dive(node): R {
            return runSequence(
              () => { return cachedCallback(node.context.vpa); },
              () => { return resolveAll(node.children.map(dive)); },
            ) as R;
          }));
      }
    },
    () => { cache.clear(); },
  ) as R;
}

export type ExposedPromise<T> = Promise<T> & {
  resolve(value?: T): void;
  reject(reason?: unknown): void;
};

export function createExposedPromise<T>(): ExposedPromise<T> {
  let $resolve: (value?: T) => void = (void 0)!;
  let $reject: (reason?: unknown) => void = (void 0)!;
  const promise = new Promise(function (resolve, reject) {
    $resolve = resolve;
    $reject = reject;
  }) as ExposedPromise<T>;
  promise.resolve = $resolve;
  promise.reject = $reject;
  return promise;
}
