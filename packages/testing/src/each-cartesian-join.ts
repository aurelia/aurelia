
export function eachCartesianJoinFactory<T1, U>(
  arrays: [(() => T1)[]],
  callback: (arg1: T1) => U): void;

export function eachCartesianJoinFactory<T1, T2, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[]],
  callback: (arg1: T1, arg2: T2) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => T7)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => T8)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => T9)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => T9)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => T10)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => T9)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => T10)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10) => T11)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10, arg11: T11) => U): void;

export function eachCartesianJoinFactory<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, U>(
  arrays: [(() => T1)[], ((arg1: T1) => T2)[], ((arg1: T1, arg2: T2) => T3)[], ((arg1: T1, arg2: T2, arg3: T3) => T4)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4) => T5)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => T6)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => T7)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => T8)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => T9)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9) => T10)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10) => T11)[], ((arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10, arg11: T11) => T12)[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, arg10: T10, arg11: T11, arg12: T12) => U): void;

export function eachCartesianJoinFactory<T, U>(
  arrays: ((...args: T[]) => T)[][],
  callback: (...args: any[]) => U): void {

  arrays = arrays.slice(0).filter(arr => arr.length > 0);
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }
  if (arrays.length === 0) {
    return;
  }
  const totalCallCount: number = arrays.reduce((count: number, arr: ((...args: T[]) => T)[]) => count *= arr.length, 1);
  const argsIndices = Array(arrays.length).fill(0);
  const errors: Error[] = [];
  let args: T[] = null!;
  try {
    args = updateElementByIndicesFactory(arrays, Array(arrays.length), argsIndices);
    callback(...args);
  } catch (e) {
    errors.push(e as Error);
  }
  let callCount = 1;
  if (totalCallCount === callCount) {
    return;
  }
  let stop = false;
  while (!stop) {
    const hasUpdate = updateIndices(arrays, argsIndices);
    if (hasUpdate) {
      try {
        callback(...updateElementByIndicesFactory(arrays, args, argsIndices));
      } catch (e) {
        errors.push(e as Error);
      }
      callCount++;
      if (totalCallCount < callCount) {
        throw new Error('Invalid loop implementation.');
      }
    } else {
      stop = true;
    }
  }
  if (errors.length > 0) {
    const msg = `eachCartesionJoinFactory failed to load ${errors.length} tests:\n\n${errors.map(e => e.message).join('\n')}`;
    throw new Error(msg);
  }
}
function updateElementByIndicesFactory<T>(arrays: ((...args: T[]) => T)[][], args: T[], indices: number[]): T[] {
  for (let i = 0, ii = arrays.length; ii > i; ++i) {
    args[i] = arrays[i][indices[i]](...args);
  }
  return args;
}

