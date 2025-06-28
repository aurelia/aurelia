import { Platform, TaskQueue } from '../../../platform/dist/native-modules/index.mjs';

class BrowserPlatform extends Platform {
    static getOrCreate(g, overrides = {}) {
        let platform = BrowserPlatform._lookup.get(g);
        if (platform === void 0) {
            BrowserPlatform._lookup.set(g, platform = new BrowserPlatform(g, overrides));
        }
        return platform;
    }
    static set(g, platform) {
        BrowserPlatform._lookup.set(g, platform);
    }
    /**
     * @deprecated Use `platform.domQueue` instead.
     */
    get domWriteQueue() {
        {
            this.console.log('[DEV:aurelia] platform.domQueue is deprecated, please use platform.domQueue instead.');
        }
        return this.domQueue;
    }
    /**
     * @deprecated Use `platform.domQueue` instead.
     */
    get domReadQueue() {
        {
            this.console.log('[DEV:aurelia] platform.domReadQueue has been removed, please use platform.domQueue instead.');
        }
        return this.domQueue;
    }
    constructor(g, overrides = {}) {
        super(g, overrides);
        const notImplemented = (name) => () => {
            // TODO: link to docs describing how to fix this issue
            throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`);
        };
        ('Node Element HTMLElement CustomEvent CSSStyleSheet ShadowRoot MutationObserver '
            + 'window document customElements')
            .split(' ')
            // eslint-disable-next-line
            .forEach(prop => this[prop] = prop in overrides ? overrides[prop] : g[prop]);
        'fetch requestAnimationFrame cancelAnimationFrame'.split(' ').forEach(prop => 
        // eslint-disable-next-line
        this[prop] = prop in overrides ? overrides[prop] : (g[prop]?.bind(g) ?? notImplemented(prop)));
        this.domQueue = (() => {
            let domRequested = false;
            let domHandle = -1;
            const requestDomFlush = () => {
                domRequested = true;
                if (domHandle === -1) {
                    domHandle = this.requestAnimationFrame(flushDomQueue);
                }
            };
            const cancelDomFlush = () => {
                domRequested = false;
                if (domHandle > -1) {
                    this.cancelAnimationFrame(domHandle);
                    domHandle = -1;
                }
            };
            const flushDomQueue = () => {
                domHandle = -1;
                if (domRequested === true) {
                    domRequested = false;
                    domQueue.flush();
                }
            };
            const domQueue = new TaskQueue(this, requestDomFlush, cancelDomFlush);
            return domQueue;
        })();
    }
}
/** @internal */
BrowserPlatform._lookup = new WeakMap();

export { BrowserPlatform };
//# sourceMappingURL=index.dev.mjs.map
