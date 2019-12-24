export type MaybePromise<T> = T | Promise<T>;

export function awaitIfPromise<T, R>(
  maybePromise: MaybePromise<T>,
  condition: (value: T) => boolean,
  then: (value: T) => R,
): R {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(function (value) {
      if (condition(value)) {
        return then(value);
      }

      return value;
    }) as unknown as R;
  }

  if (condition(maybePromise)) {
    return then(maybePromise);
  }

  return maybePromise as unknown as R;
}
