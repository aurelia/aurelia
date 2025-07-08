export type StateMemoizer<S, R> = (state: S) => R;

/**
 * Create a memoized selector. The selector will only recompute the result
 * when its dependencies change by reference.
 *
 * @param selectors - one or more selector functions. If multiple selectors are
 * supplied, the last function is treated as the result function which receives
 * the selected values. If a single selector function is supplied, it will be
 * memoized directly.
 */
export function createStateMemoizer<S, R>(memorizer: StateMemoizer<S, R>): StateMemoizer<S, R>;
export function createStateMemoizer<S, A, R>(
  m1: StateMemoizer<S, A>,
  resultFn: (a: A) => R,
): StateMemoizer<S, R>;
export function createStateMemoizer<S, A, B, R>(
  m1: StateMemoizer<S, A>,
  m2: StateMemoizer<S, B>,
  resultFn: (a: A, b: B) => R,
): StateMemoizer<S, R>;
export function createStateMemoizer<S, A, B, C, R>(
  m1: StateMemoizer<S, A>,
  m2: StateMemoizer<S, B>,
  m3: StateMemoizer<S, C>,
  resultFn: (a: A, b: B, c: C) => R,
): StateMemoizer<S, R>;
export function createStateMemoizer<S>(
  ...fns: (StateMemoizer<S, unknown> | ((...args: unknown[]) => unknown))[]
): StateMemoizer<S, unknown> {

  if (fns.length === 1) {
    // with only 1, result function is also a memorizer
    const resultFn = fns[0] as StateMemoizer<S, unknown>;
    let lastState: S | undefined;
    let lastResult: unknown;
    return (state: S) => {
      if (state === lastState) {
        return lastResult;
      }
      lastState = state;
      return (lastResult = resultFn(state));
    };
  }

  const resultFn = fns[fns.length - 1] as (...args: unknown[]) => unknown;
  const memoizerFns = fns.slice(0, -1) as StateMemoizer<S, unknown>[];
  let lastInputs: unknown[] | undefined;
  let lastResult: unknown;
  return (state: S) => {
    const inputs = memoizerFns.map(fn => fn(state));
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