export function eachCartesianJoin<T1, U>(
  arrays: [T1[]],
  callback: (arg1: T1, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, U>(
  arrays: [T1[], T2[]],
  callback: (arg1: T1, arg2: T2, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, U>(
  arrays: [T1[], T2[], T3[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, U>(
  arrays: [T1[], T2[], T3[], T4[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, T7, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, T7, T8, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[], T8[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, callIndex: number) => U): void;

export function eachCartesianJoin<T1, T2, T3, T4, T5, T6, T7, T8, T9, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[], T8[], T9[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, callIndex: number) => U): void;

export function eachCartesianJoin<T, U>(
  arrays: T[][],
  callback: (...args: any[]) => U): void {

  arrays = arrays.slice(0).filter(arr => arr.length > 0);
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }
  if (arrays.length === 0) {
    return;
  }
  const totalCallCount: number = arrays.reduce((count: number, arr: T[]) => count *= arr.length, 1);
  const argsIndices = Array(arrays.length).fill(0);
  const args: T[] = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
  callback(...args, 0);
  let callCount = 1;
  if (totalCallCount === callCount) {
    return;
  }
  let stop = false;
  while (!stop) {
    const hasUpdate = updateIndices(arrays, argsIndices);
    if (hasUpdate) {
      callback(...updateElementByIndices(arrays, args, argsIndices), callCount);
      callCount++;
      if (totalCallCount < callCount) {
        throw new Error('Invalid loop implementation.');
      }
    } else {
      stop = true;
    }
  }
}

export function eachCartesianJoinAsync<T1, U>(
  arrays: [T1[]],
  callback: (arg1: T1, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, U>(
  arrays: [T1[], T2[]],
  callback: (arg1: T1, arg2: T2, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, U>(
  arrays: [T1[], T2[], T3[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, T4, U>(
  arrays: [T1[], T2[], T3[], T4[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, T4, T5, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, T4, T5, T6, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, T4, T5, T6, T7, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, T4, T5, T6, T7, T8, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[], T8[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, callIndex: number) => U): Promise<void>;

export function eachCartesianJoinAsync<T1, T2, T3, T4, T5, T6, T7, T8, T9, U>(
  arrays: [T1[], T2[], T3[], T4[], T5[], T6[], T7[], T8[], T9[]],
  callback: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9, callIndex: number) => U): Promise<void>;

export async function eachCartesianJoinAsync<T, U extends Promise<any>>(
  arrays: T[][],
  callback: (...args: any[]) => U): Promise<void> {

  arrays = arrays.slice(0).filter(arr => arr.length > 0);
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }
  if (arrays.length === 0) {
    return;
  }
  const totalCallCount: number = arrays.reduce((count: number, arr: T[]) => count *= arr.length, 1);
  const argsIndices = Array(arrays.length).fill(0);
  const args: T[] = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
  await callback(...args, 0);
  let callCount = 1;
  if (totalCallCount === callCount) {
    return;
  }
  let stop = false;
  while (!stop) {
    const hasUpdate = updateIndices(arrays, argsIndices);
    if (hasUpdate) {
      // eslint-disable-next-line no-await-in-loop
      await callback(...updateElementByIndices(arrays, args, argsIndices), callCount);
      callCount++;
      if (totalCallCount < callCount) {
        throw new Error('Invalid loop implementation.');
      }
    } else {
      stop = true;
    }
  }
}
function updateIndices<T>(arrays: T[][], indices: number[]): boolean {
  let arrIndex = arrays.length;
  while (arrIndex--) {
    if (indices[arrIndex] === arrays[arrIndex].length - 1) {
      if (arrIndex === 0) {
        return false;
      }
      continue;
    }

    indices[arrIndex] += 1;
    for (let i = arrIndex + 1, ii = arrays.length; ii > i; ++i) {
      indices[i] = 0;
    }
    return true;
  }
  return false;
}
function updateElementByIndices<T>(arrays: T[][], args: T[], indices: number[]): T[] {
  for (let i = 0, ii = arrays.length; ii > i; ++i) {
    args[i] = arrays[i][indices[i]];
  }
  return args;
}

export function generateCartesianProduct<T1>(arrays: [T1[]]): Generator<[T1]>;
export function generateCartesianProduct<T1, T2>(arrays: [T1[], T2[]]): Generator<[T1, T2]>;
export function generateCartesianProduct<T1, T2, T3>(arrays: [T1[], T2[], T3[]]): Generator<[T1, T2, T3]>;
export function generateCartesianProduct<T1, T2, T3, T4>(arrays: [T1[], T2[], T3[], T4[]]): Generator<[T1, T2, T3, T4]>;
export function generateCartesianProduct<T1, T2, T3, T4, T5>(arrays: [T1[], T2[], T3[], T4[], T5[]]): Generator<[T1, T2, T3, T4, T5]>;
export function* generateCartesianProduct<T>(arrays: T[][]): Generator<T[]> {
  const [head, ...tail] = arrays;
  const tailCombinations: Generator<[any]> | [][] = tail.length > 0 ? generateCartesianProduct(tail as any) : [[]];
  for (const t of tailCombinations) {
    for (const h of head) {
      yield [h, ...t];
    }
  }
}
