import { OpenPromise } from './open-promise.js';

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

  private static readonly runners: WeakMap<Promise<unknown>, Step<unknown>> = new WeakMap();

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
   * Returns the result as a promise or a value.
   *
   * If first parameter is an existing Step, the additional steps will be added to run after it. In this
   * case, the return value will be the first new step and not the result (since it doesn't exist yet).
   */
  public static run<T = unknown>(predecessor: Step<T> | null, ...steps: unknown[]): T | Promise<T> | Step<T> {
    if ((steps?.length ?? 0) === 0) {
      return steps?.[0] as T | Promise<T>;
    }

    let newRoot = false;
    // No predecessor, so create a new root and add steps as children to it
    if (predecessor === null) {
      predecessor = new Step<T>();
      newRoot = true;
    }

    // First new step
    const start = new Step<T>(steps.shift());
    // If the predecessor is new root or parallel the start needs to be a child of the predecessor
    Runner.connect(predecessor, start, (predecessor?.runParallel ?? false) || newRoot);

    if (steps.length > 0) {
      Runner.add(start, false, ...steps);
    }

    // If we've added a new root, run and return the result
    if (newRoot) {
      Runner.process(predecessor);

      if (predecessor.result instanceof Promise) {
        this.runners.set(predecessor.result, predecessor as Step);
      }
      return predecessor.result as T | Promise<T>;
    }

    return start;
  }

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
   * result = await Runner.run(
   *   'one',
   *   prev => `${previous}, two`,
   *   prev => createPromise(prev), // creates a promise that resolves to `${prev}, three`
   * ); // result === 'one, two, three'
   * ```
   *
   * Returns the result as a promise or a value.
   *
   * If first parameter is an existing Step, the additional steps will be added to run after it. In this
   * case, the return value will be the first new step and not the result (since it doesn't exist yet).
   */
  public static runParallel<T = unknown>(parent: Step<T> | null, ...steps: unknown[]): T[] | Promise<T[]> | Step<T> {
    if ((steps?.length ?? 0) === 0) {
      return [];
    }

    let newRoot = false;
    // No parent, so parallel from a new root
    if (parent === null) {
      parent = new Step<T>();
      newRoot = true;
    } else { // Need to inject a step under the parent to put the parallel steps under
      parent = Runner.connect(parent, new Step<T>(), true);
    }

    Runner.add(parent, true, ...steps);

    if (newRoot) {
      Runner.process(parent);
    }

    if (parent.result instanceof Promise) {
      this.runners.set(parent.result, parent as Step);
    }

    return newRoot ? (parent.result ?? []) as T[] | Promise<T[]> : parent;
  }

  /**
   * Gets the starting step for a promise returned by Runner.run
   *
   * The step can be used to check status and outcome of
   * the run as well as cancel it
   *
   */
  public static step(value: unknown | Promise<unknown>): Step | undefined {
    if (value instanceof Promise) {
      return Runner.runners.get(value);
    }
  }

  /**
   * Cancels the remaining steps for a step or promise returned by Runner.run
   *
   * Once a starting step has been cancelled, it's no longer possible
   * to retrieve it from the promise
   *
   */
  public static cancel(value: unknown | Promise<unknown>): void {
    const step = Runner.step(value);
    if (step !== void 0) {
      step.cancel();
    }
  }

  private static add<T = unknown>(predecessorOrParent: Step<T> | null, parallel: boolean, ...steps: unknown[]): Step<T> {
    let step = new Step<T>(steps.shift(), parallel);

    // Connect to predecessor or parent if there is one
    if (predecessorOrParent !== null) {
      // Connect first step either after or below depending on parallel
      step = Runner.connect(predecessorOrParent, step, parallel);
    }
    const start = step;

    while (steps.length > 0) {
      // Connect subsequent steps after
      step = Runner.connect(step, new Step<T>(steps.shift(), parallel), false);
    }
    return start;
  }

  private static connect<T = unknown>(predecessorOrParent: Step<T>, step: Step<T>, asChild: boolean): Step<T> {
    if (!asChild) {
      // Can have a pre-existing next
      const next = predecessorOrParent.next;
      predecessorOrParent.next = step;
      step.previous = predecessorOrParent;
      step.next = next;

      if (next !== null) {
        next.previous = step;
        next.parent = null;
      }
    } else {
      // Shouldn't really have a pre-existing child, but just to be sure
      const child = predecessorOrParent.child;
      predecessorOrParent.child = step;
      step.parent = predecessorOrParent;
      step.next = child;

      if (child !== null) {
        child.parent = null;
        child.previous = step;
      }
    }
    return step;
  }

  public static roots: any = {};
  // Always set and resolve root OpenPromise as soon as there's a promise somewhere
  // Subsequent calls work on the origin promise(s)
  // root is the top root of the connected steps
  // step.promise holds promise that resolves
  // step.value holds value that's resolved
  public static process<T = unknown>(step: Step<T> | null): void {
    const root = step!.root;
    while (step !== null && !step.isDoing && !step.isDone) {
      if (step.isParallelParent) {
        step.isDone = true;

        let child = step.child;
        while (child !== null) {
          Runner.process(child);
          child = child.next;
        }
      } else {
        step.isDoing = true;
        step.value = step.step as T | Promise<T> | ((s?: Step) => T | Promise<T>);
        // Iteratively resolve Functions (until value or Promise)
        // Called method can stop iteration by setting isDone on the step
        while (step.value instanceof Function && !step.isCancelled && !step.isDone) {
          step.value = (step.value)(step as Step);
        }

        if (!step.isCancelled) {
          // If we've got a Promise, run the remaining
          if (step.value instanceof Promise) {
            // Store promise since propagateResult can change it for OpenPromise
            const promise = step.value;

            Runner.ensurePromise<T>(root);
            // TODO: Possibly also ensure promise in origin

            (($step: Step<T>, $promise) => {
              $promise.then(result => {
                // console.log('Resolving', $step.path);
                $step.value = result;
                // Only if there's a "public" promise to resolve
                Runner.resolvePromise($step);

                $step.isDone = true;
                $step.isDoing = false;

                const next = $step.nextToDo();
                // console.log('next', next?.path, next?.root.report);
                if (next !== null) {
                  Runner.process(next);
                } else {
                  if ($step.root.doneAll) {
                    Runner.resolvePromise($step.root);
                  }
                }
              }).catch(err => { throw err; });
            })(step, promise);
          } else {
            step.isDone = true;
            step.isDoing = false;

            step = step.nextToDo();
          }
        }
      }
    }

    // Keep this, good for debugging unresolved steps
    // Runner.roots[root.id] = root.doneAll ? true : root.step;
    // console.log(root.doneAll, root.report, Runner.roots);
    // console.log(root.doneAll, root.report);

    if (root.doneAll) {
      Runner.resolvePromise(root);
    }
  }

  private static ensurePromise<T = unknown>(step: Step<T>): boolean {
    if (step.finally === null) {
      step.finally = new OpenPromise();
      step.promise = step.finally.promise;
      return true;
    }
    return false;
  }

  private static resolvePromise<T = unknown>(step: Step<T>): void {
    if (step.finally?.isPending ?? false) {
      step.promise = null;
      // TODO: Should it also iteratively resolve functions and promises?
      step.finally?.resolve(step.result as T | T[] | Promise<T | T[]>);
    }
  }
}

export class Step<T = unknown> {
  public static id: number = 0;

  public value?: T | Promise<T> | ((step?: Step) => T | Promise<T>);
  public promise: Promise<T | T[]> | null = null;

  public previous: Step<T> | null = null;
  public next: Step<T> | null = null;
  public parent: Step<T> | null = null;
  public child: Step<T> | null = null;
  public finally: OpenPromise<T | T[]> | null = null;

  public isDoing: boolean = false;
  public isDone: boolean = false;
  public isCancelled: boolean = false;

  public id: string = '-1';
  public constructor(
    public step: unknown = void 0,
    public runParallel: boolean = false,
  ) {
    this.id = `${Step.id++}`;
  }

  public get isParallelParent(): boolean {
    return this.child?.runParallel ?? false;
  }

  public get result(): T | T[] | Promise<T | T[]> | void {
    // TODO: Possibly check done and create a promise if necessary

    // If we've got a promise, we're not done so return the promise
    if (this.promise !== null) {
      return this.promise;
    }

    // A parallel parent returns the results of its children
    if (this.isParallelParent) {
      const results: T[] = [];
      let child: Step<T> | null = this.child;
      while (child !== null) {
        results.push(child.result as T);
        child = child.next;
      }
      return results;
    }

    // Root returns result of last child
    if (this === this.root) {
      return this.child?.tail?.result;
    }

    // If none of the above, return the value
    return this.value as T;
  }

  public get asValue(): T | T[] | Promise<T | T[]> | void {
    // TODO: This should check done and create a promise if necessary
    return this.result;
  }

  public get previousValue(): unknown {
    return this.runParallel
      ? this.head.parent?.parent?.previous?.result
      : this.previous?.value;
  }

  public get name(): string {
    let name = `${this.id}`;
    if (this.runParallel) {
      name = `:${name}`;
    }
    if (this.value instanceof Promise || this.promise instanceof Promise) {
      name = `${name}*`;
    }
    if (this.finally !== null) {
      name = `${name}*`;
    }
    if (this.child !== null) {
      name = `${name}>`;
    }
    if (this.isDone) {
      name = `(${name})`;
    }
    return name;
  }

  public get root(): Step<T> {
    let root = this.head;
    while (root.parent !== null) {
      root = root.parent.head;
    }
    return root;
  }
  public get head(): Step<T> {
    let step: Step<T> = this;
    while (step.previous !== null) {
      step = step.previous;
    }
    return step;
  }
  public get tail(): Step<T> {
    let step: Step<T> = this;
    while (step.next !== null) {
      step = step.next;
    }
    return step;
  }

  public get done(): boolean {
    if (!this.isDone) {
      return false;
    }
    let step: Step<T> | null = this.child;
    while (step !== null) {
      if (!step.done) {
        return false;
      }
      step = step.next;
    }
    return true;
  }

  public get doneAll(): boolean {
    if (!this.isDone
      || ((this.child !== null) && !this.child.doneAll)
      || ((this.next !== null) && !this.next.doneAll)
    ) {
      return false;
    }
    return true;
  }

  public cancel(all = true): boolean {
    if (all) {
      return this.root.cancel(false);
    }
    if (this.isCancelled) {
      return false;
    }
    this.isCancelled = true;
    this.child?.cancel(false);
    this.next?.cancel(false);
    return true;
  }

  public nextToDo(): Step<T> | null {
    // First step into if possible
    if (this.child !== null && !this.child.isDoing && !this.child.isDone) {
      return this.child;
    }
    // Parallels can only continue if they are the last one finished
    if (this.runParallel && !this.head.parent!.done) {
      return null;
    }
    return this.nextOrUp();
  }
  private nextOrUp(): Step<T> | null {
    // Take next if possible
    let next: Step<T> | null = this.next;
    while (next !== null) {
      if (!next.isDoing && !next.isDone) {
        return next;
      }
      next = next.next;
    }

    // Need to back out/up
    const parent = this.head.parent ?? null;
    if (parent === null || !parent.done) {
      return null;
    }
    // And try again from parent
    return parent.nextOrUp();
  }

  // Method is purely for debugging
  public get path(): string {
    return `${this.head.parent?.path ?? ''}/${this.name}`;
  }

  // Method is purely for debugging
  public get tree(): string {
    let result = '';
    let step: Step<T> | null = this.head;
    let parent: Step<T> | null = step.parent;
    let path = '';
    while (parent !== null) {
      path = `${parent.path}${path}`;
      parent = parent.head.parent;
    }
    do {
      result += `${path}/${step.name}\n`;
      if (step === this) {
        break;
      }
      step = step.next;
    } while (step !== null);
    return result;
  }

  // Method is purely for debugging
  public get report(): string {
    let result = `${this.path}\n`;
    result += this.child?.report ?? '';
    result += this.next?.report ?? '';
    return result;
  }
}
