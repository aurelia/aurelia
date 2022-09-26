import { Platform, TaskQueue } from '@aurelia/platform';

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
  public readonly location!: TGlobal['location'];
  public readonly history!: TGlobal['history'];
  public readonly navigator!: TGlobal['navigator'];
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
  public readonly domWriteQueue: TaskQueue;
  public readonly domReadQueue: TaskQueue;

  public constructor(g: TGlobal, overrides: Partial<Exclude<BrowserPlatform, 'globalThis'>> = {}) {
    super(g, overrides);

    ('Node Element HTMLElement CustomEvent CSSStyleSheet ShadowRoot MutationObserver '
    + 'window document location history navigator customElements')
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
    this.domWriteQueue = new TaskQueue(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
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
