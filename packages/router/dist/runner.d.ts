/**
 * Class for running a sequence of steps with values,
 * functions and promises. Stays sync if possible.
 *
 * Usage:
 *
 * ```ts
 * const promise = Runner.run(
 *   'one',
 *   prev => `${previous}, two`,
 *   prev => createPromise(prev), // creates a promise that resolves to `${prev}, three`
 * );
 *
 * // Run can be cancelled with Runner.cancel(promise);
 *
 * const stepsRunner = Runner.runner(promise);
 * const result = await promise;
 * if (stepsRunner?.isResolved) { // Make sure promise wasn't rejected
 *   // result === 'one, two, three'
 * }
 * ```
 */
export declare class Runner {
    value: unknown;
    isDone: boolean;
    isCancelled: boolean;
    isResolved: boolean;
    isRejected: boolean;
    isAsync: boolean;
    private static readonly runners;
    get stop(): boolean;
    /**
     * Runs a set of steps and retuns the last value
     *
     * Steps are processed in sequence and can be either a
     *
     * - value - which is then propagated as input into the next step
     * - function - which is executed in time. The result is replacing the step which is then reprocessed
     * - promise - which is awaited
     *
     * ```ts
     * result = await Runner.run(
     *   'one',
     *   prev => `${previous}, two`,
     *   prev => createPromise(prev), // creates a promise that resolves to `${prev}, three`
     * ); // result === 'one, two, three'
     * ```
     *
     */
    static run<T = unknown>(...steps: unknown[]): T | Promise<T>;
    /**
     * Gets the runner for a promise returned by Runner.run
     *
     * The runner can be used to check status and outcome of
     * the run as well as cancel it
     *
     */
    static runner(value: unknown | Promise<unknown>): Runner | undefined;
    /**
     * Cancels the runner for a promise returned by Runner.run
     *
     * Once a runner has been cancelled, it's no longer possible
     * to retrieve it from the promise
     *
     */
    static cancel(value: unknown): void;
    static runAll(steps: unknown[]): unknown[] | Promise<unknown[]>;
    static runOne(step: unknown): unknown | Promise<unknown>;
    cancel(): void;
    private static $run;
    private static $runAll;
}
//# sourceMappingURL=runner.d.ts.map