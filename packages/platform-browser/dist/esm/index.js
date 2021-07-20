import { Platform as i, TaskQueue as t } from "@aurelia/platform";

const s = new Map;

function h(i) {
    return function t() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${i}'.`);
    };
}

class BrowserPlatform extends i {
    constructor(i, s = {}) {
        var e, n, o, r, a, l;
        super(i, s);
        this.domReadRequested = false;
        this.domReadHandle = -1;
        this.domWriteRequested = false;
        this.domWriteHandle = -1;
        this.Node = "Node" in s ? s.Node : i.Node;
        this.Element = "Element" in s ? s.Element : i.Element;
        this.HTMLElement = "HTMLElement" in s ? s.HTMLElement : i.HTMLElement;
        this.CustomEvent = "CustomEvent" in s ? s.CustomEvent : i.CustomEvent;
        this.CSSStyleSheet = "CSSStyleSheet" in s ? s.CSSStyleSheet : i.CSSStyleSheet;
        this.ShadowRoot = "ShadowRoot" in s ? s.ShadowRoot : i.ShadowRoot;
        this.MutationObserver = "MutationObserver" in s ? s.MutationObserver : i.MutationObserver;
        this.window = "window" in s ? s.window : i.window;
        this.document = "document" in s ? s.document : i.document;
        this.location = "location" in s ? s.location : i.location;
        this.history = "history" in s ? s.history : i.history;
        this.navigator = "navigator" in s ? s.navigator : i.navigator;
        this.fetch = "fetch" in s ? s.fetch : null !== (n = null === (e = i.fetch) || void 0 === e ? void 0 : e.bind(i)) && void 0 !== n ? n : h("fetch");
        this.requestAnimationFrame = "requestAnimationFrame" in s ? s.requestAnimationFrame : null !== (r = null === (o = i.requestAnimationFrame) || void 0 === o ? void 0 : o.bind(i)) && void 0 !== r ? r : h("requestAnimationFrame");
        this.cancelAnimationFrame = "cancelAnimationFrame" in s ? s.cancelAnimationFrame : null !== (l = null === (a = i.cancelAnimationFrame) || void 0 === a ? void 0 : a.bind(i)) && void 0 !== l ? l : h("cancelAnimationFrame");
        this.customElements = "customElements" in s ? s.customElements : i.customElements;
        this.flushDomRead = this.flushDomRead.bind(this);
        this.flushDomWrite = this.flushDomWrite.bind(this);
        this.domReadQueue = new t(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
        this.domWriteQueue = new t(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
    }
    static getOrCreate(i, t = {}) {
        let h = s.get(i);
        if (void 0 === h) s.set(i, h = new BrowserPlatform(i, t));
        return h;
    }
    static set(i, t) {
        s.set(i, t);
    }
    requestDomRead() {
        this.domReadRequested = true;
        if (-1 === this.domWriteHandle) this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
    }
    cancelDomRead() {
        this.domReadRequested = false;
        if (this.domReadHandle > -1) {
            this.clearTimeout(this.domReadHandle);
            this.domReadHandle = -1;
        }
        if (false === this.domWriteRequested && this.domWriteHandle > -1) {
            this.cancelAnimationFrame(this.domWriteHandle);
            this.domWriteHandle = -1;
        }
    }
    flushDomRead() {
        this.domReadHandle = -1;
        if (true === this.domReadRequested) {
            this.domReadRequested = false;
            this.domReadQueue.flush();
        }
    }
    requestDomWrite() {
        this.domWriteRequested = true;
        if (-1 === this.domWriteHandle) this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
    }
    cancelDomWrite() {
        this.domWriteRequested = false;
        if (this.domWriteHandle > -1 && (false === this.domReadRequested || this.domReadHandle > -1)) {
            this.cancelAnimationFrame(this.domWriteHandle);
            this.domWriteHandle = -1;
        }
    }
    flushDomWrite() {
        this.domWriteHandle = -1;
        if (true === this.domWriteRequested) {
            this.domWriteRequested = false;
            this.domWriteQueue.flush();
        }
        if (true === this.domReadRequested && -1 === this.domReadHandle) this.domReadHandle = this.setTimeout(this.flushDomRead, 0);
    }
}

export { BrowserPlatform };
//# sourceMappingURL=index.js.map
