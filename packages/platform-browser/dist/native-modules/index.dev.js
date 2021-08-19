import { Platform, TaskQueue } from '../../../platform/dist/native-modules/index.js';

const lookup = new Map();
function notImplemented(name) {
    return function notImplemented() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
    };
}
class BrowserPlatform extends Platform {
    constructor(g, overrides = {}) {
        super(g, overrides);
        /** @internal */ this._domReadRequested = false;
        /** @internal */ this._domReadHandle = -1;
        /** @internal */ this._domWriteRequested = false;
        /** @internal */ this._domWriteHandle = -1;
        ('Node,Element,HTMLElement,CustomEvent,CSSStyleSheet,ShadowRoot,MutationObserver,'
            + 'window,document,location,history,navigator,customElements')
            .split(',')
            .forEach(prop => {
            this[prop] = prop in overrides ? overrides[prop] : g[prop];
        });
        'fetch,requestAnimationFrame,cancelAnimationFrame'.split(',').forEach(prop => {
            var _a, _b;
            this[prop] = prop in overrides ? overrides[prop] : ((_b = (_a = g[prop]) === null || _a === void 0 ? void 0 : _a.bind(g)) !== null && _b !== void 0 ? _b : notImplemented(prop));
        });
        this.flushDomRead = this.flushDomRead.bind(this);
        this.flushDomWrite = this.flushDomWrite.bind(this);
        this.domReadQueue = new TaskQueue(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
        this.domWriteQueue = new TaskQueue(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
        /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
    }
    static getOrCreate(g, overrides = {}) {
        let platform = lookup.get(g);
        if (platform === void 0) {
            lookup.set(g, platform = new BrowserPlatform(g, overrides));
        }
        return platform;
    }
    static set(g, platform) {
        lookup.set(g, platform);
    }
    requestDomRead() {
        this._domReadRequested = true;
        // Yes, this is intentional: the timing of the read can only be "found" by doing a write first.
        // The flushDomWrite queues the read.
        // If/when requestPostAnimationFrame is implemented in browsers, we can use that instead.
        if (this._domWriteHandle === -1) {
            this._domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
        }
    }
    cancelDomRead() {
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
    flushDomRead() {
        this._domReadHandle = -1;
        if (this._domReadRequested === true) {
            this._domReadRequested = false;
            this.domReadQueue.flush();
        }
    }
    requestDomWrite() {
        this._domWriteRequested = true;
        if (this._domWriteHandle === -1) {
            this._domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
        }
    }
    cancelDomWrite() {
        this._domWriteRequested = false;
        if (this._domWriteHandle > -1 &&
            // if dom read is requested and there is no readHandle yet, we need the rAF to proceed regardless.
            // The domWriteRequested=false will prevent the read flush from happening.
            (this._domReadRequested === false || this._domReadHandle > -1)) {
            this.cancelAnimationFrame(this._domWriteHandle);
            this._domWriteHandle = -1;
        }
    }
    flushDomWrite() {
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

export { BrowserPlatform };
//# sourceMappingURL=index.dev.js.map
