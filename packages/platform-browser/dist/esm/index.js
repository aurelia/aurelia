import { Platform as t, TaskQueue as i } from "@aurelia/platform";

const s = new Map;

function e(t) {
    return function i() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${t}'.`);
    };
}

class BrowserPlatform extends t {
    constructor(t, s = {}) {
        super(t, s);
        this.t = false;
        this.i = -1;
        this.h = false;
        this.l = -1;
        ("Node,Element,HTMLElement,CustomEvent,CSSStyleSheet,ShadowRoot,MutationObserver," + "window,document,location,history,navigator,customElements").split(",").forEach((i => {
            this[i] = i in s ? s[i] : t[i];
        }));
        "fetch,requestAnimationFrame,cancelAnimationFrame".split(",").forEach((i => {
            var h, r;
            this[i] = i in s ? s[i] : null !== (r = null === (h = t[i]) || void 0 === h ? void 0 : h.bind(t)) && void 0 !== r ? r : e(i);
        }));
        this.flushDomRead = this.flushDomRead.bind(this);
        this.flushDomWrite = this.flushDomWrite.bind(this);
        this.domReadQueue = new i(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
        this.domWriteQueue = new i(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
    }
    static getOrCreate(t, i = {}) {
        let e = s.get(t);
        if (void 0 === e) s.set(t, e = new BrowserPlatform(t, i));
        return e;
    }
    static set(t, i) {
        s.set(t, i);
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

export { BrowserPlatform };
//# sourceMappingURL=index.js.map
