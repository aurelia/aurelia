import { ITask, Platform, TaskStatus, TaskAbortError, TaskQueue, UnwrapPromise } from '@aurelia/platform';

const lookup = new Map<object, BrowserPlatform>();

export class BrowserPlatform<TGlobal extends typeof globalThis = typeof globalThis> extends Platform<TGlobal> {
  public readonly Node!: TGlobal['Node'];
  public readonly Element!: TGlobal['Element'];
  public readonly HTMLElement!: TGlobal['HTMLElement'];
  public readonly CustomEvent!: TGlobal['CustomEvent'];
  public readonly CSSStyleSheet!: TGlobal['CSSStyleSheet'];
  public readonly ShadowRoot!: TGlobal['ShadowRoot'];
  public readonly MutationObserver!: TGlobal['MutationObserver'];

  public readonly window!: TGlobal['window'];
  public readonly document!: TGlobal['document'];
  public readonly customElements!: TGlobal['customElements'];

  public readonly fetch!: TGlobal['window']['fetch'];
  public readonly requestAnimationFrame!: TGlobal['requestAnimationFrame'];
  public readonly cancelAnimationFrame!: TGlobal['cancelAnimationFrame'];

  // In environments with nodejs types, the node globalThis for some reason overwrites that of the DOM, changing the signature
  // of setTimeout etc to those of node.
  // So, re-declaring these based on the Window type to ensure they have the DOM-based signature.
  public readonly clearInterval!: TGlobal['window']['clearInterval'];
  public readonly clearTimeout!: TGlobal['window']['clearTimeout'];
  public readonly setInterval!: TGlobal['window']['setInterval'];
  public readonly setTimeout!: TGlobal['window']['setTimeout'];
  // public readonly domWriteQueue: TaskQueue;
  public readonly domReadQueue: TaskQueue;
  public readonly domQueue = new DomQueue(this);
  public readonly domWriteQueue = this.domQueue;

