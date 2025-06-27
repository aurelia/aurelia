export type Selector<S, R> = (state: S) => R;

/**
 * Create a memoized selector. The selector will only recompute the result
 * when its dependencies change by reference.
 *
 * @param selectors - one or more selector functions. If multiple selectors are
 * supplied, the last function is treated as the result function which receives
 * the selected values. If a single selector function is supplied, it will be
 * memoized directly.
 */
export function createSelector<S, R>(selector: Selector<S, R>): Selector<S, R>;
export function createSelector<S, A, R>(
  s1: Selector<S, A>,
  resultFn: (a: A) => R,
): Selector<S, R>;
export function createSelector<S, A, B, R>(
  s1: Selector<S, A>,
  s2: Selector<S, B>,
  resultFn: (a: A, b: B) => R,
): Selector<S, R>;
export function createSelector<S, A, B, C, R>(
  s1: Selector<S, A>,
  s2: Selector<S, B>,
  s3: Selector<S, C>,
  resultFn: (a: A, b: B, c: C) => R,
): Selector<S, R>;
export function createSelector<S>(
  ...fns: (Selector<S, unknown> | ((...args: unknown[]) => unknown))[]
): Selector<S, unknown> {
  if (fns.length === 1) {
    const selector = fns[0] as Selector<S, unknown>;
    let lastState: S | undefined;
    let lastResult: unknown;
    return (state: S) => {
      if (state === lastState) {
        return lastResult;
      }
      lastState = state;
      return (lastResult = selector(state));
    };
  }
  const resultFn = fns[fns.length - 1] as (...args: unknown[]) => unknown;
  const selectors = fns.slice(0, -1) as Selector<S, unknown>[];
  let lastInputs: unknown[] | undefined;
  let lastResult: unknown;
  return (state: S) => {
    const inputs = selectors.map(fn => fn(state));
    if (
      lastInputs !== undefined &&
      inputs.length === lastInputs.length &&
      inputs.every((v, i) => v === lastInputs![i])
    ) {
      return lastResult;
    }
    lastInputs = inputs;
    return (lastResult = resultFn(...inputs));
  };
}
