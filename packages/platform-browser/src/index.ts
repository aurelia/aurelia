import { Platform } from '@aurelia/platform';

export class BrowserPlatform<TGlobal extends typeof globalThis = typeof globalThis> extends Platform<TGlobal> {
  /** @internal */
  private static readonly _lookup = new WeakMap<typeof globalThis, BrowserPlatform>();

  public static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(
    g: TGlobal,
    overrides: Partial<Exclude<BrowserPlatform, 'globalThis'>> = {},
  ): BrowserPlatform<TGlobal> {
    let platform = BrowserPlatform._lookup.get(g);
    if (platform === void 0) {
      BrowserPlatform._lookup.set(g, platform = new BrowserPlatform(g, overrides));
    }
    return platform as BrowserPlatform<TGlobal>;
  }

  public static set(g: typeof globalThis, platform: BrowserPlatform): void {
    BrowserPlatform._lookup.set(g, platform);
  }

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
  public readonly domQueue: DOMQueue;

  /**
   * @deprecated Use `platform.domQueue` instead.
   */
  public get domWriteQueue() {
    if (__DEV__) {
      this.console.log('[DEV:aurelia] platform.domQueue is deprecated, please use platform.domQueue instead.');
    }
    return this.domQueue;
  }

  /**
   * @deprecated Use `platform.domQueue` instead.
   */
  public get domReadQueue() {
    if (__DEV__) {
      this.console.log('[DEV:aurelia] platform.domReadQueue has been removed, please use platform.domQueue instead.');
    }
    return this.domQueue;
  }

  public constructor(g: TGlobal, overrides: Partial<Exclude<BrowserPlatform, 'globalThis'>> = {}) {
    super(g, overrides);

    const notImplemented = (name: string) => () => {
      // TODO: link to docs describing how to fix this issue
      throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`);
    };

    ('Node Element HTMLElement CustomEvent CSSStyleSheet ShadowRoot MutationObserver '
      + 'window document customElements')
      .split(' ')
      // eslint-disable-next-line
      .forEach(prop => (this as any)[prop] = prop in overrides ? (overrides as any)[prop] : (g as any)[prop]);

    'fetch requestAnimationFrame cancelAnimationFrame'.split(' ').forEach(prop =>
      // eslint-disable-next-line
      (this as any)[prop] = prop in overrides ? (overrides as any)[prop] : ((g as any)[prop]?.bind(g) ?? notImplemented(prop))
    );

    this.domQueue = new DOMQueue(this);
  }
}

export class DOMQueue {
  /** @internal */
  public _readQueue: DOMTask[] = [];

  /** @internal */
  public _writeQueue: DOMTask[] = [];

  /** @internal */
  public _flushRequested: boolean = false;

  /** @internal */
  private _yieldPromise: Promise<void> | undefined = void 0;

  /** @internal */
  private _resolve: (() => void) | undefined = void 0;

  /** @internal */
  private _handle: number = -1;

  /** @internal */
  private readonly _now: () => number;

  public get isEmpty(): boolean {
    return (
      this._readQueue.length === 0 &&
      this._writeQueue.length === 0
    );
  }

  public constructor(
    public readonly platform: Platform,
  ) {
    this._now = platform.performanceNow;
  }

  public flush(delta: number = this._now()): void {
    const readQueue = this._readQueue.splice(0);
    for (const task of readQueue) {
      task.run(delta);
    }

    const writeQueue = this._writeQueue.splice(0);
    for (const task of writeQueue) {
      task.run(delta);
    }

    if (this._readQueue.length > 0 || this._writeQueue.length > 0) {
      this._requestFlush();
    }

    if (this._resolve !== void 0) {
      this._resolve();
      this._resolve = void 0;
      this._yieldPromise = void 0;
    }
  }

  public cancel(): void {
    if (this._flushRequested) {
      if (this._handle > -1) {
        this.platform.globalThis.cancelAnimationFrame(this._handle);
        this._handle = -1;
      }
      this._flushRequested = false;
    }
  }

  public async yield(): Promise<void> {
    if (!this.isEmpty) {
      if (this._yieldPromise === void 0) {
        this._yieldPromise = new Promise(resolve => this._resolve = resolve);
      }

      await this._yieldPromise;
    }
  }

  public queueRead(callback: FrameRequestCallback) {
    const task = new DOMTask(this, callback);
    this._readQueue.push(task);
    this._requestFlush();
    return task;
  }

  public queueWrite(callback: FrameRequestCallback) {
    const task = new DOMTask(this, callback);
    this._writeQueue.push(task);
    this._requestFlush();
    return task;
  }

  public queueTask(callback: FrameRequestCallback) {
    return this.queueWrite(callback);
  }

  public remove(task: DOMTask): void {
    let idx = this._readQueue.indexOf(task);
    if (idx > -1) {
      this._readQueue.splice(idx, 1);
      return;
    }
    idx = this._writeQueue.indexOf(task);
    if (idx > -1) {
      this._writeQueue.splice(idx, 1);
      return;
    }
  }

  /** @internal */
  private readonly _requestFlush: () => void = () => {
    if (!this._flushRequested) {
      this._flushRequested = true;
      if (this._handle === -1) {
        this._handle = this.platform.globalThis.requestAnimationFrame(delta => {
          this._handle = -1;
          if (this._flushRequested) {
            this._flushRequested = false;
            this.flush(delta);
          }
        });
      }
    }
  };
}

export class DOMTask {
  public constructor(
    /* @internal */
    private _domQueue: DOMQueue,
    public callback: FrameRequestCallback,
  ) {}

  public run(time: number) {
    this.callback(time);
    this._dispose();
  }

  public cancel() {
    const domQueue = this._domQueue;
    domQueue.remove(this);

    if (domQueue.isEmpty) {
      domQueue.cancel();
    }

    this._dispose();
  }

  /* @internal */
  private _dispose() {
    this._domQueue = (void 0)!;
    this.callback = (void 0)!;
  }
}

export const reportDOMQueue = (domQueue: DOMQueue) => {
  const readQueue = domQueue._readQueue;
  const writeQueue = domQueue._writeQueue;
  const flushReq = domQueue._flushRequested;

  return { readQueue, writeQueue, flushRequested: flushReq };
};

export const ensureDOMQueueEmpty = (domQueue: DOMQueue) => {
  domQueue.flush();
  domQueue._readQueue.forEach(x => x.cancel());
  domQueue._writeQueue.forEach(x => x.cancel());
};
