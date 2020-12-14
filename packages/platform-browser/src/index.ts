import { Platform, TaskQueue } from '@aurelia/platform';

const lookup = new Map<object, BrowserPlatform>();

function notImplemented(name: string): (...args: any[]) => any {
  return function notImplemented() {
    throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
  };
}

export class BrowserPlatform<TGlobal extends typeof globalThis = typeof globalThis> extends Platform<TGlobal> {
  public readonly Node: TGlobal['Node'];
  public readonly Element: TGlobal['Element'];
  public readonly HTMLElement: TGlobal['HTMLElement'];
  public readonly CustomEvent: TGlobal['CustomEvent'];
  public readonly CSSStyleSheet: TGlobal['CSSStyleSheet'];
  public readonly ShadowRoot: TGlobal['ShadowRoot'];
  public readonly MutationObserver: TGlobal['MutationObserver'];

  public readonly window: TGlobal['window'];
  public readonly document: TGlobal['document'];
  public readonly location: TGlobal['location'];
  public readonly history: TGlobal['history'];
  public readonly navigator: TGlobal['navigator'];

  public readonly fetch!: TGlobal['window']['fetch'];
  public readonly requestAnimationFrame: TGlobal['requestAnimationFrame'];
  public readonly cancelAnimationFrame: TGlobal['cancelAnimationFrame'];
  public readonly customElements: TGlobal['customElements'];

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

    this.Node = 'Node' in overrides ? overrides.Node! : g.Node;
    this.Element = 'Element' in overrides ? overrides.Element! : g.Element;
    this.HTMLElement = 'HTMLElement' in overrides ? overrides.HTMLElement! : g.HTMLElement;
    this.CustomEvent = 'CustomEvent' in overrides ? overrides.CustomEvent! : g.CustomEvent;
    this.CSSStyleSheet = 'CSSStyleSheet' in overrides ? overrides.CSSStyleSheet! : g.CSSStyleSheet;
    this.ShadowRoot = 'ShadowRoot' in overrides ? overrides.ShadowRoot! : g.ShadowRoot;
    this.MutationObserver = 'MutationObserver' in overrides ? overrides.MutationObserver! : g.MutationObserver;

    this.window = 'window' in overrides ? overrides.window! : g.window;
    this.document = 'document' in overrides ? overrides.document! : g.document;
    this.location = 'location' in overrides ? overrides.location! : g.location;
    this.history = 'history' in overrides ? overrides.history! : g.history;
    this.navigator = 'navigator' in overrides ? overrides.navigator! : g.navigator;

    this.fetch = 'fetch' in overrides ? overrides.fetch! : g.fetch?.bind(g) ?? notImplemented('fetch');
    this.requestAnimationFrame = 'requestAnimationFrame' in overrides ? overrides.requestAnimationFrame! : g.requestAnimationFrame?.bind(g) ?? notImplemented('requestAnimationFrame');
    this.cancelAnimationFrame = 'cancelAnimationFrame' in overrides ? overrides.cancelAnimationFrame! : g.cancelAnimationFrame?.bind(g) ?? notImplemented('cancelAnimationFrame');
    this.customElements = 'customElements' in overrides ? overrides.customElements! : g.customElements;

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

  protected domReadRequested: boolean = false;
  protected domReadHandle: number = -1;
  protected requestDomRead(): void {
    this.domReadRequested = true;
    // Yes, this is intentional: the timing of the read can only be "found" by doing a write first.
    // The flushDomWrite queues the read.
    // If/when requestPostAnimationFrame is implemented in browsers, we can use that instead.
    if (this.domWriteHandle === -1) {
      this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
    }
  }
  protected cancelDomRead(): void {
    this.domReadRequested = false;
    if (this.domReadHandle > -1) {
      this.clearTimeout(this.domReadHandle);
      this.domReadHandle = -1;
    }
    if (this.domWriteRequested === false && this.domWriteHandle > -1) {
      this.cancelAnimationFrame(this.domWriteHandle);
      this.domWriteHandle = -1;
    }
  }
  protected flushDomRead(): void {
    this.domReadHandle = -1;
    if (this.domReadRequested === true) {
      this.domReadRequested = false;
      this.domReadQueue.flush();
    }
  }

  protected domWriteRequested: boolean = false;
  protected domWriteHandle: number = -1;
  protected requestDomWrite(): void {
    this.domWriteRequested = true;
    if (this.domWriteHandle === -1) {
      this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
    }
  }
  protected cancelDomWrite(): void {
    this.domWriteRequested = false;
    if (
      this.domWriteHandle > -1 &&
      // if dom read is requested and there is no readHandle yet, we need the rAF to proceed regardless.
      // The domWriteRequested=false will prevent the read flush from happening.
      (this.domReadRequested === false || this.domReadHandle > -1)
    ) {
      this.cancelAnimationFrame(this.domWriteHandle);
      this.domWriteHandle = -1;
    }
  }
  protected flushDomWrite(): void {
    this.domWriteHandle = -1;
    if (this.domWriteRequested === true) {
      this.domWriteRequested = false;
      this.domWriteQueue.flush();
    }
    if (this.domReadRequested === true && this.domReadHandle === -1) {
      this.domReadHandle = this.setTimeout(this.flushDomRead, 0);
    }
  }
}
