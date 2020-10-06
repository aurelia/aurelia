// Limit the accessible properties to that of the native ES globalThis and WindowOrWorkerGlobalScope by default.
// We need the whole DOM lib to have access to the WindowOrWorkerGlobalScope type, but that turns globalThis into a union with Window
// which exposes properties we don't want to assume exist here.
// Hence, we create a synthetic type that has only the properties we can more or less safely assume to exist.
type GlobalThisOrWindowOrWorkerGlobalScope = Pick<
  typeof globalThis,
  Exclude<
    keyof typeof globalThis,
    Exclude<
      keyof Window,
      keyof WindowOrWorkerGlobalScope
    >
  >
>;

export class Platform<TGlobal extends GlobalThisOrWindowOrWorkerGlobalScope = GlobalThisOrWindowOrWorkerGlobalScope> {
  // http://www.ecma-international.org/ecma-262/#sec-value-properties-of-the-global-object
  public readonly globalThis: TGlobal;

  // http://www.ecma-international.org/ecma-262/#sec-function-properties-of-the-global-object
  public readonly decodeURI: TGlobal['decodeURI'];
  public readonly decodeURIComponent: TGlobal['decodeURIComponent'];
  public readonly encodeURI: TGlobal['encodeURI'];
  public readonly encodeURIComponent: TGlobal['encodeURIComponent'];

  // http://www.ecma-international.org/ecma-262/#sec-constructor-properties-of-the-global-object
  public readonly Date: TGlobal['Date'];

  // http://www.ecma-international.org/ecma-262/#sec-other-properties-of-the-global-object
  public readonly Reflect: TGlobal['Reflect'];

  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope
  // Note: we're essentially assuming that all of these are available, even if we aren't even
  // in a browser environment. They are available in major envs as well (NodeJS, NativeScript, etc),
  // or can otherwise be mocked fairly easily. If not, things probably won't work anyway.
  public readonly clearInterval: TGlobal['clearInterval'];
  public readonly clearTimeout: TGlobal['clearTimeout'];
  public readonly fetch: TGlobal['fetch'];
  public readonly queueMicrotask: TGlobal['queueMicrotask'];
  public readonly setInterval: TGlobal['setInterval'];
  public readonly setTimeout: TGlobal['setTimeout'];
  public readonly console: TGlobal['console'];

  public constructor(
    g: TGlobal,
    overrides: Partial<Exclude<Platform, 'globalThis'>> = {},
  ) {
    this.globalThis = g;
    /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
    this.decodeURI = 'decodeURI' in overrides ? overrides.decodeURI! : g.decodeURI;
    this.decodeURIComponent = 'decodeURIComponent' in overrides ? overrides.decodeURIComponent! : g.decodeURIComponent;
    this.encodeURI = 'encodeURI' in overrides ? overrides.encodeURI! : g.encodeURI;
    this.encodeURIComponent = 'encodeURIComponent' in overrides ? overrides.encodeURIComponent! : g.encodeURIComponent;

    this.Date = 'Date' in overrides ? overrides.Date! : g.Date;

    this.Reflect = 'Reflect' in overrides ? overrides.Reflect! : g.Reflect;

    this.clearInterval = 'clearInterval' in overrides ? overrides.clearInterval! : g.clearInterval;
    this.clearTimeout = 'clearTimeout' in overrides ? overrides.clearTimeout! : g.clearTimeout;
    this.fetch = 'fetch' in overrides ? overrides.fetch! : g.fetch;
    this.queueMicrotask = 'queueMicrotask' in overrides ? overrides.queueMicrotask! : g.queueMicrotask;
    this.setInterval = 'setInterval' in overrides ? overrides.setInterval! : g.setInterval;
    this.setTimeout = 'setTimeout' in overrides ? overrides.setTimeout! : g.setTimeout;
    this.console = 'console' in overrides ? overrides.console! : g.console;
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
  }
}

