
/* eslint-disable @typescript-eslint/no-explicit-any */
const lookup = new Map<object, Platform>();

const createError = (msg: string) => new Error(msg);
const notImplemented = (name: string): (...args: any[]) => any => {
  return () => {
    throw __DEV__
      ? createError(`AUR1005: The PLATFORM did not receive a valid reference to the global function '${name}'.\n\nFor more information, see: https://docs.aurelia.io/developer-guides/error-messages/platform/aur1005`)
      : createError(`AUR1005:${name}`);
  };
};

export class Platform<TGlobal extends typeof globalThis = typeof globalThis> {
  // http://www.ecma-international.org/ecma-262/#sec-value-properties-of-the-global-object
  public readonly globalThis: TGlobal;

  // http://www.ecma-international.org/ecma-262/#sec-function-properties-of-the-global-object
  public readonly decodeURI!: TGlobal['decodeURI'];
  public readonly decodeURIComponent!: TGlobal['decodeURIComponent'];
  public readonly encodeURI!: TGlobal['encodeURI'];
  public readonly encodeURIComponent!: TGlobal['encodeURIComponent'];

  // http://www.ecma-international.org/ecma-262/#sec-constructor-properties-of-the-global-object
  public readonly Date!: TGlobal['Date'];

  // http://www.ecma-international.org/ecma-262/#sec-other-properties-of-the-global-object
  public readonly Reflect!: TGlobal['Reflect'];

  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope
  // Note: we're essentially assuming that all of these are available, even if we aren't even
  // in a browser environment. They are available in major envs as well (NodeJS, NativeScript, etc),
  // or can otherwise be mocked fairly easily. If not, things probably won't work anyway.
  public readonly clearInterval!: TGlobal['clearInterval'];
  public readonly clearTimeout!: TGlobal['clearTimeout'];
  public readonly queueMicrotask!: TGlobal['queueMicrotask'];
  public readonly setInterval!: TGlobal['setInterval'];
  public readonly setTimeout!: TGlobal['setTimeout'];
  public readonly console!: TGlobal['console'];

  public readonly performanceNow: () => number;

  public constructor(g: TGlobal, overrides: Partial<Exclude<Platform, 'globalThis'>> = {}) {
    this.globalThis = g;
    'decodeURI decodeURIComponent encodeURI encodeURIComponent Date Reflect console'.split(' ').forEach(prop => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (this as any)[prop] = prop in overrides ? overrides[prop as keyof typeof overrides] : g[prop as keyof typeof g];
    });

    'clearInterval clearTimeout queueMicrotask setInterval setTimeout'.split(' ').forEach(method => {
      // eslint-disable-next-line
      (this as any)[method] = method in overrides ? overrides[method as keyof typeof overrides] : (g as any)[method]?.bind(g) ?? notImplemented(method);
    });

    this.performanceNow = 'performanceNow' in overrides ? overrides.performanceNow! : g.performance?.now?.bind(g.performance) ?? notImplemented('performance.now');
  }

  public static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(
    g: TGlobal,
    overrides: Partial<Exclude<Platform, 'globalThis'>> = {},
  ): Platform<TGlobal> {
    let platform = lookup.get(g);
    if (platform === void 0) {
      lookup.set(g, platform = new Platform(g, overrides));
    }
    return platform as Platform<TGlobal>;
  }

  public static set(g: typeof globalThis, platform: Platform): void {
    lookup.set(g, platform);
  }
}
