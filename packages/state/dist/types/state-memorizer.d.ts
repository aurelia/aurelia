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
export declare function createStateMemoizer<S, R>(memorizer: StateMemoizer<S, R>): StateMemoizer<S, R>;
export declare function createStateMemoizer<S, A, R>(m1: StateMemoizer<S, A>, resultFn: (a: A) => R): StateMemoizer<S, R>;
export declare function createStateMemoizer<S, A, B, R>(m1: StateMemoizer<S, A>, m2: StateMemoizer<S, B>, resultFn: (a: A, b: B) => R): StateMemoizer<S, R>;
export declare function createStateMemoizer<S, A, B, C, R>(m1: StateMemoizer<S, A>, m2: StateMemoizer<S, B>, m3: StateMemoizer<S, C>, resultFn: (a: A, b: B, c: C) => R): StateMemoizer<S, R>;
//# sourceMappingURL=state-memorizer.d.ts.map