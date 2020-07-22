/**
 * @internal - Shouldn't be used directly
 */
export function arrayRemove<T>(arr: T[], func: (value: T, index?: number, obj?: T[]) => boolean): T[] {
  const removed: T[] = [];
  let arrIndex = arr.findIndex(func);
  while (arrIndex >= 0) {
    removed.push(arr.splice(arrIndex, 1)[0]);
    arrIndex = arr.findIndex(func);
  }
  return removed;
}

export function resolvePossiblePromise(value: unknown): unknown {
  // If we've got a Promise, wait for it's resolve
  if (value instanceof Promise) {
    return value.then((resolvedValue) => {
      return resolvedValue;
    });
  }
  return value;
}
