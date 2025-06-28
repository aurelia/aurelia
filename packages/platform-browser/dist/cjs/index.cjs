"use strict";

var e = require("@aurelia/platform");

class BrowserPlatform extends e.Platform {
    static getOrCreate(e, t = {}) {
        let r = BrowserPlatform.t.get(e);
        if (r === void 0) {
            BrowserPlatform.t.set(e, r = new BrowserPlatform(e, t));
        }
        return r;
    }
    static set(e, t) {
        BrowserPlatform.t.set(e, t);
    }
    get domWriteQueue() {
        return this.domQueue;
    }
    get domReadQueue() {
        return this.domQueue;
    }
    constructor(t, r = {}) {
        super(t, r);
        const notImplemented = e => () => {
            throw new Error(`The PLATFORM did not receive a valid reference to the global function '${e}'.`);
        };
        ("Node Element HTMLElement CustomEvent CSSStyleSheet ShadowRoot MutationObserver " + "window document customElements").split(" ").forEach(e => this[e] = e in r ? r[e] : t[e]);
        "fetch requestAnimationFrame cancelAnimationFrame".split(" ").forEach(e => this[e] = e in r ? r[e] : t[e]?.bind(t) ?? notImplemented(e));
        this.domQueue = (() => {
            let t = false;
            let r = -1;
            const requestDomFlush = () => {
                t = true;
                if (r === -1) {
                    r = this.requestAnimationFrame(flushDomQueue);
                }
            };
            const cancelDomFlush = () => {
                t = false;
                if (r > -1) {
                    this.cancelAnimationFrame(r);
                    r = -1;
                }
            };
            const flushDomQueue = () => {
                r = -1;
                if (t === true) {
                    t = false;
                    o.flush();
                }
            };
            const o = new e.TaskQueue(this, requestDomFlush, cancelDomFlush);
            return o;
        })();
    }
}

BrowserPlatform.t = new WeakMap;

exports.BrowserPlatform = BrowserPlatform;
//# sourceMappingURL=index.cjs.map
