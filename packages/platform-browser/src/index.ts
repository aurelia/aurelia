import { Platform } from '@aurelia/platform';

export class BrowserPlatform<TGlobal extends typeof globalThis = typeof globalThis> extends Platform<TGlobal> {
  public readonly Node: TGlobal['Node'];
  public readonly Element: TGlobal['Element'];
  public readonly HTMLElement: TGlobal['HTMLElement'];
  public readonly CustomEvent: TGlobal['CustomEvent'];
  public readonly CSSStyleSheet: TGlobal['CSSStyleSheet'];
  public readonly ShadowRoot: TGlobal['ShadowRoot'];

  public readonly window: TGlobal['window'];
  public readonly document: TGlobal['document'];
  public readonly location: TGlobal['location'];
  public readonly history: TGlobal['history'];
  public readonly navigator: TGlobal['navigator'];

  public readonly requestAnimationFrame: TGlobal['requestAnimationFrame'];

  public constructor(
    g: TGlobal,
    overrides: Partial<Exclude<BrowserPlatform, 'globalThis'>> = {},
  ) {
    super(g, overrides);

    /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
    this.Node = 'Node' in overrides ? overrides.Node! : g.Node;
    this.Element = 'Element' in overrides ? overrides.Element! : g.Element;
    this.HTMLElement = 'HTMLElement' in overrides ? overrides.HTMLElement! : g.HTMLElement;
    this.CustomEvent = 'CustomEvent' in overrides ? overrides.CustomEvent! : g.CustomEvent;
    this.CSSStyleSheet = 'CSSStyleSheet' in overrides ? overrides.CSSStyleSheet! : g.CSSStyleSheet;
    this.ShadowRoot = 'ShadowRoot' in overrides ? overrides.ShadowRoot! : g.ShadowRoot;

    this.window = 'window' in overrides ? overrides.window! : g.window;
    this.document = 'document' in overrides ? overrides.document! : g.document;
    this.location = 'location' in overrides ? overrides.location! : g.location;
    this.history = 'history' in overrides ? overrides.history! : g.history;
    this.navigator = 'navigator' in overrides ? overrides.navigator! : g.navigator;

    this.requestAnimationFrame = 'requestAnimationFrame' in overrides ? overrides.requestAnimationFrame! : g.requestAnimationFrame;
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
  }
}

