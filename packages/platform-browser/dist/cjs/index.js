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
        super(i, e);
        this.t = false;
        this.i = -1;
        this.h = false;
        this.l = -1;
        ("Node,Element,HTMLElement,CustomEvent,CSSStyleSheet,ShadowRoot,MutationObserver," + "window,document,location,history,navigator,customElements").split(",").forEach((t => {
            this[t] = t in e ? e[t] : i[t];
        }));
        "fetch,requestAnimationFrame,cancelAnimationFrame".split(",").forEach((t => {
            var h;
            this[t] = t in e ? e[t] : null !== (h = i[t].bind(i)) && void 0 !== h ? h : s(t);
        }));
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
        this.t = true;
        if (-1 === this.l) this.l = this.requestAnimationFrame(this.flushDomWrite);
    }
    cancelDomRead() {
        this.t = false;
        if (this.i > -1) {
            this.clearTimeout(this.i);
            this.i = -1;
        }
        if (false === this.h && this.l > -1) {
            this.cancelAnimationFrame(this.l);
            this.l = -1;
        }
    }
    flushDomRead() {
        this.i = -1;
        if (true === this.t) {
            this.t = false;
            this.domReadQueue.flush();
        }
    }
    requestDomWrite() {
        this.h = true;
        if (-1 === this.l) this.l = this.requestAnimationFrame(this.flushDomWrite);
    }
    cancelDomWrite() {
        this.h = false;
        if (this.l > -1 && (false === this.t || this.i > -1)) {
            this.cancelAnimationFrame(this.l);
            this.l = -1;
        }
    }
    flushDomWrite() {
        this.l = -1;
        if (true === this.h) {
            this.h = false;
            this.domWriteQueue.flush();
        }
        if (true === this.t && -1 === this.i) this.i = this.setTimeout(this.flushDomRead, 0);
    }
}

exports.BrowserPlatform = BrowserPlatform;
//# sourceMappingURL=index.js.map
