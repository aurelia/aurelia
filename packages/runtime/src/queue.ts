/* eslint-disable @typescript-eslint/no-explicit-any */
const tsPending = 'pending';
const tsRunning = 'running';
const tsCompleted = 'completed';
const tsCanceled = 'canceled';
export type TaskStatus = typeof tsPending | typeof tsRunning | typeof tsCompleted | typeof tsCanceled;
export type TaskCallback<T = any> = () => T;

const resolvedPromise = Promise.resolve();
let runScheduled = false;
let isAutoRun = false;

// eslint-disable-next-line @typescript-eslint/ban-types
const queue: (Task | Function)[] = [];
let pendingAsyncCount = 0;
let settlePromise: Promise<void> | null = null;
let taskErrors: unknown[] = [];
let settlePromiseResolve: (() => void) | null = null;
let settlePromiseReject: ((reason?: any) => void) | null = null;

Reflect.set(globalThis, '__au_queue__', {
  get queue() { return queue; },
  get pendingAsyncCount() { return pendingAsyncCount; },
  get runScheduled() { return runScheduled; },
  get settlePromise() { return settlePromise; },
  get taskErrors() { return taskErrors; },
});

const requestRun = () => {
  if (!runScheduled) {
    runScheduled = true;
    void resolvedPromise.then(() => {
      runScheduled = false;
      isAutoRun = true;
      runTasks();
    });
  }
};

const signalSettled = () => {
  if (settlePromise && queue.length === 0 && pendingAsyncCount === 0) {
    settlePromise = null;
    if (taskErrors.length > 0) {
      const errors = taskErrors;
      taskErrors = [];
      if (errors.length === 1) {
        settlePromiseReject!(errors[0]);
      } else {
        settlePromiseReject!(new AggregateError(errors, 'One or more tasks failed.'));
      }
    } else {
      settlePromiseResolve!();
    }
  }
};

export const runTasks = () => {
  const isManualRun = !isAutoRun;
  isAutoRun = false;
  settlePromise ??= new Promise<void>((resolve, reject) => {
    settlePromiseResolve = resolve;
    settlePromiseReject = reject;
  });

  while (queue.length > 0) {
    const task = queue.shift()!;
    if (task instanceof Task) {
      task.run();
    } else {
      try {
        task();
      } catch (err) {
        taskErrors.push(err);
      }
    }
  }
  // Make a copy; this is for testing, signalSettled will clear the array
  const errors = taskErrors.slice();
  signalSettled();
  if (isManualRun && errors.length > 0) {
    if (errors.length === 1) {
      throw errors[0];
    } else {
      throw new AggregateError(errors, 'One or more tasks failed.');
    }
  }
};

export const tasksSettled = async () => {
  if (queue.length > 0 || pendingAsyncCount > 0) {
    return settlePromise ??= new Promise<void>((resolve, reject) => {
      settlePromiseResolve = resolve;
      settlePromiseReject = reject;
    });
  }
  // Not strictly necessary but without this we need a lot of extra `await Promise.resolve()` in test code
  await resolvedPromise;
  if (queue.length > 0 || pendingAsyncCount > 0) {
    return settlePromise ??= new Promise<void>((resolve, reject) => {
      settlePromiseResolve = resolve;
      settlePromiseReject = reject;
    });
  }
};

export const queueTask = <T = any>(callback: TaskCallback<T>) => {
  requestRun();
  queue.push(callback);
};

export const queueAsyncTask = <T = any>(callback: TaskCallback<T>) => {
  requestRun();
  const task = new Task<T>(callback);
  queue.push(task);
  return task;
};

export class TaskAbortError<T = any> extends Error {
  public constructor(public task: Task<T>) {
    super(`Task ${task.id} was canceled.`);
  }
}

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
let id = 0;

export class Task<T = any> {
  public readonly id: number = ++id;

  /** @internal */
  private _resolve!: (value: UnwrapPromise<T>) => void;
  /** @internal */
  private _reject!: (reason?: any) => void;

  /** @internal */
  private readonly _result: Promise<UnwrapPromise<T>>;
  public get result(): Promise<UnwrapPromise<T>> {
    return this._result;
  }

  /** @internal */
  private _status: TaskStatus = tsPending;
  public get status(): TaskStatus {
    return this._status;
  }

  public constructor(public callback: TaskCallback<T>) {
    this._result = new Promise<UnwrapPromise<T>>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /** @internal */
  public run(): void {
    if (this._status !== tsPending) {
      throw new Error(`Cannot run task in ${this._status} state`);
    }
    this._status = tsRunning;
    let ret: unknown;
    try {
      ret = this.callback();
    } catch (err) {
      this._status = tsCanceled;
      this._reject(err);
      taskErrors.push(err);
      return;
    }

    if (ret instanceof Promise) {
      ++pendingAsyncCount;
      ret.then(result => {
        this._status = tsCompleted;
        this._resolve(result);
      }).catch(err => {
        this._status = tsCanceled;
        this._reject(err);
        taskErrors.push(err);
      }).finally(() => {
        --pendingAsyncCount;
        signalSettled();
      });
    } else {
      this._status = tsCompleted;
      this._resolve(ret as UnwrapPromise<T>);
    }
  }

  public cancel(): boolean {
    if (this._status === tsPending) {
      const idx = queue.indexOf(this);
      if (idx > -1) {
        queue.splice(idx, 1);
      }
      this._status = tsCanceled;
      this._reject(new TaskAbortError(this));
      signalSettled();
      return true;
    }
    return false;
  }
}
