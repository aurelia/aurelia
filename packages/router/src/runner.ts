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
export class Runner {
  public value: unknown;
  public isDone: boolean = false;
  public isCancelled: boolean = false;
  public isResolved: boolean = false;
  public isRejected: boolean = false;
  public isAsync: boolean = false;

  private static readonly runners: WeakMap<Promise<unknown>, Runner> = new WeakMap();

  public get stop(): boolean {
    return this.isCancelled || this.isRejected;
  }

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
  public static run<T = unknown>(...steps: unknown[]): T | Promise<T> {
    // debugger; // FIX ARRAY CHECK!
    const $runner = new Runner();
    const value = Runner.$run($runner, ...steps);
    if (value instanceof Promise) {
      this.runners.set(value, $runner);
      value.then(() => {
        $runner.isDone = true;
        if ($runner.isAsync && !$runner.stop) {
          $runner.isResolved = true;
        }
        this.runners.delete(value);
        // console.log('$runner done', $runner, this.runners);
      }).catch(err => { throw err; });
    }
    return value as T | Promise<T>;
  }

  /**
   * Gets the runner for a promise returned by Runner.run
   *
   * The runner can be used to check status and outcome of
   * the run as well as cancel it
   *
   */
  public static runner(value: unknown | Promise<unknown>): Runner | undefined {
    if (value instanceof Promise) {
      return Runner.runners.get(value);
    }
  }

  /**
   * Cancels the runner for a promise returned by Runner.run
   *
   * Once a runner has been cancelled, it's no longer possible
   * to retrieve it from the promise
   *
   */
  public static cancel(value: unknown): void {
    const $runner = Runner.runner(value);
    if ($runner !== void 0) {
      $runner.cancel();
    }
  }

  public static runAll(steps: unknown[]): unknown[] | Promise<unknown[]> {
    const $runner = new Runner();
    const values = Runner.$runAll($runner, steps);

    if ($runner.isAsync) {
      const promise = Promise.all(values);
      this.runners.set(promise, $runner);
      promise.then(() => {
        $runner.isDone = true;
        if ($runner.isAsync && !$runner.stop) {
          $runner.isResolved = true;
        }
        this.runners.delete(promise);
        // console.log('$runner done', $runner, this.runners);
      }).catch(err => { throw err; });
      return promise;
    }
    return values;
  }

  public static runOne(step: unknown): unknown | Promise<unknown> {
    let value: unknown;
    // Iteratively resolve Functions (until value or Promise)
    while (step instanceof Function) {
      step = step(value);
      if (!(step instanceof Function) && !(step instanceof Promise)) { // === isValue(step)
        value = step;
      }
    }
    // In case there wasn't a Function before the value
    if (!(step instanceof Function) && !(step instanceof Promise)) { // === isValue(step)
      value = step;
    }
    // If we've got a Promise, run the remaining
    if (step instanceof Promise) {
      return step.then((resolvedValue) => {
        return Runner.runOne(resolvedValue);
      }).catch((err) => { throw err; });
    }
    return value;
  }

  public cancel(): void {
    this.isCancelled = true;
  }

  private static $run($runner: Runner, ...steps: unknown[]): unknown {
    let step: unknown;
    while (steps.length > 0 && !$runner.stop) {
      step = steps.shift();
      // Iteratively resolve Functions (until value or Promise)
      while (step instanceof Function && !$runner.stop) {
        step = step($runner.value);
        if (!(step instanceof Function) && !(step instanceof Promise)) { // === isValue(step)
          $runner.value = step;
        }
      }
      // In case there wasn't a Function before the value
      if (!(step instanceof Function) && !(step instanceof Promise)) { // === isValue(step)
        $runner.value = step;
      }
      // Run steps until done or we get a Promise
      if (step instanceof Promise) {
        break;
      }
    }
    // If we've got a Promise, run the remaining
    if (step instanceof Promise && !$runner.stop) {
      $runner.isAsync = true;
      return step.then((resolvedValue) => {
        return Runner.$run($runner, resolvedValue, ...steps);
      }).catch((err) => {
        $runner.isRejected = true;
        throw err;
      });
    }
    return $runner.value;
  }

  private static $runAll($runner: Runner, steps: unknown[]): unknown[] {
    const results: unknown[] = new Array(steps.length);
    steps.forEach((step, index) => {
      // Iteratively resolve Functions (until value or Promise)
      while (step instanceof Function) {
        step = step(results[index]);
        if (!(step instanceof Function) && !(step instanceof Promise)) { // === isValue(step)
          results[index] = step;
        }
      }
      // In case there wasn't a Function before the value
      if (!(step instanceof Function)) { // === isValue(step)
        results[index] = step;
      }

      // If we've got a Promise, run the remaining
      if (step instanceof Promise) {
        $runner.isAsync = true;
      }
    });
    return results;
  }
}
