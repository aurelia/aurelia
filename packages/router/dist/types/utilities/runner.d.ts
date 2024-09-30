import { OpenPromise } from './open-promise';
/**
 * Class for running a sequence of steps with values,
 * functions and promises. Stays sync if possible.
 *
 * Usage:
 *
 * ```ts
 * const promise = Runner.run(null,
 *   'one',
 *   step => `${step.previousValue}, two`,
 *   step => createPromise(step.previousValue), // creates a promise that resolves to `${value}, three`
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
     * result = await Runner.run(null,
     *   'one',
     *   step => `${step.previousValue}, two`,
     *   step => createPromise(step.previousValue), // creates a promise that resolves to `${value}, three`
     * ); // result === 'one, two, three'
     * ```
     *
     * Returns the result as a promise or a value.
     *
     * If first parameter is an existing Step, the additional steps will be added to run after it. In this
     * case, the return value will be the first new step and not the result (since it doesn't exist yet).
     */
    static run<T = unknown>(predecessor: Step<T> | null | string, ...steps: unknown[]): T | Promise<T> | Step<T>;
    /**
     * Runs a set of steps and retuns a list with their results
     *
     * Steps are processed in parallel and can be either a
     *
     * - value - which is then propagated as input into the next step
     * - function - which is executed in time. The result is replacing the step which is then reprocessed
     * - promise - which is awaited
     *
     * ```ts
     * result = await Runner.runParallel(null,
     *   'one',
     *   step => `${step.previousValue}, two`,
     *   step => createPromise(step.previousValue), // creates a promise that resolves to `${value}, three`
     * ); // result === ['one', 'one, two', 'one, two, three']
     * ```
     *
     * Returns the result as a promise or a list of values.
     *
     * If first parameter is an existing Step, the additional steps will be added to run after it. In this
     * case, the return value will be the first new step and not the result (since it doesn't exist yet).
     */
    static runParallel<T = unknown>(parent: Step<T> | null, ...steps: unknown[]): T[] | Promise<T[]> | Step<T>;
    /**
     * Gets the starting step for a promise returned by Runner.run
     *
     * The step can be used to check status and outcome of
     * the run as well as cancel it
     *
     */
    static step(value: unknown): Step | undefined;
    /**
     * Cancels the remaining steps for a step or promise returned by Runner.run
     *
     * Once a starting step has been cancelled, it's no longer possible
     * to retrieve it from the promise
     *
     */
    static cancel(value: unknown): void;
    private static add;
    private static connect;
    static roots: Record<string, Step>;
    static process<T = unknown>(step: Step<T> | null): void;
    private static ensurePromise;
    private static settlePromise;
}
export declare class Step<T = unknown> {
    step: unknown;
    runParallel: boolean;
    static id: number;
    value?: T | Promise<T> | ((step?: Step) => T | Promise<T>);
    promise: Promise<T | T[]> | null;
    previous: Step<T> | null;
    next: Step<T> | null;
    parent: Step<T> | null;
    child: Step<T> | null;
    current: Step<T> | null;
    finally: OpenPromise<T | T[]> | null;
    isDoing: boolean;
    isDone: boolean;
    isCancelled: boolean;
    isExited: boolean;
    exited: Step<T> | null;
    id: string;
    constructor(step?: unknown, runParallel?: boolean);
    get isParallelParent(): boolean;
    get result(): T | T[] | Promise<T | T[]> | void;
    get asValue(): T | T[] | Promise<T | T[]> | void;
    get previousValue(): unknown;
    get name(): string;
    get root(): Step<T>;
    get head(): Step<T>;
    get tail(): Step<T>;
    get done(): boolean;
    get doneAll(): boolean;
    cancel(all?: boolean): boolean;
    exit(all?: boolean): boolean;
    nextToDo(): Step<T> | null;
    private nextOrUp;
    get path(): string;
    get tree(): string;
    get report(): string;
}
//# sourceMappingURL=runner.d.ts.map