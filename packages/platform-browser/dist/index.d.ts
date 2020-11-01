import { Platform, TaskQueue } from '@aurelia/platform';
export declare class BrowserPlatform<TGlobal extends typeof globalThis = typeof globalThis> extends Platform<TGlobal> {
    readonly Node: TGlobal['Node'];
    readonly Element: TGlobal['Element'];
    readonly HTMLElement: TGlobal['HTMLElement'];
    readonly CustomEvent: TGlobal['CustomEvent'];
    readonly CSSStyleSheet: TGlobal['CSSStyleSheet'];
    readonly ShadowRoot: TGlobal['ShadowRoot'];
    readonly MutationObserver: TGlobal['MutationObserver'];
    readonly window: TGlobal['window'];
    readonly document: TGlobal['document'];
    readonly location: TGlobal['location'];
    readonly history: TGlobal['history'];
    readonly navigator: TGlobal['navigator'];
    readonly fetch: TGlobal['window']['fetch'];
    readonly requestAnimationFrame: TGlobal['requestAnimationFrame'];
    readonly cancelAnimationFrame: TGlobal['cancelAnimationFrame'];
    readonly customElements: TGlobal['customElements'];
    readonly clearInterval: TGlobal['window']['clearInterval'];
    readonly clearTimeout: TGlobal['window']['clearTimeout'];
    readonly setInterval: TGlobal['window']['setInterval'];
    readonly setTimeout: TGlobal['window']['setTimeout'];
    readonly domWriteQueue: TaskQueue;
    readonly domReadQueue: TaskQueue;
    constructor(g: TGlobal, overrides?: Partial<Exclude<BrowserPlatform, 'globalThis'>>);
    static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(g: TGlobal, overrides?: Partial<Exclude<BrowserPlatform, 'globalThis'>>): BrowserPlatform<TGlobal>;
    static set(g: typeof globalThis, platform: BrowserPlatform): void;
    protected domReadRequested: boolean;
    protected domReadHandle: number;
    protected requestDomRead(): void;
    protected cancelDomRead(): void;
    protected flushDomRead(): void;
    protected domWriteRequested: boolean;
    protected domWriteHandle: number;
    protected requestDomWrite(): void;
    protected cancelDomWrite(): void;
    protected flushDomWrite(): void;
}
//# sourceMappingURL=index.d.ts.map