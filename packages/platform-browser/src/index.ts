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
  private readonly _readQueue: DOMTask[] = [];

  /** @internal */
  private readonly _writeQueue: DOMTask[] = [];

  /** @internal */
  private readonly _now: () => number;

  public constructor(
    public readonly platform: Platform,
  ) {
    this._now = platform.performanceNow;
  }

  public queueRead(callback: FrameRequestCallback) {
    const task = new DOMTask(callback);
    this._readQueue.push(task);
    return task;
  }

  public queueWrite(callback: FrameRequestCallback) {
    const task = new DOMTask(callback);
    this._writeQueue.push(task);
    return task;
  }

  public flush(time: number = this._now()) {
    const readQueue = this._readQueue.splice(0);
    const writeQueue = this._writeQueue.splice(0);

    for (const task of readQueue) {
      task.run(time);
    }
    for (const task of writeQueue) {
      task.run(time);
    }
  }
}

export class DOMTask {
  private _cancelled: boolean = false;

  public constructor(
    public callback: FrameRequestCallback,
  ) {}

  public run(time: number) {
    if (this._cancelled) return;

    const callback = this.callback;
    callback(time);
  }

  public cancel() {
    this._cancelled = true;
  }
}
