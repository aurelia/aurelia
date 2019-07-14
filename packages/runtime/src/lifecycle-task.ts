
export type PromiseOrTask = Promise<unknown> | ILifecycleTask;
export type MaybePromiseOrTask = void | PromiseOrTask;

export const LifecycleTask = {
  done: {
    done: true,
    canCancel(): boolean { return false; },
    cancel(): void { return; },
    wait(): Promise<unknown> { return Promise.resolve(); }
  }
};

export interface ILifecycleTask<T = unknown> {
  readonly done: boolean;
  canCancel(): boolean;
  cancel(): void;
  wait(): Promise<T>;
}

export class PromiseTask<TArgs extends unknown[], T = void> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    promise: Promise<T>,
    next: ((result?: T, ...args: TArgs) => MaybePromiseOrTask) | null,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.isCancelled = false;
    this.hasStarted = false;
    this.promise = promise.then(value => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      if (next !== null) {
        // @ts-ignore
        const nextResult = next.call(context, value, ...args);
        if (nextResult === void 0) {
          this.done = true;
        } else {
          const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
            ? nextResult as Promise<unknown>
            : (nextResult as ILifecycleTask).wait();
          return nextPromise.then(() => {
            this.done = true;
          });
        }
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class ContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    antecedent: Promise<unknown> | ILifecycleTask,
    next: (...args: TArgs) => MaybePromiseOrTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;

    const promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise = promise.then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args);
      if (nextResult === void 0) {
        this.done = true;
      } else {
        const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
          ? nextResult as Promise<unknown>
          : (nextResult as ILifecycleTask).wait();
        return nextPromise.then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class TerminalTask implements ILifecycleTask {
  public done: boolean;

  private readonly promise: Promise<unknown>;

  constructor(antecedent: Promise<unknown> | ILifecycleTask) {
    this.done = false;

    this.promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise.then(() => {
      this.done = true;
    }).catch(e => { throw e; });
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    antecedents: ILifecycleTask[],
    next: (...args: TArgs) => void | ILifecycleTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args) as undefined | ILifecycleTask;
      if (nextResult === void 0) {
        this.done = true;
      } else {
        return nextResult.wait().then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateTerminalTask implements ILifecycleTask {
  public done: boolean;

  private readonly promise: Promise<unknown>;

  constructor(antecedents: ILifecycleTask[]) {
    this.done = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      this.done = true;
    });
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask {
  return !(value === void 0 || (value as ILifecycleTask).done === true);
}
