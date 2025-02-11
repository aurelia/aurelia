const tsPending = 'pending' as const;
const tsRunning = 'running' as const;
const tsCompleted = 'completed' as const;
const tsCanceled = 'canceled' as const;
export type TaskStatus = typeof tsPending | typeof tsRunning | typeof tsCompleted | typeof tsCanceled;
export type TaskCallback<T = any> = () => T;

const promise = Promise.resolve();
let currPromise: Promise<void> | null = null;

// eslint-disable-next-line @typescript-eslint/ban-types
const queue: (Task | Function)[] = [];
let pendingAsyncCount = 0;
let yieldPromise: ExposedPromise | undefined;

const requestFlush = () => {
  if (!currPromise) {
    currPromise = promise.then(flush);
  }
};

export const nextTick = () => {
  return currPromise ?? promise;
};

export const flush = () => {
  while (queue.length > 0) {
    const task = queue.shift()!;
    if (task instanceof Task) {
      task.run();
    } else {
      task();
    }
  }
  if (yieldPromise && queue.length === 0 && pendingAsyncCount === 0) {
    yieldPromise.resolve();
    yieldPromise = void 0;
  }
};

export const yieldTasks = async () => {
  if (queue.length === 0 && pendingAsyncCount === 0) {
    return;
  }
  if (!yieldPromise) {
    yieldPromise = createExposedPromise<void>();
  }
  return yieldPromise;
};

export const queueTask = <T = any>(callback: TaskCallback<T>) => {
  requestFlush();
  queue.push(callback);
};

export const queueAsyncTask = <T = any>(callback: TaskCallback<T>) => {
  requestFlush();
  const task = new Task<T>(callback);
  queue.push(task);
  return task;
};

export class TaskAbortError<T = any> extends Error {
  public constructor(public task: Task<T>) {
    super('Task was canceled.');
  }
}

let id = 0;
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

export interface ITask<T = any> {
  readonly result: Promise<UnwrapPromise<T>>;
  readonly status: TaskStatus;
  run(): void;
  cancel(): boolean;
}

export class Task<T = any> implements ITask {
  public readonly id: number = ++id;

  private _resolve: PResolve<UnwrapPromise<T>> | undefined = void 0;
  private _reject: PReject | undefined = void 0;
  private _result: Promise<UnwrapPromise<T>> | undefined = void 0;
  public get result(): Promise<UnwrapPromise<T>> {
    if (this._result === void 0) {
      switch (this._status) {
        case tsPending: {
          const promise = this._result = createExposedPromise<UnwrapPromise<T>>();
          this._resolve = promise.resolve;
          this._reject = promise.reject;
          return promise;
        }
        case tsRunning:
          throw createError('Trying to await task from within task will cause a deadlock.');
        case tsCompleted:
          return (this._result = Promise.resolve() as Promise<UnwrapPromise<T>>);
        case tsCanceled:
          return (this._result = Promise.reject(new TaskAbortError(this)));
      }
    }
    return this._result;
  }

  private _status: TaskStatus = tsPending;
  public get status(): TaskStatus {
    return this._status;
  }

  public constructor(
    public callback: TaskCallback<T>
  ) {}

  public run(): void {
    if (this._status !== tsPending) {
      throw createError(`Cannot run task in ${this._status} state`);
    }
    this._status = tsRunning;
    let ret: unknown;
    try {
      ret = this.callback();
    } catch (err) {
      this._status = tsCanceled;
      this.dispose();
      this._reject?.(err as TaskAbortError<T>);
      return;
    }
    if (ret instanceof Promise) {
      ++pendingAsyncCount;
      ret
        .then(result => {
          this._status = tsCompleted;
          this.dispose();
          if (this._resolve) this._resolve(result as UnwrapPromise<T>);
        })
        .catch(err => {
          this._status = tsCanceled;
          this.dispose();
          if (this._reject) this._reject(err);
        })
        .finally(() => {
          --pendingAsyncCount;
          if (yieldPromise && queue.length === 0 && pendingAsyncCount === 0) {
            yieldPromise.resolve();
            yieldPromise = void 0;
          }
        });
    } else {
      this._status = tsCompleted;
      this.dispose();
      if (this._resolve) {
        this._resolve(ret as UnwrapPromise<T>);
      }
    }
  }

  public cancel(): boolean {
    if (this._status === tsPending) {
      const idx = queue.indexOf(this);
      if (idx > -1) {
        queue.splice(idx, 1);
      }
      this._status = tsCanceled;
      this.dispose();
      if (this._reject) {
        this._reject(new TaskAbortError(this));
      }
      return true;
    }
    return false;
  }

  public dispose(): void {
    this.callback = (void 0)!;
    this._resolve = void 0;
    this._reject = void 0;
    this._result = void 0;
  }
}

type PResolve<T> = (value: T | PromiseLike<T>) => void;
type PReject<T = any> = (reason?: T) => void;

export type ExposedPromise<T = void> = Promise<T> & {
  resolve: PResolve<T>;
  reject: PReject;
};

const createExposedPromise = <T>(): ExposedPromise<T> => {
  let _resolve: PResolve<T>;
  let _reject: PReject;
  const promise = new Promise<T>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  }) as ExposedPromise<T>;
  promise.resolve = _resolve!;
  promise.reject = _reject!;
  return promise;
};

const createError = (msg: string) => new Error(msg);