  public constructor(g: TGlobal, overrides: Partial<Exclude<BrowserPlatform, 'globalThis'>> = {}) {
    super(g, overrides);

    ('Node Element HTMLElement CustomEvent CSSStyleSheet ShadowRoot MutationObserver '
    + 'window document customElements')
      .split(' ')
      // eslint-disable-next-line
      .forEach(prop => (this as any)[prop] = prop in overrides ? (overrides as any)[prop] : (g as any)[prop]);

    'fetch requestAnimationFrame cancelAnimationFrame'.split(' ').forEach(prop =>
      // eslint-disable-next-line
      (this as any)[prop] = prop in overrides ? (overrides as any)[prop] : ((g as any)[prop]?.bind(g) ?? notImplemented(prop))
    );

    this.flushDomRead = this.flushDomRead.bind(this);
    this.flushDomWrite = this.flushDomWrite.bind(this);
    this.domReadQueue = new TaskQueue(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
    // this.domWriteQueue = new TaskQueue(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
  }

  public static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(
    g: TGlobal,
    overrides: Partial<Exclude<BrowserPlatform, 'globalThis'>> = {},
  ): BrowserPlatform<TGlobal> {
    let platform = lookup.get(g);
    if (platform === void 0) {
      lookup.set(g, platform = new BrowserPlatform(g, overrides));
    }
    return platform as BrowserPlatform<TGlobal>;
  }

  public static set(g: typeof globalThis, platform: BrowserPlatform): void {
    lookup.set(g, platform);
  }

  /** @internal */ private _domReadRequested: boolean = false;
  /** @internal */ private _domReadHandle: number = -1;
  protected requestDomRead(): void {
    this._domReadRequested = true;
    // Yes, this is intentional: the timing of the read can only be "found" by doing a write first.
    // The flushDomWrite queues the read.
    // If/when requestPostAnimationFrame is implemented in browsers, we can use that instead.
    if (this._domWriteHandle === -1) {
      this._domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
    }
  }
  protected cancelDomRead(): void {
    this._domReadRequested = false;
    if (this._domReadHandle > -1) {
      this.clearTimeout(this._domReadHandle);
      this._domReadHandle = -1;
    }
    if (this._domWriteRequested === false && this._domWriteHandle > -1) {
      this.cancelAnimationFrame(this._domWriteHandle);
      this._domWriteHandle = -1;
    }
  }
  protected flushDomRead(): void {
    this._domReadHandle = -1;
    if (this._domReadRequested === true) {
      this._domReadRequested = false;
      this.domReadQueue.flush();
    }
  }

  /** @internal */ private _domWriteRequested: boolean = false;
  /** @internal */ private _domWriteHandle: number = -1;
  protected requestDomWrite(): void {
    this._domWriteRequested = true;
    if (this._domWriteHandle === -1) {
      this._domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
    }
  }
  protected cancelDomWrite(): void {
    this._domWriteRequested = false;
    if (
      this._domWriteHandle > -1 &&
      // if dom read is requested and there is no readHandle yet, we need the rAF to proceed regardless.
      // The domWriteRequested=false will prevent the read flush from happening.
      (this._domReadRequested === false || this._domReadHandle > -1)
    ) {
      this.cancelAnimationFrame(this._domWriteHandle);
      this._domWriteHandle = -1;
    }
  }
  protected flushDomWrite(): void {
    this._domWriteHandle = -1;
    if (this._domWriteRequested === true) {
      this._domWriteRequested = false;
      this.domWriteQueue.flush();
    }
    if (this._domReadRequested === true && this._domReadHandle === -1) {
      this._domReadHandle = this.setTimeout(this.flushDomRead, 0);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notImplemented = (name: string): (...args: any[]) => any => {
  return () => {
    throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
  };
};
const runTask = function (this: number, task: DomTask) { task.run(this); };

export class DomQueue {
  /** @internal */ private readonly p: BrowserPlatform;

  /** @internal */ private _domRunRequested: boolean = false;
  /** @internal */ private _domRunHandle: number = -1;
  /** @internal */ private _yieldPromise: ExposedPromise | undefined = void 0;

  public constructor(
    p: BrowserPlatform
  ) {
    this.p = p;
  }

  /** @internal */
  protected _requestDomRun(): void {
    this._domRunRequested = true;
    if (this._domRunHandle === -1) {
      this._domRunHandle = this.p.requestAnimationFrame(() => this._flushDomQueue());
    }
  }

  /** @internal */
  protected _cancelDomRun(): void {
    this._domRunRequested = false;
    if (this._domRunHandle !== -1) {
      this.p.cancelAnimationFrame(this._domRunHandle);
      this._domRunHandle = -1;
    }
  }

  /** @internal */
  protected _flushDomQueue(): void {
    this._domRunHandle = -1;
    if (this._domRunRequested) {
      this._domRunRequested = false;
      const runningQueues = this._queues.move();
      const now = this.p.performanceNow();
      runningQueues._read.forEach(runTask, now);
      runningQueues._write.forEach(runTask, now);
      // cannot consider the queue empty if there' new tasks queued while running
      console.log('has more work?', this._domRunRequested);
      if (!this._domRunRequested) {
        this._yieldPromise?.resolve();
        this._yieldPromise = void 0;
      }
    }
  }

  /** @internal */
  private readonly _queues = new CbQueue();

  public queueRead<T>(cb: () => T): DomTask<T> {
    this._requestDomRun();
    return this._queues._read[this._queues._read.length] = new DomTask<T>(this, /* read */1, cb);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public queueWrite(cb: () => any): DomTask {
    this._requestDomRun();
    // console.log('queueing', String(cb));
    return this._queues._write[this._queues._write.length] = new DomTask(this, /* write */2, cb);
  }

  public queueTask(cb: any) {
    return this.queueWrite(cb);
  }

  public flush() {
    this._flushDomQueue();
  }

  public async yield() {
    await (this._yieldPromise ??= createExposedPromise());
  }

  public remove(task: DomTask): void {
    const queues = this._queues;
    const group = task.type === /* read */1 ? queues._read : queues._write;
    const idx = group.indexOf(task);
    if (idx !== -1) {
      group.splice(idx, 1);
    }
    if (this._queues._read.length === 0 && this._queues._write.length === 0) {
      this._cancelDomRun();
    }
  }

  public count() {
    return [this._queues._read.length, this._queues._write.length];
  }
}

class CbQueue {
  public constructor(
    public readonly _read: DomTask[] = [],
    public readonly _write: DomTask[] = [],
  ) {}

  public move(): CbQueue {
    const newHolder = new CbQueue(this._write.slice(0), this._read.slice(0));
    this._write.length = this._read.length = 0;
    return newHolder;
  }
}

type PResolve<T = unknown> = (value: T | PromiseLike<T>) => void;
type PReject<T = unknown> = (reason?: T) => void;
let $resolve: PResolve;
let $reject: PReject;
const executor = <T>(resolve: PResolve<T>, reject: PReject): void => {
  $resolve = resolve as PResolve;
  $reject = reject;
};

type ExposedPromise<T = void> = Promise<T> & {
  resolve: PResolve<T>;
  reject: PReject;
};

/**
 * Efficiently create a promise where the `resolve` and `reject` functions are stored as properties on the prommise itself.
 */
const createExposedPromise = <T>(): ExposedPromise<T> => {
  const p = new Promise<T>(executor) as ExposedPromise<T>;
  p.resolve = $resolve;
  p.reject = $reject;
  $resolve = $reject = (void 0)!;
  return p;
};

const tsPending = 'pending';
const tsRunning = 'running';
const tsCompleted = 'completed';
const tsCanceled = 'canceled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DomTask<T = any> implements ITask<T> {
  public static id = 0;
  public readonly id: number = ++DomTask.id;

  /** @internal */ private _resolve: PResolve<UnwrapPromise<T>> | undefined = void 0;
  /** @internal */ private _reject: PReject<TaskAbortError<T>> | undefined = void 0;

  /** @internal */
  private _result: Promise<UnwrapPromise<T>> | undefined = void 0;
  public get result(): Promise<UnwrapPromise<T>> {
    const result = this._result;
    if (result === void 0) {
      switch (this._status) {
        case tsPending: {
          const promise = this._result = createExposedPromise();
          this._resolve = promise.resolve;
          this._reject = promise.reject;
          return promise;
        }
        /* istanbul ignore next */
        case tsRunning:
          throw new Error('Trying to await task from within task will cause a deadlock.');
        case tsCompleted:
          return this._result = Promise.resolve<UnwrapPromise<T>>((void 0)!);
        case tsCanceled:
          return this._result = Promise.reject(new TaskAbortError(this));
      }
    }
    return result;
  }

  /** @internal */
  private _status: TaskStatus = tsPending;
  public get status(): TaskStatus {
    return this._status;
  }

  /** @internal */
  private readonly _domQueue: DomQueue;
  /**
   * 1 - read
   * 2 - write
   */
  public readonly type: /* Read */1 | /* Write */2;
  /** @internal */
  private _callback: (time: number) => T | Promise<T>;

  public constructor(
    domQueue: DomQueue,
    type: /* Read */1 | /* Write */2,
    callback: (time: number) => T | Promise<T>,
  ) {
    this._domQueue = domQueue;
    this.type = type;
    this._callback = callback;
  }

  public run(time?: number): void {
    if (this._status !== tsPending) {
      throw new Error(`Cannot run dom task in ${this._status} state`);
    }

    const callback = this._callback;
    const resolve = this._resolve;
    const reject = this._reject;
    let ret: unknown;

    this._status = tsRunning;

    try {
      ret = callback(time ?? 0);
      if (ret instanceof Promise) {
        ret.then($ret => {
          this._status = tsCompleted;

          this.dispose();

          if (resolve !== void 0) {
            resolve($ret);
          }
        })
        .catch((err: TaskAbortError<T>) => {
          this.dispose();
          if (reject !== void 0) {
            reject(err);
          } else {
            throw err;
          }
        });
      } else {
        this._status = tsCompleted;

        this.dispose();

        if (resolve !== void 0) {
          resolve(ret as UnwrapPromise<T>);
        }

      }
    } catch (err) {
      this.dispose();

      if (reject !== void 0) {
        reject(err as TaskAbortError<T>);
      } else {
        throw err;
      }
    }
  }

  public cancel(): boolean {
    const taskQueue = this._domQueue;
    if (this._status === tsPending) {
      const reject = this._reject;

      taskQueue.remove(this as DomTask);

      // if (taskQueue.isEmpty) {
      //   taskQueue.cancel();
      // }

      this._status = tsCanceled;

      this.dispose();

      if (reject !== void 0) {
        reject(new TaskAbortError(this));
      }

      return true;
    } else if (this._status === tsRunning) {
      return true;
    }

    return false;
  }

  public dispose(): void {
    this._callback
      = this._resolve
      = this._reject
      = this._result
      = (void 0)!;
  }
}
