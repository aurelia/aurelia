"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var t = require("@aurelia/platform");

const i = new Map;

function s(t) {
    return function i() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${t}'.`);
    };
}

class BrowserPlatform extends t.Platform {
    constructor(i, e = {}) {
        var h, n, r, o, a, l;
        super(i, e);
        this.domReadRequested = false;
        this.domReadHandle = -1;
        this.domWriteRequested = false;
        this.domWriteHandle = -1;
        this.Node = "Node" in e ? e.Node : i.Node;
        this.Element = "Element" in e ? e.Element : i.Element;
        this.HTMLElement = "HTMLElement" in e ? e.HTMLElement : i.HTMLElement;
        this.CustomEvent = "CustomEvent" in e ? e.CustomEvent : i.CustomEvent;
        this.CSSStyleSheet = "CSSStyleSheet" in e ? e.CSSStyleSheet : i.CSSStyleSheet;
        this.ShadowRoot = "ShadowRoot" in e ? e.ShadowRoot : i.ShadowRoot;
        this.MutationObserver = "MutationObserver" in e ? e.MutationObserver : i.MutationObserver;
        this.window = "window" in e ? e.window : i.window;
        this.document = "document" in e ? e.document : i.document;
        this.location = "location" in e ? e.location : i.location;
        this.history = "history" in e ? e.history : i.history;
        this.navigator = "navigator" in e ? e.navigator : i.navigator;
        this.fetch = "fetch" in e ? e.fetch : null !== (n = null === (h = i.fetch) || void 0 === h ? void 0 : h.bind(i)) && void 0 !== n ? n : s("fetch");
        this.requestAnimationFrame = "requestAnimationFrame" in e ? e.requestAnimationFrame : null !== (o = null === (r = i.requestAnimationFrame) || void 0 === r ? void 0 : r.bind(i)) && void 0 !== o ? o : s("requestAnimationFrame");
        this.cancelAnimationFrame = "cancelAnimationFrame" in e ? e.cancelAnimationFrame : null !== (l = null === (a = i.cancelAnimationFrame) || void 0 === a ? void 0 : a.bind(i)) && void 0 !== l ? l : s("cancelAnimationFrame");
        this.customElements = "customElements" in e ? e.customElements : i.customElements;
        this.flushDomRead = this.flushDomRead.bind(this);
        this.flushDomWrite = this.flushDomWrite.bind(this);
        this.domReadQueue = new t.TaskQueue(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
        this.domWriteQueue = new t.TaskQueue(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
    }
    static getOrCreate(t, s = {}) {
        let e = i.get(t);
        if (void 0 === e) i.set(t, e = new BrowserPlatform(t, s));
        return e;
    }
    static set(t, s) {
        i.set(t, s);
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

exports.BrowserPlatform = BrowserPlatform;
//# sourceMappingURL=index.js.map
