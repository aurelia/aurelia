"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserPlatform = void 0;
const platform_1 = require("@aurelia/platform");
const lookup = new Map();
function notImplemented(name) {
    return function notImplemented() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
    };
}
class BrowserPlatform extends platform_1.Platform {
    constructor(g, overrides = {}) {
        super(g, overrides);
        this.domReadRequested = false;
        this.domReadHandle = -1;
        this.domWriteRequested = false;
        this.domWriteHandle = -1;
        this.Node = 'Node' in overrides ? overrides.Node : g.Node;
        this.Element = 'Element' in overrides ? overrides.Element : g.Element;
        this.HTMLElement = 'HTMLElement' in overrides ? overrides.HTMLElement : g.HTMLElement;
        this.CustomEvent = 'CustomEvent' in overrides ? overrides.CustomEvent : g.CustomEvent;
        this.CSSStyleSheet = 'CSSStyleSheet' in overrides ? overrides.CSSStyleSheet : g.CSSStyleSheet;
        this.ShadowRoot = 'ShadowRoot' in overrides ? overrides.ShadowRoot : g.ShadowRoot;
        this.MutationObserver = 'MutationObserver' in overrides ? overrides.MutationObserver : g.MutationObserver;
        this.window = 'window' in overrides ? overrides.window : g.window;
        this.document = 'document' in overrides ? overrides.document : g.document;
        this.location = 'location' in overrides ? overrides.location : g.location;
        this.history = 'history' in overrides ? overrides.history : g.history;
        this.navigator = 'navigator' in overrides ? overrides.navigator : g.navigator;
        this.fetch = 'fetch' in overrides ? overrides.fetch : g.fetch?.bind(g) ?? notImplemented('fetch');
        this.requestAnimationFrame = 'requestAnimationFrame' in overrides ? overrides.requestAnimationFrame : g.requestAnimationFrame?.bind(g) ?? notImplemented('requestAnimationFrame');
        this.cancelAnimationFrame = 'cancelAnimationFrame' in overrides ? overrides.cancelAnimationFrame : g.cancelAnimationFrame?.bind(g) ?? notImplemented('cancelAnimationFrame');
        this.customElements = 'customElements' in overrides ? overrides.customElements : g.customElements;
        this.flushDomRead = this.flushDomRead.bind(this);
        this.flushDomWrite = this.flushDomWrite.bind(this);
        this.domReadQueue = new platform_1.TaskQueue(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
        this.domWriteQueue = new platform_1.TaskQueue(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
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
        this.domReadRequested = true;
        // Yes, this is intentional: the timing of the read can only be "found" by doing a write first.
        // The flushDomWrite queues the read.
        // If/when requestPostAnimationFrame is implemented in browsers, we can use that instead.
        if (this.domWriteHandle === -1) {
            this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
        }
    }
    cancelDomRead() {
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
    flushDomRead() {
        this.domReadHandle = -1;
        if (this.domReadRequested === true) {
            this.domReadRequested = false;
            this.domReadQueue.flush();
        }
    }
    requestDomWrite() {
        this.domWriteRequested = true;
        if (this.domWriteHandle === -1) {
            this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
        }
    }
    cancelDomWrite() {
        this.domWriteRequested = false;
        if (this.domWriteHandle > -1 &&
            // if dom read is requested and there is no readHandle yet, we need the rAF to proceed regardless.
            // The domWriteRequested=false will prevent the read flush from happening.
            (this.domReadRequested === false || this.domReadHandle > -1)) {
            this.cancelAnimationFrame(this.domWriteHandle);
            this.domWriteHandle = -1;
        }
    }
    flushDomWrite() {
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
exports.BrowserPlatform = BrowserPlatform;
//# sourceMappingURL=index.js.map